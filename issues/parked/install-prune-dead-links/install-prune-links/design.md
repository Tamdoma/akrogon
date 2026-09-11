# Design: install-prune-links

## Binding decisions, verbatim

# Which harness skill folders does install own?
## Question
Should install manage (link and prune) `~/.codex/skills` and `~/.pi/agent/skills` in addition to `~/.claude/skills` and `~/.agents/skills`? The code links two folders today. The report expects pruning in four.

## Resolution
Operator answer (2026-09-11): `2-B`, on consultant review overturning the recommendation. Install links and prunes all four folders: `~/.claude/skills`, `~/.agents/skills`, `~/.codex/skills`, `~/.pi/agent/skills`. Reason: all four folders hold links dated 10 Sep 11:46 made by an earlier install, and `plan-issue` (added 11 Sep 08:06) exists only in the two folders the current code links, so codex and pi already run with a missing skill. Every folder a configured harness reads is owned by install. Foreclosed: keeping two folders and leaving pi and codex uncovered.


Carried lock, Operator Only Install (issues/chart/akrogon-loop/decisions/operator-only-install.md): only the operator installs, skills stay individually usable. This leaf changes what install does, not who runs it.

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

## Leaf architecture
Owned surfaces: `install()` in `src/install.ts` and the new `tests/install.test.ts`. The harness roots list becomes `['.claude/skills', '.agents/skills', '.codex/skills', '.pi/agent/skills']`. A prune step runs before the conflict check: for each root that exists, read entries, and for each entry that `lstat` reports as a symlink, resolve its target relative to the entry's directory; if the target starts with `resolve(toolRoot, 'skills') + sep` and `existsSync` is false, `unlinkSync` it. Skill folder names never contain a separator, so a target directly under `skills/` is the only shape produced by install. The test sets `HOME` to a temp dir so `homedir()` resolves there, points the fake herdr on PATH, and inspects the folders with `lstat` and `readlink`. The end-to-end verification is that test invoking the CLI, leaving the temp folder listing as its artifact.

Exclusions: the `~/.local/bin/akrogon` link and the herdr integration and plugin commands are unchanged. Links pointing anywhere other than the repo's `skills/` folder are never removed.
