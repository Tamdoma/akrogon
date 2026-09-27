# Plan: startup-resume

Direct synthesis. `debate: no`, so this plan comes from the brief, the locked design and live surfaces. No positions or rebuttals exist. Design wins on any conflict; none found.

## Decisions

- D1: `--resume` always covers all registered repos, regardless of cwd. It does not scope to the current checkout like `--all` does inside one.
- D2: Resume set per repo is one `discover` filtered to `phase === 'merged' || tab set || worktree set`, dispatched with `explicit: false` through the existing `sweep` (merged-first order kept). `completed` outcomes are ignored: no follow-up sweep, so unallocated dependents never start.
- D3: The resume branch always ends with `cleanupRepos` over all registered repos. Startup cleanup is preserved.
- D4: `next` options become `{all, resume}` for the `next` verb only. Target, `--all` and `--resume` are mutually exclusive under one error: `Use a target, --all or --resume, not combined`. This replaces the old two-way text, which would mislead once three options exist. No test locks the old text.
- D5: `akrogon.ts` passes `'--resume'` to `nextCommand`. `nextCommand` bypasses selection for `'--resume'` like `'--all'` and adds a resume branch after the `--all` branch.
- D6: `plugin/herdr-plugin.toml` second startup entry becomes `["sh", "next.sh", "--resume"]`. The pull entry is unchanged. `plugin/next.sh` is unchanged: it already forwards argv.
- D7: The `next` command reference becomes `[<slug>|<path>|--all|--resume]` in `README.md` and `tests/command-reference.test.ts`. The escaped-alternatives override gains `--resume`; the invalid list gains `[<slug>|<path>|--all]` to lock the new flag as required.
- D8: `tests/pull.test.ts` startup manifest assertion becomes `next.sh --resume` with a renamed title. Its wrapper-forwarding loop is unchanged: it tests the forwarding mechanism, not the flag.
- D9: `docs/guide/next.md` startup line states resume-only. `limits.md:10`, `problems.md:51` and `merge.md:27` stay true (resume still cleans) and are not edited. `cheat.md` and `watch-issues` mention manual `--all` only; verified unaffected.
- D10: `tests/next.test.ts` gains two tests (two-repo resume; merged completion with dependent held) plus rejection of `--resume` with a target and with `--all`. The epic-sibling startup test switches to `--resume`. The retry-closure startup test stays on `--all` to keep `--all` closure coverage.
- D11: Failed and hand-built leaves matching the resume filter need no special case. `dispatchLeaf` already returns `waiting` for them under `explicit: false`.

## Terms

- Allocated means `state.tab` or `state.worktree` is set.
- Startup means the Herdr startup hook running `next.sh --resume` from outside any registered repo.

## Read-first

- `docs/reference-index.md`
- `src/AREA.md`, `tests/AREA.md`
- `src/akrogon.ts`, `src/next.ts`
- `src/phase.ts` (`completeOwner`), `src/routing.ts` (`requiredSlots`)
- `tests/helpers.ts`, `tests/fake-herdr.ts`, `tests/next.test.ts`, `tests/command-reference.test.ts`, `tests/pull.test.ts`
- `plugin/herdr-plugin.toml`, `plugin/next.sh`
- `README.md` command section, `docs/guide/next.md`, `docs/guide/limits.md`, `docs/guide/problems.md`, `docs/guide/merge.md`
- `learnings/LESSONS.md` (run, do not only read, per 2026-09-10 review; sweep prose for renamed terms per 2026-09-14)

## Interface

`nextCommand` receives `'--resume'` the way it receives `'--all'`: a global flag, never a slug or path.

## Acceptance criteria

- A1: `akrogon next --resume` is accepted; combined with a target or `--all` it exits non-zero. The README row and the command-reference contract list `--resume`.
- A2: The plugin manifest startup is pull `--all` then next `--resume`.
- A3: Two repos, each with one allocated idle leaf and one unallocated ready leaf: `--resume` delivers exactly the 2 allocated prompts, creates no tabs, and both unallocated leaves gain no tab or worktree with attempts still 0.
- A4: A merged leaf still in `issues/open` under `--resume` gets owner completion and worktree, branch and tab cleanup, while its unallocated dependent (blocked by the merged leaf) gains no tab, worktree or prompt.
- A5: `next.md` describes startup as resume-only; the cleanup lines in `limits.md`, `problems.md` and `merge.md` remain true.
- A6: `bun run format`, `bun run typecheck` and `bun test` pass.

## Concrete scenario

Herdr restarts from `$HOME`. Repo `repo` holds allocated idle leaf `a-old` plus fresh `a-new`; repo `other` holds allocated idle `b-old` plus fresh `b-new`; `repo` also holds merged leaf `done` with unallocated dependent `next` blocked by it. One `next --resume` delivers the `a-old` and `b-old` prompts, completes and cleans `done`, and leaves `a-new`, `b-new` and `next` without tab, worktree, prompt or attempts.

## Checklist

1. `src/akrogon.ts`: add `resume` to the `next`-only options, add the D4 guard, pass `'--resume'` to `nextCommand`. Covers A1.
2. `src/next.ts`: extend the selection bypass to `'--resume'`; add the resume branch (D2) with `cleanupRepos` over all repos (D3). Covers A3, A4.
3. `plugin/herdr-plugin.toml`: second startup entry to `next.sh --resume`. Covers A2.
4. `tests/pull.test.ts`: manifest assertion to `next.sh --resume`, retitle the test. Covers A2, A6.
5. `README.md` + `tests/command-reference.test.ts`: D7 contract updates. Covers A1.
6. `tests/next.test.ts`: D10 tests. Build the two-repo fixture per the scenario (explicit `next` to allocate, `resetPrompts` for idle pending, run `--resume` from `f.home`); build the merged-plus-dependent fixture (allocate `done`, move to `merge` then `merged`, run `--resume`, assert owner moved to closed, worktree, branch and tab gone, dependent untouched); assert `--resume` with a target and with `--all` exits non-zero; switch the epic-sibling test to `--resume`. Covers A1, A3, A4.
7. `docs/guide/next.md`: replace `Startup also runs a sweep.` with resume-only wording naming allocated work plus cleanup. Read `limits.md:10`, `problems.md:51`, `merge.md:27`, `cheat.md` and `watch-issues/SKILL.md` to confirm no edit. Covers A5.
8. Run `bun run format`, `bun run typecheck`, `bun test`. Targeted first: `bun test tests/next.test.ts tests/pull.test.ts tests/command-reference.test.ts`. Covers A6.

## Docs

- `README.md`: the `next` row gains `--resume`.
- `docs/guide/next.md`: the startup line becomes resume-only.
- Agent skills: none affected (`watch-issues` uses manual `--all`, still valid).
- `limits.md`, `problems.md`, `merge.md`, `cheat.md`: read during step 7, no change.

## Open limitation

- L1: There is no single-repo resume. `--resume` inside a checkout still covers all repos. A scoped manual pass remains `akrogon next` from that checkout.

## Dependencies

None. Sibling `completion-dependents` also touches `nextCommand`; the second to merge rebases. No ordering needed.

## Credentials

None named. No env check applies.
