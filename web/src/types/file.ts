export enum Error {
  INVALID_ID = "Invalid ID",
  INVALID_PATH = "Invalid Path",
  NOT_FOUND = "File not found",
}

export type StoreFile = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: Date;
};
