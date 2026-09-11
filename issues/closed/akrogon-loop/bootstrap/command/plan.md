# Plan: command

## User Intent Snapshot

Build the Bun TypeScript `akrogon` command that the remaining leaves will use. This hand-built leaf establishes state transitions, dispatch, configuration, installation and the herdr event hook, with a small command-level test suite. The operator drives this leaf by hand and verifies installation once. It is never transferred into automation halfway through.

This is slot B's synthesis for `plan.synthesis`, from `brief.md` and `design.md`. `state.yaml` sets `debate: no`, so independent positions and rebuttals are not prerequisites. This document does not advance state or authorize an install during planning.

## Scope and Deliverables

- `src/akrogon.ts`: executable Bun entry and argument parsing for `install`, `init`, `config`, `phase`, `next` only.
- `src/install.ts`, `src/init.ts`, `src/config.ts`, `src/phase.ts`, `src/next.ts`: the subcommand implementations.
- `src/routing.ts`, `src/state.ts`, `src/log.ts`, `src/shell.ts`: typed routing, authoritative state and locks, diagnostic move log, and the process boundary.
- `plugin/`: herdr manifest and hook script for status changes, pane exits and startup.
- Root `config.yaml`, `package.json`, project dependency lockfile and necessary TypeScript configuration. Dependencies live in this checkout.
- `tests/config.test.ts`, `tests/init.test.ts`, `tests/phase.test.ts`, `tests/next.test.ts`: observable command contracts using temporary files and real command processes.
- Replacement `issues/config.yaml` and removal of `issues/.scripts/`, after the new config is written. Necessary `.gitignore` changes remove the obsolete scripts dependency entry and include `issues/worktrees/`, `issues/seeds/` and `.lock`.

No `status`, failed notification, `pull`, GitHub close call or startup pull hook, including stubs. Do not rewrite skills, remove `reference/` or `new-beginning/`, migrate lessons history, add a driver, timer, registry, approval phase or new state store. Installation links the skill folders actually present, without authoring their replacements. Consumer package manifests remain untouched.

## Inputs and Grounding

Read the authoritative leaf's `brief.md`, full `design.md` and `state.yaml`. Inspected this worktree's `README.md`, `issues/config.yaml`, `.gitignore`, root layout, `skills/` and `issues/.scripts/` listings. The checkout is on branch `command` and had no changes when inspected.

The existing root has no `src/`, `tests/` or root package manifest. The old scripts and config belong to the retired lifecycle. Reusing that lifecycle would retain the machinery this design explicitly removes. The new source layout is fixed by the design's Leaf architecture section.

`grounding: none` is configured. README describes the earlier undecided scaffold and is not the behavior contract for this leaf. Do not update it as adjacent cleanup. The installed consult skill describes the retired phase model. The operator's explicit artifact-only request and this leaf's binding design govern this pass instead.

## Decision

### D1. One command and one configuration reader

Use the design's source layout and a small typed command dispatcher. Parse arguments, YAML and external process responses at their boundaries, then use validated types internally. Use specific failures with command parameters, exit status and captured output. Keep harness names and launch flags in config, not branching code.

Global config is `<AKROGON_HOME>/config.yaml`, with `AKROGON_HOME` defaulting to the tool checkout root. Only global config location resolution reads this override. Global keys are `max_active` (default 3), `slots.a`, `slots.b`, `harnesses`, `toolkits` and `repos`. There is no `workers` map. Each slot supplies its harness, model and effort. Harness templates carry `{model}`, `{effort}` and their required auto-approval flags.

Repo keys are `remote` (origin), `default_branch` (main), `worktree_root` (issues/worktrees), `rebuttal` (true), `fix_rounds` (3), `implement` (subagents or inline, default subagents), `checks`, optional `advisory`, `grounding` and `broadcast`. Preserve `broadcast.discord.webhook_env: [NAME]` as explicitly fixed by Leaf architecture. Do not read or write the broadcast secret. Its home is `~/.config/akrogon/env`, read by the later send script.

`config` resolves the registered checkout even from a leaf worktree, prints global plus repo plus defaults, and reports `repo: none` outside an initialized checkout. Inside a leaf worktree it recomputes `AKROGON_BASE` with `git merge-base` against the configured remote-tracking default branch. Use this same base for logging and dispatch environment. Missing Git prerequisites are visible errors, not an invented base. Config edits apply on the next action, without relaunching existing panes merely to change their model.

### D2. Authoritative folders and typed routes

