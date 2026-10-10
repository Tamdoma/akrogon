# Worker brief U1: hold module + `--red-on-base` ending

## 1. Goal

Implement plan decisions D1–D4, D8 for leaf `red-main-hold`: a new `src/hold.ts` (per-repo merge hold in `held.yaml`), a `--red-on-base` ending in `src/phase.ts` that restores the batch, clears the record, writes the hold, appends one `held` attempt line, prints and notifies, and `unhold` plus new `phase` flags in `src/akrogon.ts`. Done-criteria proven: 1, 2, 5 (unhold half), 7.

## 2. Numbered acceptance criteria

1. `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha> --command <exact command>` on a leaf holding an applied batch, where `<sha>` equals the fetched `origin/main`, exits 0 and: holder still phase `merge`; `state.batch` undefined; `state.batch_limit` unchanged by this call; member branches back at their saved `head`s; `held.yaml` under `AKROGON_HOME` maps the repo name to `{sha, command, holder: <slug>, attempt: <attempt>, at: <ISO>, evidence: <leaf path>/review-B.md}`; `issues/merge-attempts.jsonl` gains exactly one line with `outcome: "held"`; stdout contains `held <repo> on <sha>: <command>`; fake-herdr `.calls` shows exactly one `notification show` whose title names repo and sha. Same shape for a solo record (`members: []`).
2. Refusals all exit nonzero, print a named reason, and change nothing (no hold, no attempt line, batch intact): stale/missing `--attempt`; a `--red-on-base` sha that does not equal the fetched `origin/main` after this call's own `git fetch`; `--red-on-base` on a phase other than `check.fix`; `--command` without `--red-on-base`; `--red-on-base` without `--command`; `--check` combined with `--red-on-base`; `--red-on-base` when the leaf holds no batch record.
3. `akrogon unhold` from the repo root clears the entry and prints `unheld <repo>`; on a repo with no hold it exits nonzero naming the repo. It resolves the repo from a subfolder and a leaf worktree, like `pause`.
4. A notification failure never strands the call: the hold, attempt line and state changes are already committed when herdr is unreachable (warn, do not throw, same degrade as `mergeNotice` in `src/next.ts`).

## 3. Read-first list

- `src/pause.ts` — the module shape to mirror: `globalHome()` YAML record file, `ENOENT`-means-empty read, `PauseStateError`-style typed error naming the file, `withLock(globalHome()/.lock)` writers, `pauseCommand(cwd)` resolving the repo via `readGlobal`/`requireRepo`.
- `src/phase.ts` — `phaseCommand` (~line 770 end of file): flag parsing at the top, the merge+`check.fix` block with stale-attempt check, member-split path (`memberEntries`, `restoreMembers`, `restoreHolder`, `batch_limit`, `appendAttempt(..., 'split')`), solo path (`transition` with `appendAttempt(..., 'red')` in `onCommitted`); `herdrCall` retry helper (~line 35).
- `src/batch.ts` — `restoreMembers`, `restoreHolder`, `equalOutsideRecordFolders`.
- `src/attempts.ts` — `appendAttempt(repo, holder, batch, outcome, culprit?)`; `'held'` is already in `attemptOutcomeSchema`.
- `src/preflight.ts` — `localBase(repo)` returns fetched `origin/main` sha; `trackingRef(repo)`.
- `src/akrogon.ts` — per-verb option map and `case 'unpause'` block; `parseArgs` keeps dashed names as `values['red-on-base']` and `values.command` (verify: `node:util` parseArgs does not camelCase).
- `tests/merge-attempts.test.ts` — `batchFixture`, `soloFixture`, `attemptLines`, `advanceRemote`, `remoteTip` helpers; `tests/helpers.ts` — `fixture()`, `leaf()`, `cli()`, `fakeHerdr()`; `tests/fake-herdr.ts` — `notification show` records into `db.calls`.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

Owns: `src/hold.ts` (new), `src/phase.ts`, `src/akrogon.ts`, `tests/hold.test.ts` (new). Depends on nothing else in flight; U2 (`src/next.ts` guard) and U3 (`src/status.ts`) land in a later wave on these exports.

`src/hold.ts` exports (signatures are the U2/U3 interface — keep them):

```ts
export class HoldStateError extends Error            // `Invalid hold state in <file>: <reason>`
export const holdSchema = z.object({                 // per-repo record
  sha: z.string().min(1),
  command: z.string().min(1),
  holder: z.string().min(1),
  attempt: z.string().min(1),
  at: z.string(),
  evidence: z.string().min(1),
  fix: z.string().min(1).optional(),                 // interface for hold-fix-leaf; never set by this leaf
});
export type Hold = z.infer<typeof holdSchema>;
export function heldFile(): string                   // resolve(globalHome(), 'held.yaml')
export function readHeld(): Record<string, Hold>     // lock-free; ENOENT → {}, invalid → HoldStateError
export function heldFor(repoName: string): Hold | undefined
export function writeHeld(repoName: string, hold: Hold): void   // lock-free; caller holds the lock
export function dropHeld(repoName: string): void                // lock-free; caller holds the lock
export async function setHeld(repoName: string, hold: Hold): Promise<void>  // wraps writeHeld in withLock
export async function clearHeld(repoName: string): Promise<void>            // wraps dropHeld in withLock
export async function unholdCommand(cwd: string): Promise<void> // resolves repo, drops, prints `unheld <name>`; throws `No hold on <name>` when absent
```

