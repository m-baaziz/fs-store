extern crate hyper;
extern crate hyper_multipart_rfc7578 as hyper_multipart;

use hyper::{body::Buf, Body, Client, Method, Request};
use hyper_multipart::client::multipart;
use serde::{Deserialize, Serialize};
use serde_json::json;

pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct StoreFile {
    pub id: String,
    pub filename: String,
    pub contentType: String,
    pub size: i32,
    pub uploadDate: String,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteFilesResponse {
    pub ids: Vec<String>,
    pub errors: Vec<String>,
}

pub async fn list_files(server_url: &String) -> Result<Vec<StoreFile>> {
    let client = Client::new();
    let uri = (String::from(server_url) + "/api/files").parse()?;
    let res = client.get(uri).await?;

    let body = hyper::body::aggregate(res).await?;
    let store_files = serde_json::from_reader(body.reader())?;

    Ok(store_files)
}

pub async fn upload_file(server_url: &String, file_path: &String) -> Result<StoreFile> {
    let uri = String::from(server_url) + "/api/files";
    let client = Client::builder().build_http();
    let mut form = multipart::Form::default();

    let mime_type = mime_guess::from_path(file_path)
        .first()
        .unwrap_or(mime_guess::mime::TEXT_PLAIN);

    form.add_file_with_mime("file", file_path, mime_type)?;

    let req_builder = Request::post(uri);
    let req = form.set_body::<multipart::Body>(req_builder)?;
    match client.request(req).await {
        Ok(res) => {
            let body = hyper::body::aggregate(res).await?;
            let store_file: StoreFile = serde_json::from_reader(body.reader())?;
            Ok(store_file)
        }
        Err(er) => {
            let error: Box<dyn std::error::Error + Send + Sync> = er.to_string().into();
            Err(error)
        }
    }
}

pub async fn delete_files(server_url: &String, ids: &Vec<String>) -> Result<DeleteFilesResponse> {
    let uri = String::from(server_url) + "/api/files";
    let delete_body = json!({ "ids": ids });
    let req = Request::builder()
        .method(Method::DELETE)
        .uri(uri)
        .header("content-type", "application/json")
        .body(Body::from(delete_body.to_string()))?;

    let client = Client::new();
    match client.request(req).await {
        Ok(res) => {
            let body = hyper::body::aggregate(res).await?;
            let response: DeleteFilesResponse = serde_json::from_reader(body.reader())?;
            Ok(response)
        }
        Err(er) => {
            let error: Box<dyn std::error::Error + Send + Sync> = er.to_string().into();
            Err(error)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, Serialize, Deserialize)]
    struct TestConfig {
        api_url: String,
    }

    impl Default for TestConfig {
        fn default() -> Self {
            Self {
                api_url: String::from("http://localhost:4000"),
            }
        }
    }

    static TEST_CONFIG_NAME: &str = "test";

    #[actix_rt::test]
    async fn test_upload_file() {
        let config: TestConfig = confy::load(TEST_CONFIG_NAME).unwrap();
        let url = config.api_url;
        let file_url = String::from(file!());
        let before_store_files = list_files(&url).await.unwrap();
        let new_store_file = upload_file(&url, &file_url).await.unwrap();
        let after_store_files = list_files(&url).await.unwrap();
        let _ = delete_files(&url, &vec![new_store_file.id]).await.unwrap();

        assert!(after_store_files.len() > before_store_files.len());
        assert_eq!(new_store_file.filename, "lib.rs");
    }
    #[actix_rt::test]
    async fn test_list_files() {
        let config: TestConfig = confy::load(TEST_CONFIG_NAME).unwrap();
        let url = config.api_url;
        let file_url = String::from(file!());
        let new_store_file = upload_file(&url, &file_url).await.unwrap();
        let store_files = list_files(&url).await.unwrap();
        let _ = delete_files(&url, &vec![new_store_file.id]).await.unwrap();

        assert!(store_files.len() > 0);
    }

    #[actix_rt::test]
    async fn test_delete_files() {
        let config: TestConfig = confy::load(TEST_CONFIG_NAME).unwrap();
        let url = config.api_url;
        let file_url = String::from(file!());
        let new_store_file = upload_file(&url, &file_url).await.unwrap();
        let ids_to_delete = vec![new_store_file.id.clone()];
        let delete_response = delete_files(&url, &ids_to_delete).await.unwrap();

        assert_eq!(delete_response.ids.len(), 1);
        assert_eq!(delete_response.ids[0], new_store_file.id);
        assert_eq!(delete_response.errors.len(), 0);
    }
}
