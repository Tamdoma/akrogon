# Map C: direct mode (chart seats implement small issues)

Slot C, blind. Evidence tier for every repo claim: better-than-training (inspected code and skill text, read 2026-10-08). Outside sources: one named practitioner from memory, not fetched today (see Outside practice).

## What the intake asks for, restated against the live surface

The operator wants a repo-level, off-by-default setting under which the chart door, after full charting and gating, implements a one-leaf issue itself (door session = A) with the chart's B pane as reviewer, and the door recommends at the handoff review whether to take the lifecycle or go direct, the way it recommends `debate` today (SKILL.md:69).

The informal version already happened: commit `b36a657` (status seats) was written by the door in place on `main` with tests and no reviewer. Nothing in the lifecycle touched it: no worktree, no `akrogon phase` guards, no merge checks, no log line, no closure of GitHub sources.

Existing primitives that cover most of the mode already:

- implement-issue has a **Standalone** section: a prompt without a leaf is a task in the current checkout with this session as A, brief in `implementation/brief.md`, no config/state reads, no phase call, no checker (implement-issue/SKILL.md:10, :86-90).
- check-issue has **no** standalone form; it reads `akrogon config`, the leaf plan, design and report (check-issue/SKILL.md:14). The Fix/Nit bar it would apply lives at check-issue/SKILL.md:51-57.
- The door already exchanges briefs with peers through `<chart>/slots/` files with blind returns (questions.md:46-52), so a "review this diff" exchange needs no new transport.
- Chart markers `Handed off`, `Closed`, `Held` (SKILL.md:85) and the usage script rerun on each marker already give a close-out record.
- Delivered GitHub identities are closed by the door with `akrogon close <owner/repo#n> --by <text>` passing the delivering commit (SKILL.md:35).

So the mode is mostly composition: gating as today, then Standalone implement by the door, a B review exchange with the check-issue bar, a close-out marker. The forks below are where that composition is not obvious.

## Material forks

### F1. Where does the switch live and who reads it?

Config is a strict schema (`repoSchema`, src/config.ts:38-60, `z.strictObject`), so an unknown key in `issues/config.yaml` fails parsing for every command. The key must be added to the schema even if only the door acts on it. `akrogon config` prints the whole repo config (src/config.ts:263-267), which is how the door reads settings (SKILL.md:25).

- 1a (pick) One boolean in `repoSchema`, default false, e.g. `direct: false`, printed by `akrogon config`, acted on only by chart-issues. Cost: a command-side schema change and test for a door-only setting. Breaks nothing later; the command ignores it.
- 1b Door-local switch (operator says it in the intake each time). No code change, but contradicts "set in the settings of the repo" and gives a consuming repo no way to forbid it.
- 1c Machine-level key in `globalSchema` (src/config.ts:23-30). Rejected: operator asked per consuming repo, and `slots` already shows the repo layer is where per-repo policy goes (src/config.ts:59).

Later-invite check on 1a: once the key exists, someone will ask for `direct: always` or size thresholds. Keep it boolean; the size judgement stays with the door's recommendation and the operator's answer (F4).

### F2. Does direct work pass through a leaf record, and if so which?

This is the fork that reshapes everything else. Three shapes, with what each breaks:

