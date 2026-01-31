import type { Bookmark } from '@/types/bookmark';

export class BookmarkService {
  private bookmarks = new Map<string, Bookmark>();
  private urlIndex = new Map<string, string>();

  public create(bookmark: Bookmark): Bookmark | null {
    if (this.urlExists(bookmark.url)) return null;

    this.bookmarks.set(bookmark.id, bookmark);
    this.urlIndex.set(bookmark.url, bookmark.id);

    return bookmark;
  }

  public createMany(bookmarks: Bookmark[]): number {
    let created = 0;

    for (const bookmark of bookmarks) {
      if (this.create(bookmark) !== null) created++;
    }

    return created;
  }

  public getAll(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  private urlExists(url: string): boolean {
    return this.urlIndex.has(url);
  }
}