Resolve state only under a checkout registered in global `repos`. Worktree copies are inert. Bare leaf slugs are unique within a repo. A folder may select a leaf, issue or epic. Discover leaves from `state.yaml`, not prose indexes. An issue is a leaf's parent. An epic contains issues. Reject missing or ambiguous leaf references and missing dependencies. Resolve dependencies across open and closed containers.

Use these nine phases in a typed constant, with legal destinations and required logical slots:

| Phase | Skill | Slots | Completion |
| --- | --- | --- | --- |
| `plan.positions` | `plan-issue` | A and B, concurrent | `plan.rebuttal` when repo rebuttal is enabled, otherwise `plan.synthesis` |
| `plan.rebuttal` | `plan-issue` | A and B, concurrent | `plan.synthesis` |
| `plan.synthesis` | `plan-issue` | B | `implement` |
| `implement` | `implement-issue` | B | `check.review` |
| `check.review` | `check-issue` | A and B initially, A only after repair | `merge` for ready/nits, `check.fix` for a fix, subject to cap |
| `check.fix` | `implement-issue` | B | `check.review` |
| `merge` | `merge-issue` | A | `merged`, or `check.fix` for conflict/red checks subject to cap |
| `merged` | none | none | terminal |
| `failed` | none | none | operator restart to `implement` only |

`debate: no` starts directly at `plan.synthesis`. Re-check ownership follows the persisted repair round, not reviewer prose. In review, require `--verdict ready|nits|fix`, record it by slot and derive the route from the collected verdicts. A requested merge cannot override a fix verdict. Skills pass `--slot` from their prompt. Slot-free moves are for unambiguous single-slot transitions and the explicit operator restart, not guessing one of two reviewers.

### D3. Serialize state changes with kernel locks

Preserve handoff fields: `slug`, `phase`, `created`, `priority`, `repo`, `debate`, `blocked-by`, optional `sources` and `hand_built`. Command-owned fields are `attempts`, `done`, `fix_rounds`, `verdict`, `tab`, `worktree`, with only the pane/slot hints needed by the design. No step token, invocation id, stale marker or second state file.

Every leaf read-modify-write and the whole leaf `next` pass hold `<leaf>/.lock` through `flock`. The lock must remain owned by a live process across the protected work, not by a command that exits before the mutation. Read state again after acquiring it, validate the legal transition and calling slot, write a temp file beside state, then rename. Refused requests do not modify state.

In a parallel phase, append one logical slot's completion and verdict. Return `recorded` with exit zero while its peer remains outstanding. Refuse a slot already in `done`. Only the call satisfying the required slots moves, prints `moved <phase>` and resets phase-local attempts/done/verdict for the destination. Capture their previous values for the move log before resetting. Increment `fix_rounds` on entry to `check.fix`. Permit the configured number of repair rounds, then move to `failed` on a further repair request and print `moved failed`. Restarting failed work to implement starts a new repair budget and clears phase-local counters.

The stale-call guarantee is bounded by the binding design: one active turn per pane, idle-before-prompt, current legal predecessor and done guards. Without an invocation id or expected-phase argument, an arbitrarily delayed call from an earlier visit to the same recurring phase cannot be distinguished. Do not claim that stronger guarantee or add a forbidden identity scheme.

### D4. Completion belongs to the transition, tab closure to the hook

For `merged`, hold the issue lock around state write, sibling completion and container rename, as well as the leaf lock required for state. Use one consistent enclosing-to-leaf lock order. An epic rename also needs serialization at the epic container so two issues finishing concurrently cannot race the same directory move. Use the same `.lock` primitive, not a merge queue or separate state. Do not acquire an enclosing lock while retaining a leaf lock in another code path.

Exactly the transition making every leaf of one issue merged prints `issue complete <slug>` for that issue. Print it even when that issue remains under an unfinished epic. Rename a complete standalone issue to `issues/closed/`; retain completed issues inside unfinished epics, then rename the entire epic when all its leaves are merged. Preserve the relative issue/leaf layout. A later run retries a failed container move without replaying the leaf transition, log or completion report.

Provide one named owner-completion function where `pull-close` can later add GitHub close. It performs the real completion and rename work now, with no empty GitHub hook or stub. No phase path closes a tab or broadcasts.

Recover a landed merge only for work awaiting merge completion: fetch the configured target and test whether the recorded leaf branch head is its ancestor. Do not infer completion from an untouched planning branch that already starts on the target. Route recovery through the same merged transition. `next` can locate a closed leaf from authoritative folders/worktree identity, close its tab after the merge pass has ended, and dispatch eligible dependents.

### D5. State succeeds before diagnostic logging

