# Review B

Date: 2026-10-02
Phase: check.review (initial)
Base: b2c15ec5d2fe889e158934b084dd93cfeafc9f72
Reviewed head: 11c6d79805983dd7d4be1058b2dcce5baa9bc07c
Verdict: fix

## Fixes

### F1: Registered-checkout ignore refusal names the wrong link path

- Location: `src/next.ts:290`, regression assertion at `tests/next.test.ts:3709`.
- Realistic source: an operator dispatches `akrogon next build` from a registered checkout without its `.env` ignore rule, while the committed rule remains present in the new leaf worktree. This is the explicitly planned missing-checkout-ignore scenario.
- Consequence today: the error identifies `<registered root>/.env` as the refused link, rather than `<worktree>/.env`. The diagnostic loses the link location required by plan D4 and criterion 4, and the new test accepts that incorrect location.
- Live trace: exercised the actual CLI through `fixture`, `fakeHerdr`, `leaf`, and `cli`, changing only the registered checkout's `.gitignore` to `node_modules\n`. Exit was 1. Expected link path was `/tmp/akrogon-1000/env-link-4e8b9a07ad14/akrogon-xFQI2a/repo/issues/worktrees/build/.env`. Actual error was `Refusing .env link at /tmp/akrogon-1000/env-link-4e8b9a07ad14/akrogon-xFQI2a/repo/.env: path is not ignored in the registered checkout /tmp/akrogon-1000/env-link-4e8b9a07ad14/akrogon-xFQI2a/repo`.
- Required repair: identify `link` in the refusal, retaining the registered checkout in the reason. Correct the test to check the worktree link path. No plan or design change is needed.

## Verification

