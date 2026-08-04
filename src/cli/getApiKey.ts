import readline from 'readline';

const ask = (rl: readline.Interface, q: string): Promise<string> =>
  new Promise(res => rl.question(q, res));

export async function getApiKey(): Promise<string | undefined> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log('Semantic Scholar endpoints are available to the public without authentication,');
    console.log('but they are rate-limited to 1000 requests per second shared among all unauthenticated users.');
    const choice = (await ask(rl, 'Use (p)ublic access or enter your (a)PI key? ')).trim().toLowerCase();
    if (choice.startsWith('a')) {
      const key = (await ask(rl, 'Enter your Semantic Scholar API key: ')).trim();
      return key || undefined;
    }
    return undefined;
  } finally {
    rl.close();
  }
}
