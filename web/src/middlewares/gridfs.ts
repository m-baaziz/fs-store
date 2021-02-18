import multer from "multer";
import { GridFSBucket, ObjectID } from "mongodb";
import { ServerResponse } from "http";

import { getStorage } from "../lib/connection";
import { getFile } from "../lib/file";

export async function uploadMiddleware() {
  try {
    return multer({ storage: await getStorage() });
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function downloadMiddleware(id: string, res: ServerResponse) {
  try {
    const storage = await getStorage();
    const bucket = new GridFSBucket(storage.db);
    const stream = bucket.openDownloadStream(new ObjectID(id));
    const file = await getFile(id);

    res.statusCode = 200;
    res.setHeader("Content-Type", file.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.filename}"`
    );
    stream.on("error", (err) => {
      if (err.name === "ENOENT") {
        res.statusCode = 404;
        res.write("File not found");
        res.end();
        return;
      }
      res.statusCode = 500;
      res.write(err.message);
      res.end();
    });
    stream.pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.write(e);
    res.end();
  }
}
