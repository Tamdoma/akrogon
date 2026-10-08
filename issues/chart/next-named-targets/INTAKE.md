# Intake: next-named-targets

## Scope
Destination akrogon. One standalone issue: `akrogon next` accepts an epic, issue or leaf name and reports each dependency-blocked leaf it selected.

## Provenance
- GitHub: Tamdoma/akrogon#59
- Operator: 2026-10-08 chart-issues open, split answer `1a 2a`

## Source: Tamdoma/akrogon#59
# akrogon next should accept an epic, issue or leaf name and report every blocked leaf with its blockers

Source: Tamdoma/akrogon#59
URL: https://github.com/Tamdoma/akrogon/issues/59

Unverified intake.

## Observation
The operator wants one target form for `akrogon next`: an epic name, an issue name (including an issue nested in an epic) or a leaf slug, typed bare from anywhere in the repo. Today only a leaf slug, a leaf folder or a worktree path works.

On tamdoma/framework on 2026-10-08, the operator wanted to start the epic `client-voice-writing` (4 issues, 10 leaves under `issues/open/client-voice-writing/`). `akrogon next client-voice-writing` from the repo root fails: the name is not a folder relative to the cwd, so `selectLeaves` matches it only against leaf slugs, finds none and throws the missing-leaf error. `akrogon next copy-review` (an issue inside that epic) fails the same way. The working form is the folder path, `akrogon next issues/open/client-voice-writing`. `akrogon park` and `akrogon unpark` already take the epic or issue name.

Blocked leaves are also reported unevenly:
- A single targeted leaf whose `blocked-by` is not merged fails with `Leaf dependencies are not merged: <slug>`, without naming the dependencies.
- A folder target (several leaves) goes through `sweep`, where a blocked leaf returns `waiting` and is skipped silently. In this epic, 6 of 10 leaves are blocked (for example `website-writing-brief` by `hero-role-fields` in another epic, `copy-gates-cleanup` by `gate-run-receipts` and `copy-review-step`), and the operator gets no word on them.

## Location
- `src/next.ts` `selectLeaves` (:1170-1206 at `f57bb35`): a non-folder target is filtered by `leaf.state.slug === input` only (:1193-1195), then `missingLeafMessage` (:1203).
- `src/next.ts` :633-647: `explicit` (single leaf) throws `Leaf dependencies are not merged`. Otherwise a blocked leaf returns `waiting`.
- `src/next.ts` :1246-1262: one selected leaf runs explicitly, several go through `sweep`.
- `src/state.ts` `missingLeafMessage` (:146). `src/akrogon.ts:79-84` (`next` takes one positional target, `--all` or `--resume`). `src/park.ts` `issueFolders` already resolves epic and issue names.

## Reproduction
1. In a registered repo, have an epic `issues/open/<epic>/<issue>/<leaf>/` where some leaves have unmerged `blocked-by`.
2. From the repo root, run `akrogon next <epic>`, then `akrogon next <issue>`. Both fail with the missing-leaf error.
3. Run `akrogon next issues/open/<epic>`. Ready leaves start, and blocked leaves are skipped with no message.
4. Run `akrogon next <blocked-leaf-slug>`. It fails without naming what blocks it.

## Expected behavior
- `akrogon next <name>` accepts an epic name, an issue name (top-level or nested in an epic) or a leaf slug, from anywhere in the repo, and selects that owner's leaves. Folder and worktree paths keep working.
- If a name matches more than one kind (for example a leaf slug and an issue name), the command fails and lists the matches instead of guessing.
- Every selected leaf that cannot start because of an unmerged `blocked-by` is reported as an error naming the leaf, each blocking dependency and its current phase (or that it is missing or parked). That holds for a single leaf and for each blocked leaf inside an epic or issue target. Ready leaves in the same target still start.
- The command exits non-zero when any selected leaf was blocked, so the operator sees it.

## Urgency
Medium. The epic or issue name is what the operator sees in `akrogon status` and uses for park and unpark, so the gap costs a failed command and a lookup each time. Silent skipping hides why most of an epic did not start.

## Agent findings
See [opening map](slots/map-merged.md).