- 2a (pick) **No `state.yaml`.** The door still writes the chart folder (required even for a settled direct item, SKILL.md:47, shapes.md:16) and still drafts `brief.md` and `design.md` (SKILL.md:71 drafts them to scratchpad anyway); they are kept under the chart, e.g. `issues/chart/<slug>/leaf/`, not under `issues/open/`. Code goes on a branch worktree the door creates (F3). Review is a slots exchange (F5). Close-out is a `Closed <date>` marker line naming the delivering commit, plus `akrogon close` for any delivered GitHub source. Cost: none of the `akrogon phase` guards run (dirty tree, `issues/` on branch, `Test-Change:` trailers, non-empty branch; src/phase.ts:317-373), so the door and B must apply them by hand or by the same commands. Nothing in `akrogon status` shows the work in flight.
- 2b **Leaf with `hand_built: true`**, door and B run the phases by calling `akrogon phase ... --slot A|B` themselves. `transition` does not check which pane calls it (src/phase.ts:222-315), so implement → check.review → check.repair/fix → merge work with full guards. **Dead end at merge:** `mergeQueue` excludes hand-built leaves (src/turn.ts:9-10), so `akrogon phase <slug> merged` is refused as "not eligible" (src/phase.ts:774-781), and without a batch record from `next` nothing pushes (src/phase.ts:783-806, batch only via `mergeTurn` src/next.ts:887). The leaf can never reach `merged`, `completeOwner` never moves the folder (src/phase.ts:185-220), and sources never close. Finding worth recording on its own: hand-built leaves cannot complete through the command today (docs/guide/state.md:47-60 does not say so).
- 2c **Ordinary leaf, seats run implement/check themselves, then `akrogon next <slug>` for merge.** Gets every guard and the real push. Cost: the merge dispatch allocates a fresh tab with new A and B panes (src/next.ts:337-438, pane IDs are command-owned, shapes.md:259), so a third session merges, not the reviewer; `activeCount` counts the tab; and the door must not have a tab labelled with the slug or `allocate` throws on multiple tabs. It is the lifecycle with the first two phases done by hand, which is close to "just use the lifecycle".

How to choose: 2a if the point is cheapness and the chart seats' context; 2c if the point is guards. 2b is out until the merge-queue exclusion is changed.

### F3. Where does the code get written: `main` at the registered root, or a branch worktree?

The informal version edited `main` at the root. Concrete breakages of that:

- `test_changed` in this repo needs `AKROGON_BASE` (issues/config.yaml:11) and `akrogon config` prints it only when the cwd top differs from the repo root (src/config.ts:270). On `main` at root the check as written cannot run.
- `akrogon sync` refuses staged paths outside issue records (src/sync.ts:20-33) and must run on `main` (src/sync.ts:14-16); `gacp` does `git add .` (docs/guide/gacp.md:28), so a half-finished code change and chart records get staged together or block each other.
- A lifecycle merge pushing to `origin/main` while the door has uncommitted edits at root makes the next pull at root conflict.
- Reviewer B reads a dirty tree, not a range.

- 3a (pick) Door creates `git worktree add -b <slug> <worktree_root>/<slug> <remote>/<default_branch>` as `ensureWorktree` does (src/next.ts:284-288) and works there; `akrogon config` from inside prints `AKROGON_BASE` and seats; B reviews `<remote>/<default_branch>...HEAD`; after approval the door rebases, runs `checks` then `merge_checks`, fast-forwards `main` and removes worktree and branch. Cost: cleanup is the door's job, because sweeps only remove merged leaves' worktrees (src/next.ts:691-700). An orphaned folder under `issues/worktrees/` is invisible to every command.
- 3b Edit `main` at root, no branch. Zero setup. Carries the four breakages above as its cost; acceptable only when the operator accepts "full test suite instead of test_changed" and nothing else merges meanwhile.
- 3c Worktree outside `worktree_root` (e.g. `$TMPDIR`). Avoids the sweep blind spot but loses the `.env` link convention (`linkEnv`, src/next.ts:297-320) that checks reading `.env` may need.

### F4. Who decides "small enough", when, and by what test?

The operator wants the door to advise at the end, like debate. Debate's rule is "defaults to no, asked once at the door, very small issues skip the question" (SKILL.md:69, shapes.md:259).

- 4a (pick) Asked at the handoff review, only when `direct` is enabled and the chart yields exactly one leaf; the door recommends with concrete observable reasons, the operator answers, and silence or a recommendation never selects direct (questions.md:31 already says recommendations cannot supply an answer). Never auto-chosen, unlike debate's "very small skips the question", because it changes who writes the code.
- 4b Door decides alone past a threshold (file count, line count). Rejected: no threshold is observable before implementation, and a misjudged size has no mechanical escape.

