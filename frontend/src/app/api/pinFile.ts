import { NextApiRequest, NextApiResponse } from "next";
import { uploadFileToIPFS } from "../../utils/config/pinata";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const file = req.body.file; // Get file from FormData
      const ipfsHash = await uploadFileToIPFS(file);
      res.status(200).json({ ipfsHash });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}