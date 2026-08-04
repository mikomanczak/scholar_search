import { getApiKey } from './getApiKey';
import { getKeywords } from './getKeywords';
import { runSearch } from './search';

async function main(): Promise<void> {
  const apiKey = await getApiKey();
  const keywords = await getKeywords();
  await runSearch(keywords, apiKey);
}

main();
