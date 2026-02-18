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