`withLock` is not reentrant (nested `flock` on the same path deadlocks), so callers inside an existing `withLock` must use the lock-free functions — `phaseCommand` runs inside `withLock`.

`src/phase.ts` (`phaseCommand`):

- New params `rawRedOnBase`, `rawCommand` parsed as `z.string().trim().min(1).optional()`.
- Early refusals: `--command` without `--red-on-base`; `--red-on-base` with a phase that is not `check.fix` or combined with `--check`; `--red-on-base` without `--command`.
- Inside the existing `leaf.state.phase === 'merge' && record !== undefined && requested === 'check.fix'` branch, after the stale-attempt check and before the member/solo fork: if `redOnBase` is set → `await command(['git','fetch',repo.config.remote], repo.root)` (a failed fetch throws — refusal, nothing changes), `const baseSha = await localBase(repo)`, throw unless `redOnBase === baseSha`. Then `await restoreMembers(repo, memberEntries(repo, record).map(e => ({...e.member, leaf: e.leaf})))` and `await restoreHolder(repo, leaf, record)`; `appendAttempt(repo, leaf.state.slug, record, 'held')`; `saveState(leaf.path, {...readState(leaf.path), batch: undefined})` — no `batch_limit` write; `writeHeld(repo.name, {sha: redOnBase, command: cmd, holder: leaf.state.slug, attempt: record.attempt, at: new Date().toISOString(), evidence: resolve(leaf.path, 'review-B.md')})`; `console.log(\`held ${repo.name} on ${redOnBase}: ${cmd}\`)`; `committed = true`. Then notification via `herdrCall(['notification','show', \`${repo.name} merge held on ${redOnBase.slice(0,12)}\`, '--body', cmd, '--sound', 'request'], z.object({shown: z.boolean(), reason: z.string()}), slug)` wrapped so a failure logs a JSON warning and does not throw (shape of `mergeNotice` in `src/next.ts`). Do this identically for member and solo records — do not run `transition` or the split path.
- `--red-on-base` when `record === undefined` (leaf in merge without a batch): refuse before any state change.

`src/akrogon.ts`: phase options gain `'red-on-base': { type: 'string' }` and `command: { type: 'string' }`; pass `values['red-on-base']` and `values.command` as the two new `phaseCommand` args. Add `case 'unhold': z.tuple([]).parse(positionals); await (await import('./hold')).unholdCommand(process.cwd()); break;`. Add `unhold` to the usage string. Do not touch the `unpause` case (another unit prints the hold there).

`tests/hold.test.ts`: build on `fixture()`, `leaf()`, `cli()`, `fakeHerdr()` and copy the needed fixture helpers (`batchFixture`, `soloFixture`, `attemptLines`) from `tests/merge-attempts.test.ts` — copy, do not refactor or export from that file. `cli` env must include `herdr.env` (from `fakeHerdr(f)`) and `AKROGON_LEAF_TEMP_ROOT` is handled by `cli`. `held.yaml` lives at `resolve(f.home, 'held.yaml')`. Cover criteria 1–4; assert the exact printed `held <repo> on <sha>:` prefix and `notification show` args from the `.calls` file, not prose.

One deliberate break turning a new test red (record it in the report): e.g. temporarily skip `writeHeld` and watch the held.yaml assertion fail.

## 5. Do-not, reasons and exceptions

- Do not halve or write `batch_limit` — the hold replaces the split; that is criterion 1's "without changing any batch limit".
- Do not call `transition`/`commitMove` on this path — the leaf must stay in `merge`; any move violates criterion 1.
- Do not add a fetch inside `mergeTurn` or touch `src/next.ts`, `src/status.ts`, `src/pause.ts` — later units own them; only the `unhold` case and phase options in `src/akrogon.ts` are yours (do not touch the `unpause` case).
- Do not broaden `holdSchema` beyond the fields above; `fix` is the only forward field, never populated here.
- Do not use `try/catch` around `localBase` or `equalOutsideRecordFolders` — trust invariants; a throw is a refusal with context.
- Return a mismatch with evidence instead of changing an interface or scope; the exception is a revised brief from A. Restating: the exclusions exist to keep one owner per file and the hold semantics identical to the design; only a revised brief from A authorizes a change.

## 6. Ordered steps

1. Write `tests/hold.test.ts` case (a) first — batch `--red-on-base` happy path (criterion 1,7).
2. `src/hold.ts` module; `src/akrogon.ts` `unhold` case + usage.
3. `src/phase.ts` flag plumbing + refusals + the hold path (criteria 2,1).
4. Add refusal cases (c) and solo case (b), `unhold` cases (d), notification-failure case (4).
5. Run the changed-test command until green; run one deliberate break and confirm red.

Advisory size: 4 files, under 60 turns.

## 7. Commands

```sh
AKROGON_BASE=547063c52e068702aaa9e77117b749e9d1341275 bun test --changed="$AKROGON_BASE" --timeout=30000
```

In the worker worktree `bun test tests/hold.test.ts` is the tight loop; run the full changed set before finishing. `bun install` first if `node_modules` is absent (the worktree is a fresh checkout).

## 8. Done-when, evidence and report

All acceptance criteria pass with pasted outputs; commit ID returned. `tests/hold.test.ts` is a new file so no `Test-Change:` trailer is needed; any other touched existing test file needs the trailer per repo rules.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
