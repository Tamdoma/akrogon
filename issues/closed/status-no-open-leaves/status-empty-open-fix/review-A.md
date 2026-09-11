# Review A: status-empty-open-fix

Base: 1956e56c6526df7fe3880b09ac9cf884ecb01c33
Reviewed head: 9b8f5231fa43a2ec6010b124be818aa6149cc4ed
Debate: no (no positions/rebuttal expected)

## Diff inspected

- `src/status.ts`: one `else console.log('  no open leaves')` paired with the existing nonempty table branch; parked line still prints after it. `scanRepo`, `Scan`, `statusCommand` signature and the unreadable path unchanged (D1, D2).
- `tests/status.test.ts`: parametrized missing/empty open tests (C1, C2) asserting exit 0, exact two-line stdout, empty stderr, no row-regex match, directory not created, issues tree snapshot unchanged. Nonempty overview asserts absence of the line (C3). Parked expectation updated to name, empty-state line, parked line, with the other repo's row still readable (C4). Unreadable scenarios now assert exit 1 exactly, add malformed `issues/config.yaml` cases, and assert no empty-state line for the failing repo (C5).

## Verification evidence

- `bun test tests/status.test.ts`: 14 pass, 0 fail, 224 assertions.
- `bun run typecheck`: passed.
- `bun run format`: no changes; `git status --porcelain` empty.
- Full `bun test` (211 pass across 12 files) recorded in the implementation brief section 8 by B; not rerun, no code change since that run.
- `implementation/cli-artifact.log` exists in the authoritative leaf and records entrypoint, removed open directory, stdout `repo` / `  no open leaves`, empty stderr, exit 0, open directory still absent (C6).
- Live surface: `scanRepo` guards `existsSync(open)` on base, so the ENOENT crash named in the brief was already absent; the plan documents this and correctly scopes the change to output only.
- Tests avoid mocks and run the real CLI. Exact stdout assertions match the operator-fixed output line from `design.md`, so they are fixed-reference checks, not prose wording tests.
- Docs: `docs/in-practice.html`, `docs/cheat.html`, `REFERENCE.md` make no conflicting claim about empty-repo output. No doc edit needed.

## Findings

None blocking. No nits.

## Verdict

ready

## Merge checks (slot A)

Rebase target: origin/main at 1956e56c6526df7fe3880b09ac9cf884ecb01c33 (branch already up to date, no conflicts). Head 9b8f5231fa43a2ec6010b124be818aa6149cc4ed.

- `bun run format`: exit 0, no changes.
- `bun test`: 211 pass, 0 fail, 2728 assertions across 12 files.
- `bun run typecheck`: exit 0.
- `test_changed` (`bun test --changed=1956e56...`): 14 pass, 0 fail.
- Advisory: none configured. No nits carried into LESSONS.md.
