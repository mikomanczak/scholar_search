import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { select, input, confirm } from '@inquirer/prompts';

const inputDir = path.join(__dirname, 'input');
const jsonInputPath = path.join(inputDir, 'input.json');
const csvInputPath = path.join(inputDir, 'input.csv');

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
  const source = await select({
    message: 'How would you like to provide keywords?',
    choices: [
      { name: 'Type them in the terminal', value: 'terminal' },
      { name: 'Load them from a file', value: 'file' },
    ],
  });

  if (source === 'file') {
    const format = await select({
      message: 'Which file format?',
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'CSV', value: 'csv' },
      ],
    });

    fs.mkdirSync(inputDir, { recursive: true });

    if (format === 'json') {
      if (!fs.existsSync(jsonInputPath)) {
        fs.writeFileSync(jsonInputPath, JSON.stringify({ keywords: [] }, null, 2));
      }
      await input({ message: `Enter your keywords in ${jsonInputPath}, then press Enter to continue` });
      return readKeywordsFromJson(jsonInputPath);
    }

    if (!fs.existsSync(csvInputPath)) {
      fs.writeFileSync(csvInputPath, 'keyword\n');
    }
    await input({ message: `Enter your keywords in ${csvInputPath} (one per row under "keyword" header), then press Enter to continue` });
    return readKeywordsFromCsv(csvInputPath);
  }

  while (true) {
    const raw = await input({ message: 'Enter keywords (comma-separated):' });
    const keywords = raw.split(',').map(k => k.trim()).filter(Boolean);
    console.log('You entered:', keywords);
    const ok = await confirm({ message: 'Are these correct and do you want to search?' });
    if (ok) return keywords;
  }
}