Append one JSON line for each actual phase move to `issues/log.jsonl`: `ts`, `repo`, `slug`, `from`, `to`, `slot`, `attempts`, `fix_rounds`, `verdict`, `head`, `diff`, `session`. Record the acting slot, attempts and verdicts that caused the move, the resulting repair round, worktree HEAD and shortstat against the refreshed base. Represent an unavailable session explicitly. Do not log tokens or prose.

Write state first. A log error reports that the move already committed and includes the failure, without rerunning it. An interrupted or failed append has no recovery protocol. A record-only call, duplicate refusal or repeated completion discovery does not append a move.

### D6. Event-driven dispatch, no background loop

`next <slug|folder|--all>` discovers targets from explicit input or the hook pane's cwd. The hook uses `HERDR_PANE_ID` to query herdr because the event payload has no cwd. Startup calls `next --all`. Use herdr's current pane data as the active-pane source and state hints only to identify the leaf's panes, never a separate registry.

Skip hand-built leaves, refuse named blocked leaves, and skip ineligible leaves during a sweep. A dependency must exist and be merged. Count active leaves across registered repos for machine-wide `max_active`, not panes. Serialize the capacity check and first tab creation across simultaneous hooks with a kernel lock at the global config home. Keep global allocation, enclosing container and leaf lock acquisition ordered consistently. That lock stores no scheduler state. Existing active leaves can continue while the limit is full.

First dispatch creates the configured worktree and leaf branch, then one slug-named tab with two panes in that worktree. Reuse those panes only for that leaf. Inspect existing branch/worktree/tab state to finish an interrupted allocation without creating duplicates or overwriting unrelated resources. Store the worktree/tab and necessary pane hints in authoritative leaf state.

Fill the configured launch templates using the slot models/effort. Immediately before every prompt, inspect the target pane. Never type into a working pane, and never infer pass completion from a done/idle event. The prompt is `<skill> <slug> slot=<A|B> phase=<phase>`. Confirm the installed herdr 0.9.0 help before choosing the concrete prompt command. Use its accepted `--wait --until working` flag form and a short finite prompt wait. No periodic polling or deadline for a running agent.

Count dispatch attempts per logical slot within the phase. Allow two sends on the assigned pane, then one on the idle peer, then failed. A working event consumes no attempt. Blocked/unknown panes take the peer path. A busy peer cannot receive another prompt. When the peer executes a pass, its prompt retains the logical slot being retried, so completion records the required slot. Re-read phase and done before retries. Move failures through the same state/logging machinery, not handwritten YAML. Keep remote/process failure details visible and apply the specified immediate retry only where required.

### D7. Initialize and install without overwriting user files

`init [--from <proposal.yaml>] [--toolkit <lang>=<runner>]` validates the proposal before writing and produces the new repo config from it or defaults, `issues/open/`, and `learnings/LESSONS.md` headed `# Lessons` when absent. Preserve existing lessons and unrelated ignore lines. Register the repo and explicitly supplied toolkit in global config. A toolkit is a recommendation for a repo without tests, never authority to migrate an existing runner. Print the external env path when it is absent, without creating a secret file.

Use init's writer for the bootstrap config replacement, then remove the retired config shape and `issues/.scripts/`. The new repo config names `checks.test: bun test`. Do not delete the old scripts until the replacement has been saved and validated.

`install` preflights all destinations, symlinks the executable entry and each present skill directory into both specified harness roots, runs `herdr integration install` for each configured harness, and links `plugin/`. Matching symlinks are safe on repeat. Refuse conflicting real files/directories or unrelated symlinks and print a specific removal command rather than deleting them. The operator removes the old executable and conflicting old skill folders before the hand-verified run.

### D8. Verify contracts with isolated command scenarios

Tests execute the real command against temporary repositories and a temporary global config via `AKROGON_HOME`. Keep herdr/gh substitution at `src/shell.ts`, leaving state, routing and Git real. The production entry contains no test mode or test code. Fixtures must not reach the real herdr socket, install roots or GitHub. Verify outcomes and file shapes, not prose or a copy of the route table. Fixed machine-consumed prompts and transition tokens may be checked as protocol values.

## Ordered Implementation Checklist

Each test file is derived from its acceptance contracts before the corresponding implementation. Keep the suite small by combining related outcomes into command-level scenarios.

