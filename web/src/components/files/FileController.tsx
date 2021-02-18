import React from "react";
import useSWR from "swr";
import { fetcherFn } from "swr/dist/types";
import Head from "next/head";

import { StoreFile } from "../../types/file";
import { FILES_ATTACHMENT_KEY, API_FILES_URL } from "../../constants/file";
import FileContext from "../../contexts/file-context";

const REFRESH_INTERVAL = 1000;

const parseStoreFile = (obj: Record<string, unknown>): StoreFile => ({
  id: obj.id as string,
  filename: obj.filename as string,
  contentType: obj.contentType as string,
  size: obj.size as number,
  uploadDate: obj.uploadDate as Date,
});

const filesFetcher: fetcherFn<StoreFile[]> = async (input, ...args) => {
  try {
    return fetch(input, ...args)
      .then((res) => res.json())
      .then((files) => files.map(parseStoreFile));
  } catch (e) {
    return Promise.reject(e);
  }
};

type GameControllerProps = {
  onError: (error: string) => void;
};

export default function GameController(
  props: React.PropsWithChildren<GameControllerProps>
): React.ReactElement {
  const { children, onError } = props;
  const [files, setFiles] = React.useState<StoreFile[]>([]);
  const { data, error } = useSWR(API_FILES_URL, filesFetcher, {
    refreshInterval: REFRESH_INTERVAL,
  });

  React.useEffect(() => {
    setFiles(data);
  }, [setFiles, data]);

  React.useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [onError, error]);

  const uploadFile = async (file: File): Promise<StoreFile> => {
    try {
      const formData = new FormData();
      formData.append(FILES_ATTACHMENT_KEY, file);
      const result = await fetch(API_FILES_URL, {
        method: "POST",
        body: formData,
      });
      const json = await result.json();
      const newFile = parseStoreFile(json);
      setFiles([...files, newFile]);
      return newFile;
    } catch (e) {
      onError(e);
      return Promise.reject(e);
    }
  };

  const deleteFiles = async (ids: string[]): Promise<[string[], string[]]> => {
    try {
      const result = await fetch(API_FILES_URL, {
        method: "DELETE",
        body: JSON.stringify({ ids }),
        headers: { "Content-Type": "application/json" },
      }).then((res) => res.json());
      if (Array.isArray(result.errors) && result.errors.length > 0) {
        onError(result.errors.join("\n"));
      }
      return [result.ids, result.errors];
    } catch (e) {
      onError(e);
      return Promise.reject(e);
    }
  };

  return (
    <FileContext.Provider
      value={{
        files: files || [],
        uploadFile,
        deleteFiles,
      }}
    >
      <>
        <Head key="file-controller">
          <link
            rel="preload"
            href={API_FILES_URL}
            as="fetch"
            crossOrigin="anonymous"
          />
        </Head>
        {children}
      </>
    </FileContext.Provider>
  );
}
