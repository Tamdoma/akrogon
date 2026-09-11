import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { readGlobal, readRepo, requireRepo, type GlobalConfig, type Repo } from './config';
import { command, retryCommand, CommandError } from './shell';
import { withRepoLock, type Leaf } from './state';

const issueSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  body: z.string().nullable(),
  html_url: z.url(),
  pull_request: z.object({}).optional(),
});
type GitHubIssue = z.infer<typeof issueSchema>;

function parseListing(output: string): GitHubIssue[] {
  try {
    return z
      .array(z.array(issueSchema))
      .parse(JSON.parse(output))
      .flat()
      .filter((issue) => issue.pull_request === undefined);
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof z.ZodError)) throw error;
    throw new Error(JSON.stringify({ error: error.message, response: output }), { cause: error });
  }
}

function slug(title: string): string {
  const normalized: string = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (normalized.length <= 40) return normalized || 'issue';
  const prefix: string = normalized.slice(0, 40);
  const boundary: number = prefix.lastIndexOf('-');
  const shortened: string = normalized[40] !== '-' && boundary !== -1 ? prefix.slice(0, boundary) : prefix;
  return shortened.replace(/-$/, '') || 'issue';
}

export async function pullRepo(repo: Repo): Promise<void> {
  await withRepoLock(repo, async () => {
    const origin: string = await command(['git', 'remote', 'get-url', 'origin'], repo.root);
    const match: RegExpExecArray | null =
      /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([a-zA-Z0-9-]+)\/([a-zA-Z0-9._-]+?)(?:\.git)?\/?$/.exec(
        origin,
      );
    if (match === null || match[2] === '.' || match[2] === '..')
      throw new Error(JSON.stringify({ error: 'Origin must identify a GitHub repository', repo: repo.name, origin }));
    const source: string = `${match[1]}/${match[2]}`;
    const output: string = await retryCommand(
      [
        'gh',
        'api',
        '--hostname',
        'github.com',
        `repos/${source}/issues?state=open&per_page=100`,
        '--paginate',
        '--slurp',
      ],
      repo.root,
    );
    const issues: Map<number, GitHubIssue> = new Map(parseListing(output).map((issue) => [issue.number, issue]));
    const desired: Map<string, string> = new Map(
      [...issues.values()].map((issue) => [
        `${issue.number}-${slug(issue.title)}.md`,
        `# ${issue.title}\n\nSource: ${source}#${issue.number}\nURL: ${issue.html_url}\n\n${issue.body ?? ''}`,
      ]),
    );
    const seeds: string = resolve(repo.root, 'issues/seeds');
    mkdirSync(seeds, { recursive: true });
    for (const [name, content] of desired) writeFileSync(resolve(seeds, name), content);
    for (const entry of readdirSync(seeds, { withFileTypes: true }))
      if (entry.isFile() && /^\d+-.*\.md$/.test(entry.name) && !desired.has(entry.name))
        unlinkSync(resolve(seeds, entry.name));
  });
}

export async function pullCommand(all: boolean): Promise<void> {
  const global: GlobalConfig = readGlobal();
  if (!all) {
    await pullRepo(await requireRepo(global, process.cwd()));
    return;
  }
  const failures: { repo: string; error: Error }[] = [];
  for (const [name, path] of Object.entries(global.repos)) {
    try {
      await pullRepo(readRepo(name, path));
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      failures.push({ repo: name, error });
      console.error(JSON.stringify({ repo: name, error: error.message }));
    }
  }
  if (failures.length > 0)
    throw new AggregateError(
      failures.map((failure) => failure.error),
      `Pull failed: ${failures.map((failure) => failure.repo).join(', ')}`,
    );
}

class SourceError extends Error {}

async function closeSource(repo: Repo, source: string, commit: string): Promise<void> {
  const match: RegExpExecArray | null = /^([a-zA-Z0-9-]+\/(?!\.{1,2}#)[a-zA-Z0-9._-]+)#([1-9][0-9]*)$/.exec(source);
  if (match === null) throw new SourceError(JSON.stringify({ error: 'Invalid GitHub source', source }));
  const [, repository, number]: string[] = match;
  const view: string[] = [
    'env',
    'GH_HOST=github.com',
    'gh',
    'issue',
    'view',
    '-R',
    repository,
    number,
    '--json',
    'state',
  ];
  const close: string[] = ['env', 'GH_HOST=github.com', 'gh', 'issue', 'close', '-R', repository, number];
  for (let attempt: number = 0; attempt < 2; attempt++) {
    try {
      const output: string = await command(view, repo.root);
      const state: 'OPEN' | 'CLOSED' = (() => {
        try {
          return z.object({ state: z.enum(['OPEN', 'CLOSED']) }).parse(JSON.parse(output)).state;
        } catch (error) {
          if (!(error instanceof SyntaxError) && !(error instanceof z.ZodError)) throw error;
          throw new SourceError(
            JSON.stringify({ source, command: view, cwd: repo.root, response: output, error: error.message }),
            { cause: error },
          );
        }
      })();
      if (state === 'CLOSED') return;
      const comment: string = `merged ${commit}`;
      const commentExists: boolean =
        attempt === 1 &&
        (await (async (): Promise<boolean> => {
          const args: string[] = [
            'gh',
            'api',
            '--hostname',
            'github.com',
            `repos/${repository}/issues/${number}/comments?per_page=100`,
            '--paginate',
            '--slurp',
          ];
          const response: string = await command(args, repo.root);
          try {
            return z
              .array(z.array(z.object({ body: z.string() })))
              .parse(JSON.parse(response))
              .flat()
              .some((item) => item.body === comment);
          } catch (error) {
            if (!(error instanceof SyntaxError) && !(error instanceof z.ZodError)) throw error;
            throw new SourceError(
              JSON.stringify({ source, command: args, cwd: repo.root, response, error: error.message }),
              { cause: error },
            );
          }
        })());
      await command(commentExists ? close : [...close, '--comment', comment], repo.root);
      return;
    } catch (error) {
      if (!(error instanceof CommandError) || attempt === 1) throw error;
      console.warn(
        JSON.stringify({
          warning: 'retrying source closure',
          source,
          command: error.argv,
          cwd: error.cwd,
          ...error.result,
        }),
      );
    }
  }
}

export async function closeSources(repo: Repo, sources: ReadonlySet<string>, leaf: Leaf): Promise<void> {
  if (sources.size === 0) return;
  if (leaf.state.worktree === undefined)
    throw new Error(
      JSON.stringify({ error: 'Sourced completion requires a worktree', slug: leaf.state.slug, sources: [...sources] }),
    );
  const commit: string = await command(['git', 'rev-parse', 'HEAD'], leaf.state.worktree);
  const failures: { source: string; error: Error }[] = [];
  for (const source of sources) {
    try {
      await closeSource(repo, source, commit);
    } catch (error) {
      if (!(error instanceof CommandError) && !(error instanceof SourceError)) throw error;
      failures.push({ source, error });
      console.error(JSON.stringify({ source, error: error.message }));
    }
  }
  if (failures.length > 0)
    throw new AggregateError(
      failures.map((failure) => failure.error),
      `Source closure failed: ${failures.map((failure) => failure.source).join(', ')}`,
    );
}
