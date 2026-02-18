import { BookmarkManagerFacade } from '@/core/bookmark-manager-facade';
import { FileHandler } from '@/utils/file-handler';

const manager = new BookmarkManagerFacade();

let currentFiles = await manager.getFilesInDirectory('data/prev data/');
currentFiles = currentFiles.filter((file: string) => file.endsWith('json'));

const fileHandler = new FileHandler();

const array = [];

for (const file of currentFiles) {
  const content = await fileHandler.read(file);
  const data = JSON.parse(content);
  array.push(data);

  await fileHandler.delete(file);
}

const arrayFlat = array.flat();
await fileHandler.write('data/twitter.json', JSON.stringify(arrayFlat));
