import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

export async function saveFile(file: File) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${uuidv4()}-${file.name}`;
      const sanitizedName = filename
      .replace(/\s+/g, '_')     
      .replace(/[^a-zA-Z0-9-_.]/g, '') 
      .toLowerCase(); 
      const filepath = path.join(UPLOAD_DIR, sanitizedName);
      
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(filepath, buffer);
      
      return `/uploads/${sanitizedName}`;
    } catch (error) {
      throw new Error("Failed to save file");
    }
  }