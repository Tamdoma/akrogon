import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { globalHome, readGlobal, type Repo } from './config';
import { withLock } from './state';

const rowSchema = z.strictObject({
  at: z.iso.datetime(),
  repo: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  run: z.string().trim().min(1),
  sessions: z.number().int().positive(),
});

type Row = z.infer<typeof rowSchema>;

const day: number = 24 * 3600_000;

// The ledger refuses rather than skips: every line parses strictly and a read
// failure is a refusal, never an empty list (unlike readTimings).
function readLedger(path: string): Row[] {
  if (!existsSync(path)) return [];
  let text: string;
  try {
    text = readFileSync(path, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
  return text
    .replace(/(?:\r?\n)+$/, '')
    .split('\n')
    .map((line: string, index: number): Row => {
      try {
        return rowSchema.parse(JSON.parse(line));
      } catch (error) {
        throw new Error(`Invalid ${path} row ${index + 1}: ${line}`, { cause: error });
      }
    });
}

export async function reserve(
  repo: Repo,
  slug: string,
  run: string,
  sessionsText: string,
): Promise<{ sessions: number; minutes: number }> {
  const n: number = Number(sessionsText);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error(`Invalid --sessions ${sessionsText}: a positive integer`);
  const paidBudget = readGlobal().paid_budget;
  if (paidBudget === undefined)
    throw new Error(`Missing paid_budget in ${resolve(globalHome(), 'config.yaml')}`);
  const ledger: string = resolve(globalHome(), 'budget.jsonl');
  return withLock(resolve(globalHome(), 'budget.lock'), async (): Promise<{ sessions: number; minutes: number }> => {
    const cap: number = paidBudget.sessions_per_day;
    const rows: Row[] = readLedger(ledger)
      .filter((row: Row): boolean => Date.parse(row.at) > Date.now() - day)
      .sort((a: Row, b: Row): number => Date.parse(a.at) - Date.parse(b.at));
    const total: number = rows.reduce((sum: number, row: Row): number => sum + row.sessions, 0);
    if (total + n > cap) {
      const prefix: string = `paid session budget: --sessions ${n} over the rolling 24-hour total ${total} of ${cap} sessions per day`;
      if (n > cap) throw new Error(`${prefix}; never fits`);
      const earliest: Row | undefined = rows.find((row: Row): boolean => {
        const later: number = rows
          .filter((other: Row): boolean => Date.parse(other.at) > Date.parse(row.at))
          .reduce((sum: number, other: Row): number => sum + other.sessions, 0);
        return later + n <= cap;
      });
      if (earliest === undefined) throw new Error(`${prefix}; never fits`);
      throw new Error(`${prefix}; fits at ${new Date(Date.parse(earliest.at) + day).toISOString()}`);
    }
    try {
      appendFileSync(
        ledger,
        JSON.stringify({ at: new Date().toISOString(), repo: repo.name, slug, run, sessions: n }) + '\n',
      );
    } catch (error) {
      throw new Error(`Append failed ${ledger}: ${error instanceof Error ? error.message : String(error)}`, {
        cause: error,
      });
    }
    return { sessions: n, minutes: paidBudget.session_minutes };
  });
}
