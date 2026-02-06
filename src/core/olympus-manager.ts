import type { BookmarkService } from "@/services/bookmark.service";
import { OlympusService } from "@/services/olympus.service";
import type { Bookmark } from "@/types/bookmark.type";

export class OlympusManager {
	private olympusService = new OlympusService();
	constructor(private bookmarkService: BookmarkService<Bookmark>) {}

	async updateOlympusMangasBookmarks(): Promise<Bookmark[]> {
		const bookmarks = this.bookmarkService.findByUrlDomain(
			"olympusbiblioteca.com",
		);

		console.log(`Encontrados ${bookmarks?.length} mangas`);
		if (!bookmarks) return [];

		const mangas = Object.groupBy(bookmarks, (b) => {
			if (b.url.includes("/series/")) return "series";
			if (b.url.includes("/capitulo/")) return "chapters";
			return "unknown";
		});

		const series = mangas.series || [];

		const chapters = mangas.chapters || [];

		if (series.length === 0) {
			console.warn("No se encontraron series.");
		}

		if (chapters.length === 0) {
			console.warn("No se encontraron capítulos.");
		}

		if (series.length === 0 && chapters.length === 0) return;

		console.log(
			`Actualizando ${series.length} series y ${chapters.length} capítulos`,
		);

		const updatedMangas = await this.olympusService.updateAll(series, chapters);

		return updatedMangas;
	}
}
