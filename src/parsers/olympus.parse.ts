import type {
	ChapterList,
	Datum,
	ExtractedChapterData,
	OlympusList,
	Serie,
} from "@/types/olympus.type";
import { generateGuid } from "@/utils/guid";

export class OlympusParser {
	parseSeries(content: OlympusList): Serie[] {
		const data = content.data.series.data;

		const date = new Date();

		return data.map(({ name, slug }) => {
			const guid = generateGuid();
			return {
				name: `${name} | Olympus Scanlation`,
				url: `https://olympusbiblioteca.com/series/comic-${slug}`,
				folder: `Olympus Scanlation Series`,
				slug,
				guid,
				date_added: date.toISOString(),
			};
		});
	}

	parseChapters(data: ChapterList): ExtractedChapterData[] {
		return data.data.map((chapter: Datum) => ({
			id: chapter.id,
			chapter: +chapter.name,
			last_page: data.meta.last_page,
		}));
	}
}
