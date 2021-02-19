extern crate hyper;
use clap::Clap;
use std::fs;
use std::path::PathBuf;

/// This doc string acts as a help message when the user runs '--help'
/// as do all doc strings on fields
#[derive(Clap)]
#[clap(version = "1.0", author = "Mohamed B. <mhabaaziz@gmail.com>")]
struct Opts {
    /// Specify API url.
    #[clap(short, long, default_value = "http://localhost:3000")]
    url: String,
    #[clap(subcommand)]
    subcmd: SubCommand,
}

#[derive(Clap)]
enum SubCommand {
    List(List),
    Upload(Upload),
    Delete(Delete),
}

#[derive(Clap)]
struct List {}
#[derive(Clap)]
struct Upload {
    filepath: String,
}

#[derive(Clap)]
struct Delete {
    ids: Vec<String>,
}

#[tokio::main]
async fn main() -> fs_store::Result<()> {
    let opts: Opts = Opts::parse();

    match opts.subcmd {
        SubCommand::List(_) => {
            let store_files = fs_store::list_files(&opts.url).await?;
            let pretty_string = serde_json::to_string_pretty(&store_files)?;
            println!("{}", pretty_string);
        }
        SubCommand::Upload(payload) => {
            match fs::canonicalize(&PathBuf::from(payload.filepath.clone())) {
                Ok(abs_file_path) => match abs_file_path.into_os_string().into_string() {
                    Ok(str_abs_file_path) => {
                        let store_file =
                            fs_store::upload_file(&opts.url, &str_abs_file_path).await?;
                        let pretty_string = serde_json::to_string_pretty(&store_file)?;
                        println!("{}", pretty_string);
                    }
                    _ => {
                        println!("Invalid path : {}", payload.filepath);
                    }
                },
                _ => {
                    println!("Invalid path : {}", payload.filepath);
                }
            }
        }
        SubCommand::Delete(payload) => {
            let delete_response = fs_store::delete_files(&opts.url, &payload.ids).await?;
            let pretty_string = serde_json::to_string_pretty(&delete_response)?;
            println!("{}", pretty_string);
        }
    }

    Ok(())
}
