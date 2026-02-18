import { BookmarkManager } from '@/core/bookmark-manager';

import { readdir } from 'node:fs/promises';

// read all the files in the current directory, recursively
export class BookmarkManagerFacade {
  async getFilesInDirectory(path: string) {
    const files = await readdir(path, { recursive: true });
    return files
      .filter((file) => {
        const fileName = file.slice(file.lastIndexOf('\\') + 1);
        if (!fileName.includes('.')) {
          return false;
        }
        return true;
      })
      .map((b) => {
        return path + b;
      });
  }

  async load(path: string): Promise<BookmarkManager> {
    const bookmarkManager = new BookmarkManager(path);
    await bookmarkManager.loadBookmarks();

    return bookmarkManager;
  }
}
