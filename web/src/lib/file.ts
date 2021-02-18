import has from "lodash/has";
import { GridFSBucket, ObjectID } from "mongodb";

import { getStorage } from "./connection";
import { StoreFile, Error as FileError } from "../types/file";

export function parseStoreFile(doc: Record<string, unknown>): StoreFile {
  return {
    id: (has(doc, "_id") ? doc._id : doc.id) as string,
    filename: doc.filename as string,
    contentType: doc.contentType as string,
    size: (has(doc, "size") ? doc.size : doc.length) as number,
    uploadDate: doc.uploadDate as Date,
  };
}

export async function getFile(id: string): Promise<StoreFile> {
  try {
    const storage = await getStorage();
    const bucket = new GridFSBucket(storage.db);
    const docs = await bucket.find({ _id: new ObjectID(id) }).toArray();
    if (docs.length === 0)
      return Promise.reject(`${FileError.NOT_FOUND} (${id})`);
    if (docs.length > 1)
      return Promise.reject(`${FileError.UNEXPECTED_NUMBER}`);
    const file: StoreFile = parseStoreFile(docs[0]);
    return Promise.resolve(file);
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function listFiles(): Promise<StoreFile[]> {
  try {
    const storage = await getStorage();
    const bucket = new GridFSBucket(storage.db);
    const docs = await bucket.find({}).toArray();
    const files: StoreFile[] = docs.map(parseStoreFile);
    return Promise.resolve(files);
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function deleteFile(id: string): Promise<string> {
  try {
    const storage = await getStorage();
    const bucket = new GridFSBucket(storage.db);
    return new Promise((resolve, reject) => {
      const objId = new ObjectID(id);
      bucket.delete(objId, (err) => {
        if (err) {
          if (err.message.startsWith("FileNotFound")) {
            reject(`${FileError.NOT_FOUND} (${objId})`);
            return;
          }
          reject(err);
          return;
        }
        resolve(id);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function deleteFiles(
  ids: string[]
): Promise<[string[], string[]]> {
  try {
    const deletedIds: string[] = [];
    const errors: string[] = [];
    const promises = ids.map((id) =>
      deleteFile(id)
        .then((id) => {
          deletedIds.push(id);
        })
        .catch((error) => {
          errors.push(error);
          return Promise.resolve();
        })
    );
    await Promise.all(promises);
    return Promise.resolve([deletedIds, errors]);
  } catch (e) {
    return Promise.reject(e);
  }
}
