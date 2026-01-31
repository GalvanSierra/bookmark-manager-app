import { HtmlParser } from '@/parsers/html-parser';
import { BookmarkService } from '@/services/bookmark.service';
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
}
