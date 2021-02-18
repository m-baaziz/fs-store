import { MongoClient } from "mongodb";
import GridFsStorage from "multer-gridfs-storage";

let connection: MongoClient | undefined = undefined;
let storage: GridFsStorage | undefined = undefined;

export async function getConnection(): Promise<MongoClient> {
  try {
    if (connection) return connection;
    connection = await MongoClient.connect(process.env["MONGODB_URL"]);
    return connection;
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function getStorage(): Promise<GridFsStorage> {
  if (storage !== undefined) return storage;

  const client = await getConnection();
  const db = client.db(process.env["MONGODB_DATABASE"]);

  storage = new GridFsStorage({
    db,
    client,
    file: (req, file) => ({
      filename: file.originalname,
    }),
  });
  return storage;
}