- Read brief, plan including implementation notes, design, report, and ponytail guidance. Debate is disabled, so B position/rebuttal artifacts are not expected. Peer review was not read.
- Inspected the complete six-file diff, `ensureWorktree` → `linkEnv` → allocation/seat dispatch, subprocess exit contracts, and merged-worktree cleanup.
- Reran `bun test tests/next.test.ts` for F1's specific concern: 159 pass, 0 fail, 1427 assertions. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-review-B-next.log`. The passing test currently encodes F1 rather than detecting it.
- Reused unchanged implementation-report evidence for the full suite (367 pass), changed suite (359 pass), typecheck and format. No code was edited in this review.
- Root `git check-ignore -q .env` succeeded. The committed fixture rule and link creation/reuse, dangling target, refusal preservation/no-seat, retry-after-refusal, and cleanup scenarios are covered by the inspected passing tests, subject to F1's diagnostic gap.
- Opened `docs/guide/next.md`, `docs/guide/files.md`, `src/AREA.md`, and `docs/reference-index.md`. The added area line correctly describes the new behavior. The unchanged guide pages make no conflicting claims.
- One repository-root shell listing checked every named file path in changed `src/AREA.md`: `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `docs/reference-index.md`, `tests/helpers.ts`, and `tests/phase.test.ts` all exist. No dead pointers.

## Nits

None.

## Operator actions

None.

## 2026-10-02 check.repair

Reviewed both initial reviews at `11c6d79805983dd7d4be1058b2dcce5baa9bc07c`. F1 was the only Fix. A's N1/N2 remain deferred under their recorded rationale.

Repaired F1:

- Test commit `fc74745`: corrected the existing registered-checkout-ignore test to require the absolute worktree link path, without coupling that assertion to message wording.
- Red proof: `bun test tests/next.test.ts` → 158 pass, 1 fail. The registered-checkout-ignore case expected `/repo/issues/worktrees/build/.env` and received `Refusing .env link at /repo/.env: path is not ignored in the registered checkout /repo`. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-repair-B-red.log`.
- Fix commit `dd20cea`: substituted `link` for `target` in that refusal. The reason still identifies the registered checkout.
- Green proof: `bun test --timeout=30000` → 367 pass, 0 fail, 16 files, including the corrected refusal test and the whole `tests/next.test.ts` restart boundary. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-repair-B-suite.log`.

Final head: `dd20ceaa918baaa60d2c5b11a50193ab43fa84ad`. Worktree clean.

Done-criterion proof:

1. Creation and read-through append: passing dispatched-worktree-link test in the full suite.
2. Reuse: passing deleted-link recreation and pre-linked-worktree tests.
3. Missing target: passing dangling-link/no-target test.
4. All five refusals: passing real-file, tracked-file, stale-link, worktree-ignore and corrected registered-checkout-ignore tests. Each checks no prompts/starts and path preservation. Registered-checkout case also proves retained-worktree reuse after recovery.
5. Cleanup: passing merged-leaf cleanup test proves target content survives worktree removal.
6. Root `.env` rule: `rg -n '^\.env$' .gitignore` → `7:.env`; `git check-ignore -q .env` → exit 0. The committed fixture rule is exercised by the passing dispatch tests.

Configured checks:

- `bun run format` → exit 0, no additional changes. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-repair-B-format.log`.
- `bun run typecheck` → clean.
- `bun test --timeout=30000` → 367 pass, 0 fail.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with base `b2c15ec5d2fe889e158934b084dd93cfeafc9f72` → 359 pass, 0 fail, 13 files. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-repair-B-changed.log`.

No items handed to A. No operator actions remain. F1 resolved, repair verdict ready.

## 2026-10-02 merge

- Prior reviewed/repaired head: `dd20ceaa918baaa60d2c5b11a50193ab43fa84ad`.
- Fetched `origin` and rebased onto `origin/main` at `7c1567dbed492608e8cc104999c401b85d6db408` without conflicts.
- Rebased head: `4c71bdc675e088534fbe636daa7b17e902e61fd2`.
- Range-diff from old base `b2c15ec5d2fe889e158934b084dd93cfeafc9f72` to the prior head against target-to-rebased-head showed all six commits equivalent (`=`).
- Refreshed `akrogon config` after rebase: `AKROGON_BASE=39cb4c0b020af3dc784c7473d08937f9007c2b3f`, remote `origin`, default branch `main`.
- `bun run format`: exit 0, no changes. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-merge-B-format.log`.
- `bun test --timeout=30000`: 370 pass, 0 fail, 16 files. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-merge-B-suite.log`.
- `bun run typecheck`: exit 0.
- Configured changed-test command with refreshed base: 362 pass, 0 fail, 13 files. Log: `/tmp/akrogon-1000/env-link-4e8b9a07ad14/env-link-merge-B-changed.log`.
- No configured merge checks or advisory checks. `git diff --check` passed and the worktree is clean.
- Gathered the completion owner's `leaf-readiness/ISSUE.md` and all five leaf briefs before any completion move. No reusable Nit held by B requires a lesson entry.

### Competing merge retry

The first push was rejected as non-fast-forward. Repeated fetch/rebase onto `7c1567dbed492608e8cc104999c401b85d6db408`. Conflicts in `tests/next.test.ts` joined independently appended readiness and env-link tests and their imports. Retained the complete readiness-side file, appended all env-link tests, retained both sets of imports, and reapplied formatting. No tests were removed.

Prior push head: `4c71bdc675e088534fbe636daa7b17e902e61fd2`.
Old refreshed base: `39cb4c0b020af3dc784c7473d08937f9007c2b3f`.
Resolved head: `8e10eef6733eb7974f590a37c69234c54295ca63`.
Refreshed base after completed retry: `7c1567dbed492608e8cc104999c401b85d6db408`.

Range-diff (`old-base..prior-head target..resolved-head`):

```text
1:  70dc9c8 = 1:  88f96a1 Link .env into leaf worktrees via linkEnv
2:  db94fa4 = 2:  c56bd9a test(env-link): fixture and root gitignore ignore .env
3:  6ec7685 ! 3:  9560804 test(env-link): prove .env link creation, reuse, dangling and refusals
    @@ tests/next.test.ts: import {
        chmodSync,
     +  lstatSync,
     +  readlinkSync,
    +   mkdtempSync,
      } from 'node:fs';
      import { resolve } from 'node:path';
    - import {
    -@@ tests/next.test.ts: test('fixture temp root isolates every TMPDIR and envs carry override', async ()
    +@@ tests/next.test.ts: test('an invalid readiness.yaml skips the leaf and names the file path', async (
          f.clean();
        }
      }, 15000);
     +
    -+
     +test('a dispatched worktree links .env to the registered checkout and reads appended lines', async () => {
     +  const f: DispatchFixture = await dispatchFixture();
     +  try {
4:  c68a0a2 ! 4:  3b62eb0 style(env-link): prettier format
    @@ src/next.ts: async function linkEnv(repo: Repo, worktree: string): Promise<void>
        let stats: ReturnType<typeof lstatSync>;
        try {
          stats = lstatSync(link);
    -
    - ## tests/next.test.ts ##
    -@@ tests/next.test.ts: test('fixture temp root isolates every TMPDIR and envs carry override', async ()
    -   }
    - }, 15000);
    - 
    --
    - test('a dispatched worktree links .env to the registered checkout and reads appended lines', async () => {
    -   const f: DispatchFixture = await dispatchFixture();
    -   try {
5:  769ffbc = 5:  2c67147 test: require worktree path in env ignore refusal
6:  4c71bdc = 6:  8e10eef fix: identify worktree link in env ignore refusal

```

Post-conflict checks at `8e10eef6733eb7974f590a37c69234c54295ca63`:

- `bun run format`: exit 0, unchanged files; log `$TMPDIR/env-link-merge-B-retry-format.log`.
- `bun test --timeout=30000`: 393 pass, 0 fail, 17 files; log `$TMPDIR/env-link-merge-B-retry-suite.log`.
- `bun run typecheck`: exit 0.
- Configured changed tests using refreshed base `7c1567dbed492608e8cc104999c401b85d6db408`: 385 pass, 0 fail, 14 files; log `$TMPDIR/env-link-merge-B-retry-changed.log`.
- No merge/advisory checks configured. Worktree clean; `git diff --check` passed.

The log directory remains `/tmp/akrogon-1000/env-link-4e8b9a07ad14`.

Confirmed fast-forward push: `git push origin HEAD:main` succeeded, advancing `main` from `7c1567d` to `8e10eef`.
