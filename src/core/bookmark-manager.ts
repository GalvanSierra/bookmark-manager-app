import { HtmlParser } from '@/parsers/html-parser';
import { BookmarkService } from '@/services/bookmark.service';
import type { Bookmark, SearchOptions } from '@/types/bookmark';
import { FileHandler } from '@/utils/file-handler';
import { Logger } from '@/utils/logger';

export class BookmarkManager {
  private service = new BookmarkService();

  private parser = new HtmlParser();
  private fileHandler = new FileHandler();
  private logger = new Logger();

  constructor(private path: string) {}

  public async loadBookmarks(): Promise<void> {
    try {
      const content = await this.fileHandler.read(this.path);
      const bookmarks = this.parser.parse(content);

      const created = this.service.createMany(bookmarks);
      const total = this.service.getAll().length;

      this.logger.info(`Loaded ${total} bookmarks (${created} new)`);
    } catch (error) {
      this.logger.error('Failed to load bookmarks', error);
    }
  }

  public async saveBookmarks(): Promise<void> {
    try {
      const bookmarks = this.service.getAll();

      if (bookmarks.length === 0) {
        this.logger.warn('No bookmarks to save');
      }

      const htmlContent = this.parser.serialize(bookmarks);
      await this.fileHandler.write(this.path, htmlContent);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${this.path}`);
    } catch (error) {
      this.logger.error('Failed to save bookmarks', error);
    }
  }

  public async saveOutputBookmarks(bookmarks: Bookmark[], fileName: string): Promise<void> {
    if (bookmarks.length === 0) {
      this.logger.warn('No bookmarks to save');
    }

    const targetPath = `data/staged/${fileName}.html`;

    try {
      const htmlContent = this.parser.serialize(bookmarks);
      await this.fileHandler.write(targetPath, htmlContent);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${targetPath}`);
    } catch (error) {
      this.logger.error('Failed to save output bookmarks', error);
    }
  }

  public async deleteFile(): Promise<void> {
    try {
      await this.fileHandler.delete(this.path);
      this.logger.info(`Deleted file: ${this.path}`);
    } catch (error) {
      this.logger.error('Failed to delete file', error);
    }
  }

  // Operations CRUD
  public addBookmark(bookmark: Bookmark): Bookmark | null {
    return this.service.create(bookmark);
  }

  public addBookmarks(bookmarks: Bookmark[], folder?: string): number {
    if (bookmarks.length === 0) {
      this.logger.error('No bookmarks provided');
      return 0;
    }

    const bookmarksToAdd = folder ? bookmarks.map((b) => ({ ...b, folder })) : bookmarks;
    const created = this.service.createMany(bookmarksToAdd);

    this.logger.info(`Added ${created} of ${bookmarks.length} bookmarks`);
    return created;
  }

  public updateBookmark(id: string, bookmark: Bookmark): Bookmark | null {
    const updated = this.service.update(id, bookmark);

    if (updated === null) return null;

    this.logger.debug(`Updated bookmark: ${id}`);
    return updated;
  }

  public updateBookmarks(bookmarks: Bookmark[]): number {
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      this.logger.error('No bookmarks provided');
      return 0;
    }

    const updated = this.service.updateMany(bookmarks);

    this.logger.info(`Updated ${updated} of ${bookmarks.length} bookmarks`);

    return updated;
  }

  public deleteBookmark(id: string): boolean {
    const deleted = this.service.delete(id);

    if (!deleted) {
      this.logger.error(`Failed to delete bookmark: ${id}`);
    }

    return deleted;
  }

  public deleteBookmarks(bookmarks: Bookmark[], key: 'id' | 'url' = 'id'): number {
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      this.logger.error('No bookmarks provided');
      return 0;
    }

    let ids: string[];

    if (key === 'url') {
      ids = bookmarks
        .map((b) => this.service.findByUrl(b.url))
        .filter((id): id is string => id !== undefined);
    } else {
      ids = bookmarks.map((b) => b.id);
    }

    const deleted = this.service.deleteMany(ids);
    this.logger.info(`Deleted ${deleted} of ${bookmarks.length} bookmarks`);
    return deleted;
  }

  public searchBookmarksBy(options: SearchOptions): Bookmark[] {
    const results = this.service.searchBy(options);

    if (results.length === 0) {
      this.logger.info(`No se han encontrado marcadores con palabras clave`);
      return [];
    }

    this.logger.info(`Se han encontrado ${results.length} marcadores con palabras clave`);

    return results;
  }

  public extractBookmarksBy(options: SearchOptions): Bookmark[] {
    const extracted = this.service.pickBy(options);

    if (extracted.length > 0) {
      this.logger.info(`Extracted ${extracted.length} bookmarks using keywords`);
    } else {
      this.logger.info(`No bookmarks found using keywords`);
    }

    return extracted;
  }

  public orderBookmarksByDomain(): void {
    this.service.orderByDomain();
  }

  public getAllBookmarks(): Bookmark[] {
    return this.service.getAll();
  }
}
