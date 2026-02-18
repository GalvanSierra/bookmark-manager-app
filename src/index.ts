import { BookmarkManagerFacade } from '@/core/bookmark-manager-facade';

const manager = new BookmarkManagerFacade();

const ultimateFile = await manager.load('data//ultimate_file.html');

let files = await manager.getFilesInDirectory('data//original data/');
files = files.filter((file) => file.endsWith('html'));
console.log(files);

for (const file of files) {
  const bookmarkManager = await manager.load(file);
  ultimateFile.addBookmarks(bookmarkManager.getAllBookmarks());
  await bookmarkManager.deleteFile();
}

await ultimateFile.saveBookmarks();

const allCurrentBookmarks = ultimateFile.getAllBookmarks();

const oldFile = await manager.load('data//old_data.html');

let filesOld = await manager.getFilesInDirectory('data//prev data/');
filesOld = filesOld.filter((file) => file.endsWith('html'));
console.log(filesOld);

for (const file of filesOld) {
  const bookmarkManager = await manager.load(file);
  oldFile.addBookmarks(bookmarkManager.getAllBookmarks());
  await bookmarkManager.deleteFile();
}

oldFile.extractBookmarksBy({
  includeWords: allCurrentBookmarks.map((b) => b.url),
  searchIn: ['url'],
});

const updatedBookmarks = oldFile.getAllBookmarks().map((b) => {
  b.folder = '🏚️ old > ' + b.folder;
  return b;
});
oldFile.updateBookmarks(updatedBookmarks);

await oldFile.saveBookmarks();
