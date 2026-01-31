import { BookmarkManager } from '@/core/bookmark-manager';

export class BookmarkManagerFacade {
  async load(path: string): Promise<BookmarkManager> {
    const bookmarkManager = new BookmarkManager(path);
    await bookmarkManager.loadBookmarks();

    return bookmarkManager;
  }
}
