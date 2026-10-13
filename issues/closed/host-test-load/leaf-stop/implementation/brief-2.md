# Brief 2: dispatch and merge gates (U2)

## 1. Goal
Keep a stopped leaf from being dispatched or merged. Plan decisions D5, D6 (plan: /home/ivan/Work/infra/akrogon/issues/open/host-test-load/leaf-stop/plan.md).

## 2. Acceptance criteria
Planned tests (committed, do not edit) in `tests/leaf-stop.test.ts`:
1. `a stopped leaf is not dispatched by an automatic pass, and a picked manual pass names start` passes: a Herdr hook pass exits 0 and prompts nothing; bare `next` and `next build` exit non-zero, stderr contains `akrogon start build`, nothing prompted.
2. `the merge path builds no stack and starts no merge seat for a stopped leaf` passes: stopped `aa` (earlier merge stamp) gets no batch and no `merge-issue aa` prompt; `bb` becomes holder with no members and gets one merge prompt.
3. The rest of the suite stays green (`tests/pause-next.test.ts`, `tests/batch-*.test.ts`, `tests/next.test.ts` cover the paths you touch).

## 3. Read first
- `src/stop.ts` (landed from U1): `isStopped(repoName: string, slug: string): boolean`, `readStopped(): Set<string>` with keys `<repo>/<slug>`.
- `src/next.ts:733-760` `dispatchLeaf` and its paused gate `if (isAutomatic && isPaused(repo.name)) return end('none');`; `src/next.ts:128-135` `report(invocation, repo, path, error, slug)`; `src/next.ts:844-880` `sweepAll`/`sweep` (`picked` is true for `--resume` too, which is automatic); exit code rule `if (invocation.skipped.size > 0) process.exitCode = 1;` near line 1685; `dispatchMergeLeaf` near 1330.
- `src/turn.ts:81-104` `mergeQueue` and its `eligible` filter.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Changes
Owned paths: `src/next.ts`, `src/turn.ts`. Prerequisite: U1 (landed). Shared test resource: none.
- D5 in `dispatchLeaf`, right after the paused gate: when `isStopped(repo.name, slug)`: if `picked && !isAutomatic`, call `report(invocation, repo.name, leaf.path, new Error(\`Leaf is stopped: ${slug}; run akrogon start ${slug}\`), slug)` and return `'skipped'`; otherwise `return end('none')`.
- D6 in `mergeQueue`: add `!isStopped(leaf.state.repo, leaf.state.slug)` to the `eligible` filter. Import from `./stop`. This one filter covers every caller (next.ts merge turn and pass, phase.ts merge wake, status turn column).

## 5. Do-not
- Do not edit tests. A wrong or still-red planned test is a mismatch returned to A. Exception: none.
- Do not add gates at other call sites; D5 and D6 cover them. Reason: one place each. Exception: a planned test proving a missed path, returned as a mismatch with evidence.
- Do not touch src/stop.ts, src/status.ts, docs. Reason: other units own them.
- No broad catch or fallback.
Reasons restated: tests locked; single gate points; other paths owned elsewhere.

## 6. Steps
1. `bun install --frozen-lockfile`.
2. Edit `src/next.ts` (criterion 1), `src/turn.ts` (criterion 2).
3. Run section 7 plus `bun test tests/leaf-stop.test.ts tests/pause-next.test.ts tests/batch-dispatch.test.ts tests/next.test.ts --timeout=30000`.
4. Commit only your files, message `feat: keep stopped leaves out of dispatch and the merge turn`. No co-author line.
Advisory size: 2 files, under 10 turns.

## 7. Commands
`cd <worktree> && AKROGON_BASE=e5776ade920e619e923a7825140f823c2e89123e bun test --changed=e5776ade920e619e923a7825140f823c2e89123e --timeout=30000`

## 8. Report
Return the commit ID and:
Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
