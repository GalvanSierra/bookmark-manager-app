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

  public findById(id: string): Bookmark | undefined {
    return this.bookmarks.get(id);
  }

  public update(id: string, updatedBookmark: Bookmark): Bookmark | null {
    const existing = this.findById(id);

    if (!existing) return null;

    const urlChanged = existing.url !== updatedBookmark.url;

    if (urlChanged) {
      this.removeFromUrlIndex(existing.url);
      this.addToUrlIndex(updatedBookmark.url, id);
    }

    this.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }

  public updateMany(bookmarks: Bookmark[]): number {
    let updated = 0;
    for (const bookmark of bookmarks) {
      if (this.update(bookmark.id, bookmark)) updated++;
    }
    return updated;
  }

  public delete(id: string): boolean {
    return this.bookmarks.delete(id);
  }

  public deleteMany(ids: string[]): number {
    let deleted = 0;
    for (const id of ids) {
      if (this.delete(id)) deleted++;
    }
    return deleted;
  }

  public getAll(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  public clear(): void {
    this.bookmarks.clear();
    this.urlIndex.clear();
  }

  private addToUrlIndex(url: string, id: string): void {
    this.urlIndex.set(url, id);
  }

  private removeFromUrlIndex(url: string): boolean {
    return this.urlIndex.delete(url);
  }

  private urlExists(url: string): boolean {
    return this.urlIndex.has(url);
  }
}
