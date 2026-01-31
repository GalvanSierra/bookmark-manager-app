import type { Bookmark, SearchOptions } from '@/types/bookmark';

export class BookmarkService {
  private bookmarks = new Map<string, Bookmark>();
  private urlIndex = new Map<string, string>();

  public create(bookmark: Bookmark): Bookmark | null {
    if (this.urlExists(bookmark.url)) return null;

    this.bookmarks.set(bookmark.id, bookmark);
    this.urlIndex.set(bookmark.url, bookmark.id);

    return bookmark;
  }

  public createMany(bookmarks: Bookmark[]): number {
    let created = 0;

    for (const bookmark of bookmarks) {
      if (this.create(bookmark) !== null) created++;
    }

    return created;
  }

  public findById(id: string): Bookmark | undefined {
    return this.bookmarks.get(id);
  }

  public update(id: string, updatedBookmark: Bookmark): Bookmark | null {
    const existing = this.findById(id);

    if (!existing) return null;

    const urlChanged = existing.url !== updatedBookmark.url;

    if (urlChanged) {
      this.removeFromUrlIndex(existing.url);
      this.addToUrlIndex(updatedBookmark.url, id);
    }

    this.bookmarks.set(id, updatedBookmark);
    return updatedBookmark;
  }

  public updateMany(bookmarks: Bookmark[]): number {
    let updated = 0;
    for (const bookmark of bookmarks) {
      if (this.update(bookmark.id, bookmark)) updated++;
    }
    return updated;
  }

  public delete(id: string): boolean {
    return this.bookmarks.delete(id);
  }

  public deleteMany(ids: string[]): number {
    let deleted = 0;
    for (const id of ids) {
      if (this.delete(id)) deleted++;
    }
    return deleted;
  }

  public searchBy(options: SearchOptions): Bookmark[] {
    let { includeWords } = options;
    const {
      excludeWords = [],
      caseSensitive = false,
      searchIn = ['title', 'url'],
      includeAllWords = false,
    } = options;

    if (!includeWords || (Array.isArray(includeWords) && includeWords.length === 0)) {
      return [];
    }

    // Normalizar includeWords a array
    if (typeof includeWords === 'string') {
      includeWords = [includeWords];
    }

    return Array.from(this.bookmarks.values()).filter((bookmark) => {
      const searchTexts: string[] = [];

      if (searchIn.includes('title')) searchTexts.push(bookmark.title);
      if (searchIn.includes('url')) searchTexts.push(bookmark.url);
      if (searchIn.includes('folder') && bookmark.folder) searchTexts.push(bookmark.folder);

      const searchText = searchTexts.join(' ');

      return this.matchWithKeywords(
        searchText,
        includeWords,
        excludeWords,
        caseSensitive,
        includeAllWords,
      );
    });
  }

  public pickBy(options: SearchOptions): Bookmark[] {
    const bookmarksToRemove = this.searchBy(options);

    if (bookmarksToRemove.length > 0) {
      this.deleteMany(bookmarksToRemove.map((b) => b.id));
    }

    return bookmarksToRemove;
  }

  public getAll(): Bookmark[] {
    return Array.from(this.bookmarks.values());
  }

  public clear(): void {
    this.bookmarks.clear();
    this.urlIndex.clear();
  }

  private addToUrlIndex(url: string, id: string): void {
    this.urlIndex.set(url, id);
  }

  private removeFromUrlIndex(url: string): boolean {
    return this.urlIndex.delete(url);
  }

  private urlExists(url: string): boolean {
    return this.urlIndex.has(url);
  }

  private matchWithKeywords(
    searchText: string,
    includeWords: string[],
    excludeWords: string[],
    caseSensitive: boolean,
    includeAllWords: boolean,
  ): boolean {
    const prepareText = (text: string) => (caseSensitive ? text : text.toLowerCase());

    const searchTextPrep = prepareText(searchText);
    const includeWordsPrep = includeWords.map(prepareText);
    const excludeWordsPrep = excludeWords.map(prepareText);

    const hasIncludeWord = includeAllWords
      ? includeWordsPrep.every((word) => searchTextPrep.includes(word)) // AND lógico
      : includeWordsPrep.some((word) => searchTextPrep.includes(word)); // OR lógico

    const hasExcludeWord = excludeWordsPrep.some((word) => searchTextPrep.includes(word));

    return hasIncludeWord && !hasExcludeWord;
  }
}
