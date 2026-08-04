import { select } from '@inquirer/prompts';
import { getApiKey } from './getApiKey';
import { getKeywords } from './getKeywords';
import { runSearch } from './search';

async function main(): Promise<void> {
  let apiKey: string | undefined = await getApiKey();
  let keywords: string[] = await getKeywords();

  while (true) {
    try {
      await runSearch(keywords, apiKey);
      return;
    } catch (error) {
      console.error('Search failed:', (error as Error).message);
      const next = await select({
        message: 'What would you like to do?',
        choices: [
          { name: 'Retry with the same API key and keywords', value: 'retry' },
          { name: 'Start over (re-enter API key and keywords)', value: 'restart' },
          { name: 'Quit', value: 'quit' },
        ],
      });
      if (next === 'quit') return;
      if (next === 'restart') {
        apiKey = await getApiKey();
        keywords = await getKeywords();
      }
    }
  }
}

main();
