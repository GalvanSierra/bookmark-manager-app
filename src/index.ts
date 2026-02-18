import { BookmarkManagerFacade } from '@/core/bookmark-manager-facade';

const manager = new BookmarkManagerFacade();

const ultimateFile = await manager.load('data//ultimate_file.html');
const oldFile = await manager.load('data//old_data.html');

let currentFiles = await manager.getFilesInDirectory('data//original data/');
currentFiles = currentFiles.filter((file: string) => file.endsWith('html'));

for (const file of currentFiles) {
  const bookmarkManager = await manager.load(file);
  ultimateFile.addBookmarks(bookmarkManager.getAllBookmarks());
  await bookmarkManager.deleteFile();
}

let oldFiles = await manager.getFilesInDirectory('data//prev data/');
oldFiles = oldFiles.filter((file: string) => file.endsWith('html'));

for (const file of oldFiles) {
  const bookmarkManager = await manager.load(file);
  oldFile.addBookmarks(bookmarkManager.getAllBookmarks());
  await bookmarkManager.deleteFile();
}

const currentBookmarks = ultimateFile.getAllBookmarks()
const currentUrls = currentBookmarks.map(b => b.url)

const bookmarksToDelete = oldFile.getAllBookmarks().filter(b => {
  return currentUrls.includes(b.url)
})
oldFile.deleteBookmarks(bookmarksToDelete)

const updatedBookmarks = oldFile.getAllBookmarks().map((b) => {
  b.folder = '🏚️ old > ' + b.folder;
  return b;
});
oldFile.updateBookmarks(updatedBookmarks);

await ultimateFile.saveBookmarks();
await oldFile.saveBookmarks();
