import fs from 'fs';
import path from 'path';
import readline from 'readline';
import csvParser from 'csv-parser';

const inputDir = path.join(__dirname, 'input');
const jsonInputPath = path.join(inputDir, 'input.json');
const csvInputPath = path.join(inputDir, 'input.csv');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise(res => rl.question(q, res));

async function readKeywordsFromCsv(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const rows: string[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => { if (row.keyword) rows.push(row.keyword); })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

function readKeywordsFromJson(filePath: string): string[] {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.keywords)) return data.keywords;
  throw new Error('JSON must be an array of keywords or { "keywords": [...] }');
}

export async function getKeywords(): Promise<string[]> {
  try {
    const source = (await ask('Input keywords from (f)ile or (t)erminal? ')).trim().toLowerCase();

    if (source.startsWith('f')) {
      const format = (await ask('Choose format: (j)son or (c)sv? ')).trim().toLowerCase();
      fs.mkdirSync(inputDir, { recursive: true });

      if (format.startsWith('j')) {
        if (!fs.existsSync(jsonInputPath)) {
          fs.writeFileSync(jsonInputPath, JSON.stringify({ keywords: [] }, null, 2));
        }
        await ask(`Please enter your keywords in ${jsonInputPath}, then press Enter to continue... `);
        return readKeywordsFromJson(jsonInputPath);
      }

      if (!fs.existsSync(csvInputPath)) {
        fs.writeFileSync(csvInputPath, 'keyword\n');
      }
      await ask(`Please enter your keywords in ${csvInputPath} (one per row under "keyword" header), then press Enter to continue... `);
      return readKeywordsFromCsv(csvInputPath);
    }

    while (true) {
      const raw = await ask('Enter keywords (comma-separated): ');
      const keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
      console.log('You entered:', keywords);
      const confirm = (await ask('Are these correct and do you want to search? (y/n) ')).trim().toLowerCase();
      if (confirm.startsWith('y')) return keywords;
    }
  } finally {
    rl.close();
  }
}
