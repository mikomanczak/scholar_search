import { select, input } from '@inquirer/prompts';

export async function getApiKey(): Promise<string | undefined> {
  console.log('Semantic Scholar endpoints are available to the public without authentication,');
  console.log('but they are rate-limited to 1000 requests per second shared among all unauthenticated users.');

  const choice = await select({
    message: 'How would you like to access the API?',
    choices: [
      { name: 'Public access (no key)', value: 'public' },
      { name: 'Enter my API key', value: 'key' },
    ],
  });

  if (choice === 'key') {
    const key = await input({ message: 'Enter your Semantic Scholar API key:' });
    return key.trim() || undefined;
  }
  return undefined;
}
