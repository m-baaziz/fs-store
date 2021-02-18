import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect, { NextHandler } from "next-connect";
import { ClientRequest, ServerResponse } from "http";

import { parseStoreFile, listFiles, deleteFiles } from "../../../src/lib/file";
import { uploadMiddleware } from "../../../src/middlewares/gridfs";
import { StoreFile } from "../../../src/types/file";

export const config = {
  api: {
    bodyParser: false,
  },
};

const apiRoute = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse) {
    res.status(501).json({ error: error.message });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

async function list(req: NextApiRequest, res: NextApiResponse) {
  try {
    const files = await listFiles();
    res.statusCode = 200;
    res.json(files);
  } catch (e) {
    res.statusCode = 500;
    res.json({
      message: e,
    });
  }
}

async function upload(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  const middleware = await uploadMiddleware();
  nextConnect().use(middleware.single("file")).handle(req, res, next);
}

async function afterUpload(req: ClientRequest, res: ServerResponse) {
  let content = "";
  try {
    res.statusCode = 200;
    const file: StoreFile = parseStoreFile(req["file"]);
    res.setHeader("Content-Type", "application/json");
    content = JSON.stringify(file);
  } catch (e) {
    content = JSON.stringify({ message: e });
  } finally {
    res.write(content);
    res.end();
  }
}

async function deleteFilesHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ids } = req.body;
    const [deletedIds, errors] = await deleteFiles(ids);
    res.statusCode = 200;
    res.json({
      ids: deletedIds,
      errors,
    });
  } catch (e) {
    res.statusCode = 500;
    res.json({
      message: e,
    });
  }
}

apiRoute.get(list);
apiRoute.post(upload, afterUpload);
apiRoute.delete(deleteFilesHandler);

export default apiRoute;
