import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK(
  process.env.NEXT_PUBLIC_PINATA_API_KEY,
  process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY
);

// Upload File to IPFS
export const uploadFileToIPFS = async (file: File) => {
  try {
    const result = await pinata.pinFileToIPFS(file);
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

// Upload JSON Metadata to IPFS
export const uploadMetadataToIPFS = async (metadata: object) => {
  try {
    const result = await pinata.pinJSONToIPFS(metadata);
    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return null;
  }
};