Eligibility conditions the door should check before recommending, each grounded in an existing gate:
1. One destination, one leaf, no `blocked-by`, no `produces` (shapes.md:191-199).
2. No external operation needing a Take proof, no `grants`, no `inputs` (SKILL.md:57-63). Direct mode does not waive those; a leaf needing them is not small.
3. No human-only prerequisite pending (SKILL.md:59).
4. B named at open (SKILL.md:25). Single slot means the question is not shown and the footer says why.
5. The door's own context is not near compaction (SKILL.md:6 compaction rule); a door that has drained several charts is a poor implementer.

### F5. What is B's review, and what gates the merge on it?

Lifecycle review is blind, two seats, Fix/Nit bar with realistic source (check-issue/SKILL.md:37, :51), verdict `ready|nits|fix` (check-issue/SKILL.md:49), repair rounds capped by `fix_rounds` (src/config.ts:43, src/phase.ts:300-303).

- 5a (pick) One brief under `<chart>/slots/review-brief-B.md` with the worktree path, range, brief and design paths, the check-issue bar by reference (check-issue/SKILL.md:51-57, the "During check.review" base-run rule :61) and a return path; B returns `review-B.md` with base, reviewed head, evidence and verdict. Door repairs Fixes itself, B re-checks only the repair diff (check-issue/SKILL.md:63), bounded by the repo's `fix_rounds`. Door fast-forwards only on `ready` or `nits` read from the return file (questions.md:46: pane text cannot stand in for a peer answer). Cost: a new "standalone review" paragraph in check-issue so the bar is not restated in the chart brief (DRY home is check-issue, not chart-issues).
- 5b B repairs most Fixes as in `check.repair` (check-issue/SKILL.md:69-89). Matches the lifecycle, but the operator said B is the reviewer; two writers on one branch worktree also need a lane protocol the door does not have.
- 5c A self-review plus B, mirroring check.review's two blind seats (src/routing.ts:32). A reviewing its own diff adds little; skip.

Open question C would ask: with C named, is C a second blind reviewer? The intake says A and B only. Record as off route unless the operator wants it.

### F6. Who pushes and who closes the record?

- 6a (pick) Door fast-forwards local `main` and pushes `<remote>/<default_branch>` with the same fast-forward form the command uses (src/phase.ts:469-472), then appends `Closed <date>: delivered by <sha>` to CHART.md, runs the usage script (SKILL.md:85) and `akrogon close` for delivered sources (SKILL.md:35), then `akrogon sync` for the records. Cost: the door now pushes code, which no skill does today (merge-issue/SKILL.md:10 "never runs git push"). Push must be the plain ref push, never `gacp`, so chart records are not swept into the code commit.
- 6b Door stops at a merged local `main`; operator pushes with `gacp`. Keeps "agents never push" but `gacp`'s `git add .` stages chart records with any leftover edits, and delivered-source closure waits on the operator.

Broadcast: `broadcast-issue` is tied to `issue complete` lines from `merged` (broadcast-issue/SKILL.md:10). Direct work has no issue folder, so no broadcast unless the operator wants a manual run with the brief as context. Suggest off route by default.

### F7. Which checks run, and which lifecycle guards are kept by hand?

- `checks` all block, `advisory` are Nits (implement-issue/SKILL.md:68). `merge_checks` must also run before the fast-forward, since no merge seat exists (merge-issue/SKILL.md:41).
- `Test-Change:` trailers are enforced only by `requireTestChangeCitations` on phase moves (src/phase.ts:334-363). Direct mode keeps the rule as B's check (check-issue/SKILL.md:47) or the door runs the same check as a command on its range; the door can call `bun -e` into `src/phase.ts` the way the presence check does (SKILL.md:80).
- `issues/` on the branch: the leaf rule refuses it (shapes.md:267). Direct mode has no branch guard, so this becomes the one place where skill or docs work that touches `issues/config.yaml` could ship. State explicitly whether direct mode may touch `issues/` or must keep records to `akrogon sync`.

## Practitioner questions (not yet forks)

