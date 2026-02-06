import { HtmlParser } from '@/parsers/html-parser';
import type { BookmarkService } from '@/services/bookmark.service';
import type { Bookmark, SearchOptions } from '@/types/bookmark';
import { FileHandler } from '@/utils/file-handler';
import { Logger } from '@/utils/logger';

export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export class BookmarkManager {
  private readonly bookmarkService: BookmarkService;

  private readonly fileHandler = new FileHandler();
  private readonly logger = new Logger();
  private readonly parser = new HtmlParser();

  private readonly path: string;

  constructor(path: string, allowDuplicates = false) {
    this.path = path;
    this.bookmarkService = new BookmarkService(allowDuplicates);
  }

  async loadBookmarks(): Promise<OperationResult<number>> {
    try {
      const content = await this.fileHandler.read(this.path);
      const bookmarks = this.parser.parse(content);

      const created = this.bookmarkService.createMany(bookmarks);
      const total = this.bookmarkService.findAll().length;

      this.logger.info(`Loaded ${total} bookmarks (${created} new)`);

      return {
        success: true,
        data: total,
        count: created,
      };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error('Failed to load bookmarks', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async saveBookmarks(): Promise<OperationResult> {
    try {
      const bookmarks = this.bookmarkService.findAll();

      if (bookmarks.length === 0) {
        this.logger.warn('No bookmarks to save');
        return { success: true };
      }

      const htmlContent = this.parser.serialize(bookmarks);
      await this.fileHandler.write(this.path, htmlContent);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${this.path}`);

      return { success: true, count: bookmarks.length };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error('Failed to save bookmarks', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async saveOutputBookmarks(bookmarks: Bookmark[], outputPath?: string): Promise<OperationResult> {
    try {
      if (bookmarks.length === 0) {
        this.logger.warn('No bookmarks to save');
        return { success: true, count: 0 };
      }

      const targetPath = outputPath || this.getDefaultOutputPath(this.path);

      const htmlContent = this.parser.serialize(bookmarks);
      await this.fileHandler.write(targetPath, htmlContent);

      this.logger.info(`Saved ${bookmarks.length} bookmarks to ${targetPath}`);

      return { success: true, count: bookmarks.length };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error('Failed to save output bookmarks', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async deleteFile(): Promise<OperationResult> {
    try {
      await this.fileHandler.delete(this.path);
      this.logger.info(`Deleted file: ${this.path}`);

      return { success: true };
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error('Failed to delete file', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // OPERACIONES CRUD

  addBookmark(bookmark: Bookmark, folderName?: string): OperationResult<Bookmark> {
    if (!this.isValidBookmark(bookmark)) {
      return {
        success: false,
        error: 'Invalid bookmark data',
      };
    }

    const bookmarkToAdd = folderName ? { ...bookmark, folder: folderName } : bookmark;

    const created = this.bookmarkService.create(bookmarkToAdd);

    if (created) {
      this.logger.debug(`Added bookmark: ${bookmark.title}`);

      return { success: true, data: bookmarkToAdd };
    }

    return {
      success: false,
      error: 'Bookmark already exists or creation failed',
    };
  }

  addBookmarks(bookmarks: Bookmark[], folderName?: string): OperationResult<number> {
    if (bookmarks.length === 0) {
      return {
        success: false,
        error: 'No bookmarks provided',
      };
    }

    const bookmarksToAdd = folderName
      ? bookmarks.map((b) => ({ ...b, folder: folderName }))
      : bookmarks;

    const created = this.bookmarkService.createMany(bookmarksToAdd);

    this.logger.info(`Added ${created} of ${bookmarks.length} bookmarks`);

    return {
      success: created > 0,
      data: created,
      count: created,
    };
  }

  updateBookmark(id: string, bookmark: Bookmark): OperationResult<Bookmark> {
    if (!this.isValidBookmark(bookmark)) {
      return {
        success: false,
        error: 'Invalid bookmark data',
      };
    }

    const updated = this.bookmarkService.update(id, bookmark);

    if (updated) {
      this.logger.debug(`Updated bookmark: ${id}`);

      return { success: true, data: bookmark };
    }

    return {
      success: false,
      error: 'Bookmark not found or update failed',
    };
  }

  updateBookmarks(bookmarks: Bookmark[]): OperationResult<number> {
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return {
        success: false,
        error: 'No bookmarks provided',
      };
    }

    const updated = this.bookmarkService.updateMany(bookmarks);

    this.logger.info(`Updated ${updated} of ${bookmarks.length} bookmarks`);

    return {
      success: updated > 0,
      data: updated,
      count: updated,
    };
  }

  deleteBookmark(id: string): OperationResult {
    const deleted = this.bookmarkService.delete(id);

    if (deleted) {
      this.logger.debug(`Deleted bookmark: ${id}`);

      return { success: true };
    }

    return {
      success: false,
      error: 'Bookmark not found',
    };
  }

  deleteBookmarks(bookmarks: Bookmark[]): OperationResult<number> {
    if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
      return {
        success: false,
        error: 'No bookmarks provided',
      };
    }

    const ids = bookmarks.map((b) => b.id);
    const deleted = this.bookmarkService.deleteMany(ids);

    this.logger.info(`Deleted ${deleted} of ${bookmarks.length} bookmarks`);

    return {
      success: deleted > 0,
      data: deleted,
      count: deleted,
    };
  }

  clearBookmarks(): OperationResult {
    const count = this.bookmarkService.findAll().length;

    if (count === 0) {
      this.logger.warn('No bookmarks to clear');
      return { success: true, count: 0 };
    }

    const ids = this.bookmarkService.findAll().map((b) => b.id);
    this.bookmarkService.deleteMany(ids);

    this.logger.info(`Cleared ${count} bookmarks`);

    return { success: true, count };
  }

  findBookmarksBy(options: SearchOptions): Bookmark[] {
    try {
      const results = this.bookmarkService.findBy(options);
      this.logger.debug(`Search returned ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error('Search failed', this.getErrorMessage(error));
      return [];
    }
  }

  getAllBookmarks(): Bookmark[] {
    return this.bookmarkService.findAll();
  }

  getBookmarkById(id: string): Bookmark | undefined {
    return this.bookmarkService.findById(id);
  }

  getBookmarkCount(): number {
    return this.bookmarkService.findAll().length;
  }

  private isValidBookmark(bookmark: Bookmark): boolean {
    return !!(bookmark && bookmark.id && bookmark.url && this.isValidUrl(bookmark.url));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private getDefaultOutputPath(originalPath: string): string {
    const lastDotIndex = originalPath.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${originalPath}_output`;
    }
    const basePath = originalPath.substring(0, lastDotIndex);
    const extension = originalPath.substring(lastDotIndex);
    return `${basePath}_output${extension}`;
  }

  getStatistics() {
    const bookmarks = this.bookmarkService.findAll();
    const folders = new Set(bookmarks.map((b) => b.folder)).size;

    return {
      total: bookmarks.length,
      folders,
      averagePerFolder: folders > 0 ? (bookmarks.length / folders).toFixed(2) : 0,
    };
  }
}
