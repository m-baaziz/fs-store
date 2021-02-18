import next from "next";
import path from "path";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import http from "http";
import request from "supertest";

import { StoreFile } from "../../src/types/file";
import { listFiles, getFile, deleteFiles } from "../../src/lib/file";
import { FILES_ATTACHMENT_KEY } from "../../src/constants/file";
import { getConnection } from "../../src/lib/connection";

import filesApiRoute from "../../pages/api/files";

const ASSETS_DIR = path.join(__dirname, "..", "assets");

function createTestServer(): http.Server {
  const requestListener = async (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      filesApiRoute.handle(req, res, (err) => {
        if (err) {
          reject(err);
          return;
        }
        return;
      });
    });
  };

  return http.createServer(requestListener);
}

describe("files management", () => {
  let uploadedFiles: StoreFile[] = [];

  async function uploadFiles(
    filepath: string
  ): Promise<[request.Response, StoreFile]> {
    try {
      const response = await request
        .agent(createTestServer())
        .post("/")
        .set({ connection: "keep-alive" })
        .attach(FILES_ATTACHMENT_KEY, filepath);

      const file = JSON.parse(response.text) as StoreFile;
      uploadedFiles.push(file);
      return Promise.resolve([response, file]);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  beforeAll((done) => {
    setTimeout(() => {
      next({});
      done();
    }, 1000);
  });

  afterAll(async (done) => {
    try {
      const connection = await getConnection();
      await connection.db(process.env["MONGODB_DATABASE"]).dropDatabase();
      await connection.close();
    } catch (e) {
      console.log(e);
    } finally {
      done();
    }
  });

  afterEach(async (done) => {
    try {
      const [deletedIds, errors] = await deleteFiles(
        uploadedFiles.map((f) => f.id)
      );
      uploadedFiles = uploadedFiles.filter((f) => !deletedIds.includes(f.id));
      if (errors.length > 0) {
        console.log(errors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  });

  test("list", async (done) => {
    const result = await listFiles();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toEqual(0);

    const filename = "logo_react.png";
    const [response, uploadedFile] = await uploadFiles(
      path.join(ASSETS_DIR, filename)
    );

    expect(response.status).toEqual(200);

    const files = await listFiles();
    expect(files.length).toEqual(1);
    expect(files[0].filename).toEqual(filename);
    expect(uploadedFile.filename).toEqual(filename);

    done();
  });

  test("get", async (done) => {
    const filename = "logo_react.png";
    const [response, uploadedFile] = await uploadFiles(
      path.join(ASSETS_DIR, filename)
    );

    expect(response.status).toEqual(200);

    const filePromise = getFile(uploadedFile.id).then((f) => f.filename);
    expect(filePromise).resolves.toEqual(filename);

    done();
  });

  test("upload", async (done) => {
    const filename = "lorem.txt";
    const filepath = path.join(ASSETS_DIR, filename);
    const filesize = fs.statSync(filepath).size;
    const [response, file] = await uploadFiles(path.join(ASSETS_DIR, filename));

    expect(response.status).toEqual(200);
    expect(file.filename).toEqual(filename);
    expect(file.size).toEqual(filesize);

    done();
  });

  test("delete", async (done) => {
    const filename = "random.json";
    const filepath = path.join(ASSETS_DIR, filename);
    const [response, file] = await uploadFiles(filepath);
    expect(response.status).toEqual(200);
    const files = await listFiles();
    expect(files.length).toEqual(1);

    const invalidId = "invalid_id";

    const [deletedIds, errors] = await deleteFiles([invalidId]);
    expect(deletedIds.length).toEqual(0);
    expect(errors.length).toEqual(1);

    const [newDeletedFiles, newErrors] = await deleteFiles([file.id]);

    expect(newDeletedFiles.length).toEqual(1);
    expect(newErrors.length).toEqual(0);
    expect(newDeletedFiles[0]).toEqual(file.id);

    const newFiles = await listFiles();
    expect(newFiles.length).toEqual(0);

    done();
  });
});
