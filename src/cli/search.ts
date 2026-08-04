import fs from 'fs';
import axios from 'axios';
import * as fastcsv from 'fast-csv';

interface Author {
  name: string;
}

interface Paper {
  paperId: string;
  title: string;
}

interface PaperDetails {
  year: number;
  authors: Author[];
  externalIds: { DOI?: string };
}

const alreadySavedPapers = new Set<string>();

const authHeaders = (apiKey?: string) => apiKey ? { 'x-api-key': apiKey } : undefined;

async function getPaperDetails(paperID: string, apiKey?: string): Promise<PaperDetails | undefined> {
  try {
    console.log(`fetching paper details from https://api.semanticscholar.org/graph/v1/paper/${paperID}`);
    const paperDetails = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/${paperID}?fields=year,authors,externalIds`, { headers: authHeaders(apiKey) });
    return paperDetails.data;
  } catch (error) {
    console.error(`Error getting paper details for paper ID "${paperID}":`, (error as Error).message);
  }
}

function getAuthorsNames(listOfAuthors: Author[]): string {
  return listOfAuthors.map(a => a.name).join(', ');
}

async function searchForPaper(keyword: string, csvStream: fastcsv.CsvFormatterStream<fastcsv.FormatterRow, fastcsv.FormatterRow>, apiKey?: string): Promise<void> {
  try {
    console.log('searching for keyword: ' + keyword + '...');
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(keyword)}&offset=0&limit=10`, { headers: authHeaders(apiKey) });
    const listOfPapers: Paper[] = response.data.data;
    for (const paper of listOfPapers) {
      if (alreadySavedPapers.has(paper.paperId)) { continue; }
      csvStream.write([paper.paperId]);
      csvStream.write([paper.title]);
      const paperDetails = await getPaperDetails(paper.paperId, apiKey);
      if (!paperDetails) continue;
      csvStream.write([paperDetails.year]);
      csvStream.write([getAuthorsNames(paperDetails.authors)]);
      csvStream.write([paperDetails.externalIds.DOI]);
      alreadySavedPapers.add(paper.paperId);
    }
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, (error as Error).message);
  }
}

export async function runSearch(keywords: string[], apiKey?: string, outputCsvFilePath = 'output.csv'): Promise<void> {
  const writeStream = fs.createWriteStream(outputCsvFilePath, { flags: 'a' });
  const csvStream = fastcsv.format({ headers: true });
  csvStream.pipe(writeStream);

  for (const keyword of keywords) {
    await searchForPaper(keyword, csvStream, apiKey);
  }
  csvStream.end();
}
