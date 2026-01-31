import { Logger } from '@/utils/logger';
import { rm } from 'node:fs/promises';

export class FileHandler {
  private logger = new Logger();

  async read(path: string): Promise<string> {
    const file = Bun.file(path);
    const exists = await file.exists();

    if (!exists) {
      this.logger.error(`File does not exist: ${path}`);
      throw new Error(`File does not exist: ${path}`);
    }

    try {
      return await file.text();
    } catch (error) {
      this.logger.error(`Failed to read file: ${error}`, { filePath: path });
      throw error;
    }
  }

  async write(destination: string, content: string): Promise<void> {
    try {
      await Bun.write(destination, content);
    } catch (error) {
      this.logger.error(`Failed to write file: ${error}`, { filePath: destination });
      throw error;
    }
  }

  async delete(path: string): Promise<void> {
    try {
      await rm(path, { recursive: true, force: true });
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error}`, { filePath: path });
      throw error;
    }
  }
}
