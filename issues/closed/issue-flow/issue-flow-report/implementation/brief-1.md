# Worker brief 1: flow report product code (unit U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/issue-flow-report-u1` (detached at the leaf test commit c7c9b42). You own exactly `src/timing-report.ts`, `src/pull.ts`, `src/akrogon.ts`. Touch nothing else.

## 1. Goal

Implement `akrogon timing --flow --since <YYYY-MM-DD>` per plan decisions D1–D9 and D11 (leaf `issue-flow-report`). A read-only report: one line per GitHub issue carried by a leaf's `sources`, one line per open issue of the origin repo no leaf carries, then four summary lines.

## 2. Acceptance criteria

1. Carried row per issue: `<owner/repo#n> filed <ISO> handoff <YYYY-MM-DD> merged <ISO|open> wait <int>d total <1dp>d leaves <n>`, sorted by filed `created_at` then identity; `merged <ISO>` only when every carrier leaf's last log move is `to: 'merged'` (the latest such `ts`), else `merged open`. Carried identity absent from its repo's listing prints `<owner/repo#n> not in listing` (after dated rows, by identity) and the command still exits 0.
2. Uncarried open rows: `<owner/repo#n> filed <ISO> uncarried <age 1dp>d` after carried rows, same sort. A parked leaf's issue stays carried.
3. Summary lines, in order: `summary before: <n> merged <m> wait <med>d total <med>d`, `summary since: <n> merged <m> wait <med>d total <med>d`, `summary backlog: <n> median <med>d oldest <d>d`, `summary uncarried closed: <n>`. before/since buckets split on handoff `created` vs `--since` (same-day = since). Medians: sorted, even count = mean of middle two, empty or no merged = `-`; medians `%.1f` days, `oldest` whole days; `not in listing` issues count in n/merged but never medians.
4. One `retryCommand` read per distinct repo (carrier repos ∪ origin, sorted): `gh api --hostname github.com repos/<r>/issues?state=all&per_page=100 --paginate --slurp`; schema `{number, created_at, state, pull_request?}` parsed once at the boundary, PRs dropped; a still-failing read propagates `CommandError` (non-zero exit, command+output in stderr).
5. CLI: `timing` accepts `<slug>` | `--cohort --since <iso datetime>` | `--flow --since <YYYY-MM-DD>` (`z.iso.date()`); `--cohort`+`--flow` together and every other shape throws `Usage: akrogon timing <slug> | --cohort --since <iso> | --flow --since <YYYY-MM-DD>`. `--cohort --since` keeps `z.iso.datetime()`; malformed `--since` values may surface raw zod errors (exit non-zero is what matters).
6. `wait` = `handoff(created) − filed(created_at UTC date)` whole days; `total`/`age` = `(merged ?? now) − created_at` days `%.1f`. Times print ISO UTC without milliseconds.
7. Leaves: `allLeaves(repo)` (open+closed) plus `leavesUnder(issues/parked, issues/parked)`; leaf without `sources` carries nothing; one issue may be carried by many leaves (`leaves <n>` counts distinct slugs) and one leaf may carry many identities.

The planned tests in `tests/timing-report.test.ts` (four `flow report:` tests) are your green target — already committed red. Do not edit them; a test you believe wrong is a mismatch, not a fix.

## 3. Read-first list

- `src/timing-report.ts` — put `flowReport` beside `slugReport`/`cohortReport`; extend `timingCommand`'s arg to a third union member.
- `src/akrogon.ts` — `timing` options `{ cohort, flow, since }` and the `timing` case; copy the shape-validation style already there.
- `src/pull.ts` — extract the origin-URL→`owner/repo` parse (regex + `git remote get-url origin`) into `export function originSource(repo: Repo): Promise<string>`; `pullRepo` calls it. Its `issueSchema`, `parseListing`, `state=open` query stay byte-identical.
- `src/state.ts` — `allLeaves`, `leavesUnder`, `sourcePattern`, `sources` field.
- `src/log.ts` — `readLog` / `Move`.
- `src/shell.ts` — `retryCommand`, `CommandError`.
- `tests/timing-report.test.ts` — the four `flow report:` tests pin exact output.
- `tests/pull.test.ts` — fake-gh step/`args`/`calls` pattern.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `src/pull.ts`: add `originSource`, use in `pullRepo`.
- `src/timing-report.ts`: `const flowIssueSchema = z.object({ number: z.number().int().positive(), created_at: z.string(), state: z.string(), pull_request: z.object({}).optional() })`; parse slurped pages via `z.array(z.array(flowIssueSchema))` + flat + PR drop (same tolerance as `parseListing`); `flowReport(repo, since)` gathers carriers → identities → per-repo listing (repos sorted) → rows + summaries → `console.log`. `timingCommand(cwd, arg: { slug: string } | { since: string } | { flow: string })`.
- `src/akrogon.ts`: add `flow: { type: 'boolean' }` to the timing options; rewrite the `timing` case validation for the three shapes; dispatch `{ flow: parsedDate }`.
- Owns: the three files above only. No test edits, no docs, no other file.

## 5. Do-not, reasons and exceptions

- Do not edit test files — planned tests belong to A; a wrong or red-after-correct-code test is a mismatch with evidence.
- Do not touch `pull.test.ts`, `parseListing` semantics, or `pull` output — criterion: `pull` unchanged.
- Do not add flags, subcommands, filters or extra output beyond the criteria — scope is the locked brief.
- Do not catch `CommandError` to soften failures — criterion 4 wants it propagated with command+output.
- Return a mismatch (conflicting requirement, actual interface/scale evidence, smallest brief correction) instead of changing scope or interfaces; the exception is a revised brief from A.

## 6. Ordered steps

1. `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` in your worktree.
2. `originSource` in `pull.ts` + wire `pullRepo` (criterion: `pull` behavior identical).
3. `flowReport` + schema + `timingCommand` union in `src/timing-report.ts`.
4. CLI parsing in `src/akrogon.ts`.
5. Run the commands in section 7; all four flow tests green, `pull` and remaining timing tests green.

Advisory size: 3 files, under 30 turns. Clearly beyond → mismatch.

## 7. Commands

- `bun test --timeout=30000 tests/timing-report.test.ts tests/pull.test.ts`
- `bun run typecheck`

## 8. Done-when, evidence and report

All four `flow report:` tests pass; `slug report`/`cohort gate`/`pull` tests pass; typecheck clean. Commit only your three files on your worktree's detached HEAD; message like `timing: add --flow issue lifecycle report` — no Test-Change trailer (you change no test file). Then fill:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
