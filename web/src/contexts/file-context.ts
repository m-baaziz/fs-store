import React from "react";

import { StoreFile } from "../types/file";

export type FileContext = {
  files: StoreFile[];
  uploadFile: (file: File) => Promise<StoreFile>;
  deleteFiles: (ids: string[]) => Promise<[string[], string[]]>;
};

const fileContext = React.createContext<FileContext>({
  files: [],
  uploadFile: () => Promise.reject(),
  deleteFiles: () => Promise.reject(),
});

export default fileContext;
