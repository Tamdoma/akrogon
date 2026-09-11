# Review A: chart-issues

Slot A, 2026-09-11. Base `398761c`, reviewed head `308d5ed` (one commit, `git status --porcelain` empty). Read `positions-A.md`, `rebuttal-A.md`, `plan.md`, `implementation/brief.md`, `implementation/verification.md`, `implementation/fresh-reader.md` and the four JSON evidence files, then the full diff and the live command surfaces.

## Verification evidence

- Diff scope: `git diff --name-only 398761c HEAD` touches only `skills/chart-issues`, `skills/create-issue`, `skills/braindump-issues`, `skills/consolidate-issues`. 43 files, 235 insertions, 4035 deletions. No change outside ownership (D8, A6).
- Criterion 1: `SKILL.md` is 62 lines, 5,825 bytes; B recorded 1,120 tokens with gpt-tokenizer 3.4.0 o200k_base. Folder holds `SKILL.md` and `assets/{questions,shapes,standing-design}.md` only. `akrogon` is named as the dependency. Rule count judged by reading: under 20 substantive constraints, matching the fresh reader's 17. Pass.
- Criterion 2: the Open, Drain, Decide and Handoff sections carry the pane-named B with blind map, pull on open with the unregistered/non-GitHub continue path, exact-identity sources skip, speed-of-resolution split shown before writing, lessons prune, blind pass with tagged merge, one rebuttal and the focused check on late changes with restatements exempt, human-step warning and completion, debate question once with default no and the very-small skip, one chart per destination then stop, direct handoff, and the footer with `Next: none`. `EPIC.md` and `ISSUE.md` are named only in `shapes.md`, which Handoff triggers (see N1). The fresh reader's six scenarios (F1–F6) reached the same conclusions without guessing. Pass.
- Criterion 3: `status-before.json` shows two leaves under an epic parsed by the live schema; `dispatch.json` records fake herdr prompts `plan-issue emit-identity slot=B phase=plan.synthesis` and both `plan.positions` prompts for the `debate: yes` leaf; `refusals.json` records the missing `blocked-by` and occupied-partial-leaf refusals before any write with unchanged snapshots; `missing-dispatch.json` shows the command's own `Missing leaf: missing` exit 1 for malformed external state. Pass.
- Criterion 4: `ls skills` lacks the three folders; `grep -rln "create-issue\|braindump-issues\|consolidate-issues" skills` is empty. Pass.
- Criterion 5: `grep -rni "issues/chart/archive\|SERIES-\|consult-position\|parking\|park\|per-leaf confirmation" skills/chart-issues` hits one line: the creation-locked standing block's "parks at dispatch before any seat spawns" in `standing-design.md:10`. See N2. Otherwise pass.
- Standing block: the nine lines in `assets/standing-design.md` diff byte-identical against the design's block (exit 0). The interpretation paragraph beside it disallows a hold state and requires known human steps done before a leaf opens, matching the design's reading note and D7.
- Locked design against my rebuttal forks: debate default `no` (F1) present in Handoff and shapes; standing lines verbatim (F2); three assets (F3); `sources` always written (F5). F4 (delete legacy seed at handoff) was resolved the other way in synthesis; the skill keeps source files unchanged and skips legacy paths through intake provenance. That is a consistent choice, not a defect.
- Live claims: `shapes.md` says effective config prints `repo: none`; `src/config.ts:127` prints exactly that. All three asset links resolve. `akrogon status` as the schema check matches `src/status.ts` behavior.
- Checks: B recorded `bun run format`, `bun test` (46 pass, 0 fail), `bun run typecheck` and `git diff --check` all exit 0 after writer completion. No code changed in this leaf, so I did not rerun them.

## Findings

Verdict: nits.

- N1 `SKILL.md` Handoff does not name `EPIC.md` or `ISSUE.md`; the tree shape lives only in `shapes.md`. Criterion 2 lists them under the handoff read. A fresh reader with the triggered reference found them (fresh-reader F1, F11), so this is a wording gap, not a missing behavior. One clause in Handoff would close it.
- N2 L1 as planned: the verbatim standing block keeps "parks at dispatch". Criterion 5 and the design's verbatim lock conflict on this one sentence; the design lock wins and the interpretation paragraph neutralizes it. Reported, not hidden, as the plan required.
- N3 The Open and Decide paragraphs are single 60–90 word sentences chained with semicolons. Every clause is correct, but long chains lower compliance across harnesses, which is the reason the cap exists. Splitting them costs no lines against the budget.

No Fix: no done criterion fails, no blocking check is red, no reproducible defect in the written workflow or the deleted surfaces.

## Lesson

None new. The 2026-09-10 core-skills lesson (grep old names, report out-of-scope hits) was followed: README, docs/guide.html, new-beginning and reference hits are listed in `verification.md` for retire-old.

## Merge (slot A, 2026-09-11)

Rebase target `origin/main` at `398761c`, already the base, so `git rebase origin/main` reported up to date and `AKROGON_BASE` stayed `398761c`. Checks in the worktree: `bun run format` exit 0 with all files unchanged, `bun test` 46 pass 0 fail 487 assertions, `bun run typecheck` exit 0. Lesson from N2 recorded as one line in `learnings/LESSONS.md` with `learnings/history/2026-09-11-lock-vs-criterion.md`, committed as `a40ff4d`. Pushed `HEAD:main` fast-forward, `398761c..a40ff4d`; `git merge-base --is-ancestor` confirms it landed.
