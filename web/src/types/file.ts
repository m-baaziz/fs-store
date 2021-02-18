export enum Error {
  INVALID_ID = "Invalid ID",
  INVALID_PATH = "Invalid Path",
  NOT_FOUND = "File not found",
  UNEXPECTED_NUMBER = "Unexpected number of files",
}

export type StoreFile = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  uploadDate: Date;
};
