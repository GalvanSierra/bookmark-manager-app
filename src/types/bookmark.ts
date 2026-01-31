export interface BookmarkSchema {
  title: string;
  url: string;
  folder: string;
  dateAdded: string;
  icon?: string;
}

export type Bookmark = BookmarkSchema & {
  id: string;
};

export interface FolderNode {
  name: string;
  bookmarks: Bookmark[];
  children: Map<string, FolderNode>;
  parent?: FolderNode;
}
