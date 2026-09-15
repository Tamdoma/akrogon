# Design: chart-prose

## Binding decisions, verbatim

### Small rounds
Operator answer (2026-09-14): `24a` drop the never-cut sentence at questions.md:27; a small round keeps the parts that carry the decision, the reply key and the challenge check.

### Corrections
Operator answer (2026-09-14): `25a` B's sentence: append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes. Forecloses latest-dated-answer-wins.

### Forks open and Fog
Operator answer (2026-09-14): `26a` Forks open leaves CHART.md; a fork file with no recorded operator answer is the open inventory, Fog stays for unphrased work, the preflight checks both are empty at handoff. Forecloses folding open forks into Fog.

### Standing block
Operator answer (2026-09-14): `27a` design.md points at the installed standing-design path and keeps the interpretation paragraph; the verbatim copy at shapes.md:142 goes. Open designs keep their copied block. Forecloses keeping the copy.

### State written last
Operator answer (2026-09-14): `28a` one write-order sentence (brief and design before state.yaml, prerequisites before dependents) and a comment on the sample phase line for the debate-yes value. Forecloses no change.

### Leaf split
Operator answer (2026-09-14): `29a` two leaves, L4 lifecycle skills and guide, L5 chart skill.

### Standing design lines

- Never mock auth.
- Server-side authorization on every non-public path.
- State changes as real backend mutations.
- No hardcoded secrets.
- No vanity tests.
- Mandatory negative and edge-case tests.
- Any leaf touching a user-visible flow must carry at least one verification command that exercises the flow end to end and leaves an artifact. Browser flows use Playwright only: headless Chromium, trace on, no video, installed as a consumer-repo dev dependency by the first leaf needing it. Non-browser flows use a real request or invocation. The blocking `checks` commands judge the exit code and the implementation report records the artifact path as evidence.
- Leaf work is agent-owned. A step physically requiring the operator is a human-only prerequisite completed before the leaf opens. Credential access alone never qualifies. An unforeseen physical blocker ends the attempt and informs the operator.
- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.

Current interpretation: no auth, browser, secret or user-visible flow; no code or test changes, so the negative-test and artifact rules do not apply. The operator's Research edits to `skills/chart-issues/SKILL.md` and `assets/questions.md` are committed as 735cd63 on origin/main, so no prerequisite remains. The installed chart-issues folder is a symlink to the registered checkout (`~/.claude/skills/chart-issues`), so the installed standing-design path resolves to `skills/chart-issues/assets/standing-design.md` here.

## Leaf architecture

Owned surfaces: `skills/chart-issues/assets/questions.md` line 27; `skills/chart-issues/assets/shapes.md` lines 26-27, 80, 142, 150-157, 166 and 170; `skills/chart-issues/assets/standing-design.md` last line. Line numbers at 735cd63; verify by content.

Literal interfaces. File names and grep targets literal; wording by content.
- questions.md:27 after: "Every round uses this shape, on every harness and at every effort level: the opening paragraph, the sentences under each question, the research line, the labelled recommendation with its reason, the pitfalls line, the reply key and the challenge check. A small round keeps the parts that carry the decision, the reply key and the challenge check. Number questions continuously within a round and restart at 1 in the next round."
- shapes.md:26-27 deleted: the `## Forks open` heading and its `- [<fork>](forks/<fork-slug>.md): <what blocks it, if anything>` line. `## Fog` and `## Off route` stay.
- shapes.md:80: the sentence "A taken fork is never reopened: a correction before handoff is a new fork naming the one it supersedes, the original stays verbatim, and only the effective answer becomes a binding decision." is replaced by "Append each explicit operator correction with its date, preserve earlier answers, and treat the last appended correction as binding only for the answer it changes." The paragraph then gains at its end: "A fork file with no operator answer under `## Taken` is open, and CHART.md lists none."
- shapes.md:142 after: `<installed path of standing-design.md, then the current interpretation: how its rules apply to this leaf>`
- standing-design.md last line after: "Each leaf design names this file's installed path and writes its own interpretation of these rules."
- shapes.md sample phase line after: `phase: plan.synthesis  # plan.positions when debate: 'yes'`
- shapes.md:166 gains: "Refuse the handoff while any fork file lacks an operator answer or `## Fog` is not empty."
- shapes.md:170 gains, before "then run `akrogon status`": "Write brief.md and design.md before state.yaml, and a prerequisite leaf's files before its dependents', because dispatch picks up any folder holding a state.yaml."

Tests: none added. `bun test` runs unchanged; nothing in src/ or tests/ reads these assets.

Exclusions: `skills/chart-issues/SKILL.md` (its :37 "every fork in every chart is taken" already matches the open-inventory rule); the `## Research` section and Research line the prerequisite commit adds; the blind B exchange and blind initial review; `issues/chart/*` files already written, which keep their Forks open sections and copied blocks; every lifecycle skill (lifecycle-prose owns them); `src/`, `tests/`.

Dependencies: none. lifecycle-prose shares no file. Credentials: none.
