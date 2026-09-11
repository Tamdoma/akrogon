# Review A: init-issues

Base: f281241901d0f1c8a2bfd5943be838fb14f5eb9c
Reviewed head: 0f48c9f1fd837d29a5b21a074e468a3a199a2b88
Debate: no, so no positions-A/rebuttal-A exist.

## Verdict: ready

## Verification

- Diff scope: `skills/init-issues/SKILL.md` rewritten, 11 tracked files under `payload/` and `scripts/` deleted, leaf evidence under `implementation/`. No src or tests changes. `git diff --check` exit 0.
- Contract check against `src/init.ts` and `src/config.ts`: the skill's command-ownership list (both config files, repo registration, `issues/open`, worktrees/seeds/.lock ignore entries, `learnings/LESSONS.md`) matches `initialize()`. Every proposed key exists in `repoSchema`; no retired keys.
- `bun test --help` on Bun 1.4.0 confirms `--changed=<val>` with an optional commit, so the recorded proposals use a real runner interface.
- Independent scenario (isolated AKROGON_HOME, fake harness, temp git repo with bun test + lint script, run through `src/akrogon.ts`):
  - `akrogon config` once, skill-authored `REFERENCE.md` only, proposal via quoted heredoc, `init --from`: exit 0.
  - Resulting `issues/config.yaml` matches the proposal with `$AKROGON_BASE` preserved literally. Global config registered the repo. Package manifest byte-identical. gitignore and LESSONS.md written by init.
  - lint exit 0, test exit 0, `test_changed` with fixture base exit 0 (1 file selected), unset base exit 127 before the runner, deliberately wrong assertion exit 1, restored green.
  - Repeat `init` without proposal: exit 0, index bytes unchanged.
  - No-tests repo with `--toolkit python=pytest`: toolkit recorded globally, manifest identical, no node_modules.
  - Invalid proposal (`scripts_dir`) rejected with exit 1.
- C5: both trees absent; scoped grep for `scripts_dir|sync-payload|payload/|issues/.scripts` under `skills/init-issues/` returns nothing.
- C1: 82 lines, 588 words, under budget; workflow is followable end to end as shown above. No unconditional must/never rules.
- Blocking checks: B recorded format/typecheck/test (34 tests, 364 assertions) exit 0 after the final change and no executable code changed since, so not rerun.

## Findings

No Fix findings.

Nits:
- N1: The full-suite example in the skill omits the verified `--changed` form even though every recorded proposal uses it. A reader gets the conservative fallback only. Reason: the text says the fallback is for runners without affected selection, so behavior is still correct, just less helpful as an example.
- N2: The grounding sentence ("Reuse a valid configured or discovered top index, or, when no suitable index exists even if the configured path names a missing file, ...") is hard to parse on first read. Reason: prose clarity only, semantics match D5.

## Merge evidence

Rebased 0f48c9f onto origin/main 507aff5 cleanly; new head 7af5184669bc43d6e9f47f30e0bd8fb24c282a7d. AKROGON_BASE refreshed to 507aff5d2e9c1b14631a641854308590b557d745. Checks on the rebased head: `bun run format` exit 0 (no file changes), `bun run typecheck` exit 0, `bun test` exit 0 (34 pass, 0 fail, 364 assertions). Nits N1/N2 are leaf-specific and not reusable, so no lesson added.
