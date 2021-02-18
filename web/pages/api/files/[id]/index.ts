import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect, { NextHandler } from "next-connect";
import { downloadMiddleware } from "../../../../src/middlewares/gridfs";
import { deleteFile } from "../../../../src/lib/file";

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

function validateId(
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextHandler
) {
  const {
    query: { id },
  } = req;
  if (Array.isArray(id)) {
    res.status(404);
    res.end();
    return;
  }
  next();
}

async function download(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { id },
    } = req;
    await downloadMiddleware(id as string, res);
  } catch (e) {
    res.statusCode = 500;
    res.json({
      message: e,
    });
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      query: { id },
    } = req;
    if (Array.isArray(id)) {
      res.statusCode = 400;
      res.end();
      return;
    }
    const fileId = await deleteFile(id);
    res.statusCode = 200;
    res.json({ id: fileId });
  } catch (e) {
    res.statusCode = 500;
    res.json({
      message: e,
    });
  }
}

apiRoute.get(validateId, download);
apiRoute.delete(validateId, remove);

export default apiRoute;
