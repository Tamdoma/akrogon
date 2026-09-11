# Design: grounding-layout

## Binding decisions, verbatim

### Where does an area file live and what is it called?
Operator: `1a`, 2026-09-11. Beside the code as `<area>/AREA.md`, linked from `docs/reference-index.md`. Reason: the worker editing that folder sees the file, which is the only drift guard that costs nothing. Foreclosed: `docs/areas/<name>.md`.

### Which areas of akrogon get an area file in this issue?
Operator: `2a`, 2026-09-11. Area files for `src/`, `skills/` and `tests/` only. Reason: the other four folders are self-describing by name, and a file restating an index line costs tokens for nothing. Foreclosed: files for `plugin/`, `docs/`, `issues/`, `learnings/` in this issue.

### Where is the dead-path check enforced?
Operator: `3a`, 2026-09-11. A review rule in check-issue scoped to area files present in the reviewed diff: list the paths the file names and report missing ones with one shell command, no extra file reads. Reason: works in every repo, zero machinery, zero reads for leaves that touch no area file. Foreclosed: a test in this repo's suite.

### How is the work split into leaves?
Operator: `4a`, 2026-09-11. One leaf. Reason: one plan and one review for about 12 files, index lines written against the final index path. Foreclosed: a relocation leaf blocking a standard leaf.

### Operator locks from intake
Guide at `docs/guide/`. Index at `docs/reference-index.md`. No new skill, command, test file, scheduled job or config key.

### Standing creation-locked design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any chunk touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first chunk needing it. Non-browser flows use a real request or invocation. The gate judges the exit code and the completion half records the artifact path as evidence.
- Chunk ownership defaults to agent-owned. Only a step physically requiring the operator makes its chunk operator-owned, which parks at dispatch before any seat spawns. Credential access alone never qualifies.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

## Current interpretation

Carry the creation-locked block above verbatim into each leaf design, together with this interpretation. Its chunk terminology refers to the leaf's owned work. User-visible flows retain an end-to-end command and artifact; verification uses the checker's verdict and blocking `checks` commands. Known human-only prerequisites are named and completed before opening a leaf, with completion recorded at the door. The historical dispatch sentence does not authorize opening a leaf with an unfinished human prerequisite or introduce a hold state. An unforeseen physical blocker ends the attempt and informs the operator. Credential access alone does not create a human-only prerequisite, and `hand_built` remains a separate explicit operator choice.

Applied here: the guide move is a user-visible flow, and the existing Playwright specs under `tests/browser/` are its end-to-end command once repointed. Auth, authorization, backend mutation and secret lines do not apply; no auth or secret is touched.

## Leaf architecture

Owned surfaces:
- `docs/guide/` (moved from `docs/`), `docs/reference-index.md` (moved from `REFERENCE.md`).
- `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md`, new.
- `issues/config.yaml` `grounding.index` value, README index link, `tests/browser/*.pw.ts` docs URL, any `tests/browser/*.config.ts` path.
- `skills/init-issues/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`: the sentences named in the brief only.
- Guide pages whose text describes the index, area docs or docs location.

Area file shape, literal:

```markdown
# <folder> area

## Commands
## Key files
## Non-obvious patterns
## See also
```

At most 40 lines total. Paths are repo-relative. No prose overview, no folder listing beyond key files.

check-issue rule shape: applies only when the reviewed diff includes a file named `AREA.md`. One shell command per such file lists named paths and their existence. A missing path is a Fix citing done-criterion style evidence. No area file outside the diff is read.

Exclusions:
- No change to `src/` code, `config.ts` schema or the `grounding` key. The index path stays a config value.
- No scheduled regeneration, critic pass, new skill, new command, new test file.
- No area files beyond the three named. No `plugin/AREA.md`.
- `issues/` and `learnings/` keep historical mentions of `REFERENCE.md`, including this leaf's own records.
- No GitHub Pages setup; none exists.

Dependencies: none. Grounding for the plan: `docs/reference-index.md` does not exist yet, so the planner reads the current `REFERENCE.md`, the three skill files named above and `tests/browser/docs-shell.pw.ts` for the docs URL pattern.
