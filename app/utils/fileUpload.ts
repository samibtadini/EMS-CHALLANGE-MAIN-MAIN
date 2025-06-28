import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    throw new Error('Failed to create upload directory');
  }
}

export async function handleFileUpload(file: File, fileType: 'photo' | 'cv' | 'id'): Promise<string> {
  await ensureUploadsDir();
  
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error(`File too large (max ${MAX_SIZE/1024/1024}MB)`);
  }

  // Validate file extensions
  const validExtensions = {
    photo: ['.jpg', '.jpeg', '.png', '.webp'],
    cv: ['.pdf', '.doc', '.docx'],
    id: ['.pdf', '.jpg', '.jpeg', '.png']
  };
  
  const extension = path.extname(file.name).toLowerCase();
  if (!validExtensions[fileType].includes(extension)) {
    throw new Error(`Invalid file type for ${fileType}. Allowed: ${validExtensions[fileType].join(', ')}`);
  }

  // Generate unique filename
  const filename = `${uuidv4()}${extension}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  try {
    const buffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(buffer));
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving file:', err);
    throw new Error('Failed to save file');
  }
}