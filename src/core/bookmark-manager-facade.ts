import { BookmarkManager } from '@/core/bookmark-manager';
import { HtmlParser } from '@/parsers/html-parser';
import { BookmarkService } from '@/services/bookmark.service';
import { FileHandler } from '@/utils/file-handler';
import { Logger } from '@/utils/logger';

export class BookmarkManagerFacade {
  async load(path: string): Promise<BookmarkManager> {
    const logger = new Logger();
    const fileHandler = new FileHandler(logger);
    const parser = new HtmlParser();
    const service = new BookmarkService();
    const manager = new BookmarkManager(path, fileHandler, parser, service, logger);

    await manager.loadBookmarks();
    return manager;
  }
}