- Q1 Escape hatch: when the "small" change grows mid-implementation, what happens? Proposed: the door stops, keeps the branch, and hands off the already-drafted brief/design as a normal leaf at `plan.synthesis`; the existing-branch path of `ensureWorktree` (src/next.ts:285-286) will adopt the branch if the slug matches. Needs the slug chosen once, up front.
- Q2 Does direct work appear anywhere while in flight? `akrogon status` sees only leaves (src/state.ts:132-144). A chart folder without a marker is the only trace. Acceptable for a one-sitting change; the footer rule (SKILL.md:89-94) must say "implementing <slug> in <worktree>" at every pass end.
- Q3 Usage: the usage script measures the door seats from `seats.yaml` open time (shapes.md:124-137). Implementation time lands in the same table. Fine, and useful for comparing modes, but USAGE.md should say the chart was delivered direct.
- Q4 Capacity: `max_active` counts leaves with live tabs (src/next.ts:322-335). Direct work is uncounted. Acceptable at one at a time; say so.
- Q5 Permissions: dispatched seats run with `--dangerously-skip-permissions` (machine `config.yaml` harness line). The door session runs with whatever the operator opened. An implement pass in an attended door may hit permission prompts; not a blocker, but the operator should expect it.
- Q6 Debate interaction: `debate` is a leaf field (src/state.ts:66). Direct mode has no leaf, so the debate question is replaced, not added. The handoff review asks one question: lifecycle (with debate yes/no) or direct.

## Pitfalls over the mode's lifetime, and what removes each

- P1 Hand-built leaves cannot finish (F2b). Removed by not using `hand_built` for this mode; separately worth a seed since docs promise manual handling.
- P2 `test_changed` cannot run on `main` at root (F3). Removed by the branch worktree, where `akrogon config` prints `AKROGON_BASE`.
- P3 Orphan worktree under `issues/worktrees/` (F3a). Removed by a done-criterion in the mode: worktree and branch removed before the `Closed` marker, verified with `git worktree list`.
- P4 Chart records and code in one commit (F6). Removed by never using `gacp` from the door; code commits on the branch, records through `akrogon sync`.
- P5 Review bar drift between check-issue and the chart brief (F5). Removed by a standalone-review section in check-issue that the brief points to, no restatement.
- P6 Mode creep: direct chosen for work that needed proofs or grants. Removed by the eligibility list in F4 being refusals, not advice: any `grants`, `inputs`, `produces` or `blocked-by` in the draft readiness makes the question disappear.
- P7 Door context: compaction mid-implementation loses the worktree state. Removed by CHART.md pointing at the worktree, branch and review file (resume rule SKILL.md:6).
- P8 Concurrent lifecycle merges move `origin/main` under the door. Removed by rebase-then-fast-forward with `merge_checks` rerun after rebase, as merge-issue does (merge-issue/SKILL.md:51).

## Outside practice

Named practitioner, from memory, not fetched today: Rouan Wilsenach, "Ship / Show / Ask" (martinfowler.com, 2021), a branching strategy where small trusted changes merge without review ("ship"), changes that benefit from a look are merged and shown, and uncertain changes wait for review ("ask"). The intake's direct mode is "show": the author merges with a lightweight review. His condition that flips the advice is confidence plus a strong test suite; without blocking checks, ship/show is unsafe. That matches keeping `checks` and `merge_checks` blocking in direct mode. No search was run for a second source; model-knowledge tier for the citation.

## Off route (proposed)

- Per-change dispatch into the lifecycle with the chart panes as recorded seats: pane IDs are command-owned (shapes.md:259).
- Broadcast for direct work: tied to issue completion (broadcast-issue/SKILL.md:10).
- C as a second reviewer: intake names A and B only.
- Size thresholds in config: not observable before implementation (F4b).

## Questions C would ask the operator that the intake does not settle

1. Direct mode without a `state.yaml` (2a) or with the merge dispatched by the command (2c)?
2. Branch worktree (3a) or edit `main` at root (3b), knowing `test_changed` cannot run at root?
3. Does the door push, or does the operator push after B's verdict (F6)?
4. May direct work touch `issues/` paths, which leaves may not (F7)?
