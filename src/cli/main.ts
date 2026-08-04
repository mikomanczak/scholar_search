import fs from 'fs';
import csvParser from 'csv-parser';
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

const inputCsvFilePath = 'input.csv';
const outputCsvFilePath = 'output.csv';
const alreadySavedPapers = new Set<string>();

async function searchForPaper(keyword: string, csvStream: fastcsv.CsvFormatterStream<fastcsv.FormatterRow, fastcsv.FormatterRow>): Promise<void> {
  try {
    console.log('searching for keyword: ' + keyword + '...');
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(keyword)}&offset=0&limit=10`);
    const listOfPapers: Paper[] = response.data.data;
    for (const paper of listOfPapers) {
      if (alreadySavedPapers.has(paper.paperId)) { continue; }
      csvStream.write([paper.paperId]);
      csvStream.write([paper.title]);
      const paperDetails = await getPaperDetails(paper.paperId);
      if (!paperDetails) continue;
      csvStream.write([paperDetails.year]);
      csvStream.write([getAuthorsNames(paperDetails.authors)]);
      csvStream.write([paperDetails.externalIds.DOI]);
      alreadySavedPapers.add(paper.paperId);
    }
    csvStream.end();
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, (error as Error).message);
  }
}

async function getPaperDetails(paperID: string): Promise<PaperDetails | undefined> {
  try {
    console.log(`fetching paper details from https://api.semanticscholar.org/graph/v1/paper/${paperID}`);
    const paperDetails = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/${paperID}?fields=year,authors,externalIds`);
    return paperDetails.data;
  } catch (error) {
    console.error(`Error getting paper details for paper ID "${paperID}":`, (error as Error).message);
  }
}

function getAuthorsNames(listOfAuthors: Author[]): string {
  let authorsNames = '';
  for (const author of listOfAuthors) {
    authorsNames += author.name + ', ';
  }
  return authorsNames;
}

async function main(): Promise<void> {
  const readStream = fs.createReadStream(inputCsvFilePath);

  const writeStream = fs.createWriteStream(outputCsvFilePath, { flags: 'a' });
  const csvStream = fastcsv.format({ headers: true });
  csvStream.pipe(writeStream);

  const rows: { keyword: string }[] = await new Promise((resolve, reject) => {
    const rows: { keyword: string }[] = [];
    readStream.pipe(csvParser()).on('data', (row) => { rows.push(row); })
      .on('end', () => { resolve(rows); })
      .on('error', (error) => { reject(error); });
  });

  for (const row of rows) {
    await searchForPaper(row.keyword, csvStream);
  }
}

main();
