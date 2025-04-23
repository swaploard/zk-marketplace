import cloudinary from '@/utils/config/cloudinary';
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}-${file.name}`;
    const sanitizedName = filename
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9-_.]/g, '')
      .toLowerCase();

    // Convert buffer to base64 string
    const base64String = buffer.toString('base64');
    const uploadStr = `data:${file.type};base64,${base64String}`;

    const uploadResult = await cloudinary.uploader.upload(uploadStr, {
      public_id: sanitizedName,
      resource_type: 'auto',
    });

    return uploadResult.secure_url;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}
