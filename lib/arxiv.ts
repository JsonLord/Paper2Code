import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  link: string;
  pdfUrl: string;
}

const parser = new XMLParser();

/**
 * Fetches paper metadata from Arxiv API.
 * Supports both direct Arxiv IDs and search queries.
 */
export async function fetchArxivPaper(query: string): Promise<ArxivPaper | null> {
  try {
    let id = '';
    
    // Extract ID if it's a URL
    if (query.includes('arxiv.org/abs/')) {
      id = query.split('arxiv.org/abs/')[1].split('?')[0];
    } else if (query.includes('arxiv.org/pdf/')) {
      id = query.split('arxiv.org/pdf/')[1].replace('.pdf', '').split('?')[0];
    } else if (/^\d{4}\.\d{4,5}$/.test(query)) {
      id = query;
    }

    const apiUrl = id 
      ? `http://export.arxiv.org/api/query?id_list=${id}`
      : `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=1`;

    console.log(`[arxiv] Fetching: ${apiUrl}`);
    const response = await axios.get(apiUrl);
    const jsonObj = parser.parse(response.data);

    const entry = jsonObj.feed?.entry;
    if (!entry) return null;

    const paperEntry = Array.isArray(entry) ? entry[0] : entry;
    
    return {
      id: paperEntry.id,
      title: paperEntry.title.trim().replace(/\n/g, ' '),
      summary: paperEntry.summary.trim(),
      authors: Array.isArray(paperEntry.author) 
        ? paperEntry.author.map((a: any) => a.name)
        : [paperEntry.author.name],
      published: paperEntry.published,
      updated: paperEntry.updated,
      link: paperEntry.id,
      pdfUrl: paperEntry.id.replace('abs', 'pdf') + '.pdf'
    };
  } catch (error) {
    console.error('[arxiv] Error fetching paper:', error);
    return null;
  }
}
