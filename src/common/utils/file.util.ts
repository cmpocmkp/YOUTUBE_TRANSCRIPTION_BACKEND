import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

export class FileUtil {
  static async ensureDirectoryExists(dirPath: string): Promise<void> {
    const dirExists = await exists(dirPath);
    if (!dirExists) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fileExists = await exists(filePath);
      if (fileExists) {
        await unlink(filePath);
      }
    } catch (error) {
      // Ignore errors when deleting temp files
    }
  }

  static getTempDir(): string {
    return path.join(process.cwd(), 'tmp');
  }

  static getTempFilePath(extension: string): string {
    const tempDir = this.getTempDir();
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    return path.join(tempDir, filename);
  }
}

