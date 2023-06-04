const fs = require('fs');
const csvParser = require('csv-parser');
const axios = require('axios');
const fastcsv = require('fast-csv');

const inputCsvFilePath = 'input.csv';
const outputCsvFilePath = 'output.csv';
const alreadySavedPapers = new Set();

async function searchForPaper(keyword, csvStream) {
  try {
    // 1. Fetch papers for the given keyword 
    console.log("searching for keyword: " + keyword + "...");
    const response = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(keyword)}&offset=0&limit=10`);
    const listOfPapers = response.data.data;
    // 2. Write paperId, title, year, authors and  DOI 
    for (const paper of listOfPapers) {
      if (alreadySavedPapers.has(paper.paperId)) { continue; }
      csvStream.write([paper.paperId]);
      csvStream.write([paper.title]);
      const paperDetails = await getPaperDetails(paper.paperId);
      csvStream.write([paperDetails.year]);
      csvStream.write([getAuthorsNames(paperDetails.authors)]);
      csvStream.write([paperDetails.externalIds.DOI]);
      alreadySavedPapers.add(paper.paperId);
    }
    csvStream.end();
  } catch (error) {
    console.error(`Error searching for keyword "${keyword}":`, error.message);
  }
}

async function getPaperDetails(paperID) {
    try {
         console.log(`fetching paper details from https://api.semanticscholar.org/graph/v1/paper/${paperID}`);
         let paperDetails = await axios.get(`https://api.semanticscholar.org/graph/v1/paper/${paperID}?fields=year,authors,externalIds`);
         return paperDetails.data;
    } catch (error) {
        console.error(`Error getting paper details for paper ID "${paperID}":`, error.message);
    }
}

function getAuthorsNames(listOfAuthors) {
    let authorsNames = "";
    for (const author of listOfAuthors) {
        authorsNames += author.name + ", ";
    }
    return authorsNames;
}

async function main() {
  
  // 1. Create a read stream for the input CSV file
  const readStream = fs.createReadStream(inputCsvFilePath);

  // 2. Create a write stream for the output.csv
  const writeStream = fs.createWriteStream(outputCsvFilePath, { flags: 'a' });
  const csvStream = fastcsv.format({ headers: true });
  csvStream.pipe(writeStream);

  // 3.Read rows from the input.csv
  const rows = await new Promise((resolve, reject) => {
    const rows = [];
    readStream.pipe(csvParser()).on('data', (row) => { rows.push(row);})
      .on('end', () => {
        resolve(rows);
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  // 4. For each row, search for papers and write to output.csv
  for (const row of rows) {
    const keyword = row.keyword;
    await searchForPaper(keyword, csvStream);
  }

}

main();