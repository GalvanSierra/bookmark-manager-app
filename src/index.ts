import { BookmarkManagerFacade } from '@/core/bookmark-manager-facade';
const manager = new BookmarkManagerFacade();

const newData = await manager.load('data/pending/archive.html');
newData.orderBookmarksByDomain();
await newData.saveBookmarks();