- [ ] Establish the root Bun project, entry, configuration parsing and process boundary. Basis: D1, D8. Verify: `bun test tests/config.test.ts` covers global/repo/default precedence, uninitialized cwd, worktree-to-authoritative-repo resolution, invalid input and recomputed merge-base after rebase using real Git.
- [ ] Implement init and replace this checkout's repo config before deleting old scripts. Basis: D1, D7. Verify: `bun test tests/init.test.ts` covers proposal/default output, toolkit and repo registration, existing lessons preservation, repeated init without duplicate ignore lines and malformed proposal without partial writes. Inspect the saved `issues/config.yaml` for `checks.test: bun test`, no old lifecycle keys, and confirm `issues/.scripts/` is absent.
- [ ] Implement routes, state schema, lock lifetime and atomic phase mutation. Basis: D2, D3. Verify: `bun test tests/phase.test.ts` covers legal move, waiting peer, repeated/stale refusal with unchanged bytes, two real same-slot processes, two different-slot processes, review verdict aggregation, A-only re-check, merge-to-fix, cap failure, operator restart and terminal merged refusal.
- [ ] Implement owner completion and ancestry recovery with consistent lock ordering. Basis: D3, D4. Verify: `bun test tests/phase.test.ts` uses standalone and epic fixture trees, concurrent sibling completion, exactly one issue completion report, no premature epic move, retry of a failed rename, configured non-default Git target and landed-merge recovery without treating an untouched planning branch as merged.
- [ ] Add move logging after committed state. Basis: D5. Verify: `bun test tests/phase.test.ts` checks required JSON fields, one line per actual move, no record-only line, correct repair count and a forced log failure that leaves the committed transition intact and cannot replay it.
- [ ] Implement dispatch selection, allocation, idle checks and retry policy. Basis: D2, D3, D6. Verify: `bun test tests/next.test.ts` substitutes herdr, prints captured prompts and covers hook cwd lookup, folder/all selection, missing/unfinished dependencies, hand-built refusal, no busy-pane prompt, working event without attempt, two same-slot attempts then peer then failed, concurrent hooks without duplicate dispatch/allocation, machine-wide capacity across two repos, and merged-tab closure followed by dependent dispatch. Cover interrupt-and-resume of first allocation and closed-folder lookup.
- [ ] Add installer and plugin using the installed herdr command/manifest contract. Basis: D6, D7. Verify: inspect `herdr --help` and relevant subcommand help locally, then perform the hand verification below. No automated install test and no live herdr in `bun test`.
- [ ] Run the complete suite and record implementation evidence in the leaf. Basis: D8. Verify: `bun test` exits zero. Save actual command output and exit statuses in the review evidence, including the captured fixture prompt. If lint/typecheck commands are added to `checks`, run all of them too. No tests solely for coverage, no exact prose assertions, no consumer dependency installation.

## Hand Verification and Dependencies

Implementation needs Bun, Git, kernel `flock` and installed herdr 0.9.0. Verify herdr interfaces from local help before implementation, rather than guessing its manifest or flags. The sibling skills are not prerequisites for testing dispatch: its test observes the required prompt, not skill execution.

The operator performs the conflicting-file removals printed by install, then runs `bun src/akrogon.ts install` from source. Verify the executable and both sets of skill links point into the tool checkout, integration installation and plugin linking succeed, and `akrogon config` prints the effective config. Repeating installation with matching links must not replace real content.

Use a harmless fixture pane to trigger a status change and prove the linked plugin invokes `akrogon next` with the pane context. Record the actual invocation, exit status and observed event in this leaf's `review-B.md` or `review-A.md`. Include the startup hook inspection showing only `next --all` and no premature pull hook. This hand evidence is required for completion, not replaced by the fake-herdr suite. Do not perform installation or touch real panes during this planning pass.

The operator continues to type this leaf's pass prompts and moves its phase by hand once the command works. Automated takeover belongs to its later leaf.

## Acceptance and Done Means

The nine done-criteria in `brief.md` remain the acceptance authority. Implementation is complete only when the scoped command and plugin are saved, the new config precedes removal of the retired scripts, the command tests pass, and installation plus fixture-hook evidence is pasted into a review file. State moves, races, completion, ancestry recovery, logging failure, retry exhaustion and init/config file shapes must be demonstrated rather than inferred from code.

No unresolved product choice blocks implementation. The implementation must settle concrete herdr syntax from installed help and demonstrate lock ordering with concurrent-process tests. The stated stale-call boundary remains dependent on the design's one-turn-per-pane invariant. The broader arbitrary delayed-call guarantee is not achievable with the locked CLI and no invocation identity.

## Addendum Log

- 2026-09-10, slot B: synthesized directly from brief/design because `debate: no`. Later binding corrections take precedence: nine phases, no workers map, every checks command blocking, repo-configured remote/default branch, issue-level completion inside epics, no approval phase and no mandatory QA subagent. Wrote only this plan. State remains `plan.synthesis`.
