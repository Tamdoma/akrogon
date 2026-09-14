# Design: broadcast-before-now

## Binding decisions, verbatim

### Title format (operator, intake 2026-09-14)
"I don't want to touch the titles. The titles are good. I mean the title format is good, but the thing after the column can also change except for the date. When I say change, it can be simplified. o in one sentence. Or one title they will know what it's all about."
Effective: keep `## 🧪 <repo>: <headline> (MM/DD/YY)`. The headline is one plain sentence stating the result. Foreclosed: any change to emoji, repo prefix or date stamp.

### Sections (operator, intake 2026-09-14)
"we should remove the now section because it doesn't make any sense. It should just have the before and the next section should be called now. [...] State w what's better now about the system."
Effective: two sections, `Before` and `Now`. `Now` states what is better about the system. Foreclosed: a "what changed" section and a `Next` section.

### Before for additions (forks/before-for-additions.md, operator `1a`)
Before stays required and names what was missing when the work is an addition. Reason: one message shape, no schema branch, the reader always sees the contrast. Foreclosed: optional Before.

### Detail per part (forks/detail-per-part.md, operator `2b`)
"look at the epic and longer work rules. It should scale with work, but only if needed. That's up to the agent to decide. It's about how easy it is to read for the broad spectrum of people. But yes, for small issues, small bullets"
Effective: no fixed size and no mandatory bullet per shipped part. The writer scales the post to what a non-developer needs, merging parts when that reads better, and keeps small issues to a few short bullets. Foreclosed: the current "one bullet per shipped part" rule and a hard cap.

### Readability enforcement (forks/readability-enforcement.md, operator `1a`)
Rules only; the skill text carries the plain-reader rule and the agent judges it. Reason: no new failure mode, no rule a legitimate sentence trips over. Foreclosed: a mechanical readability guard in the sender. The schema validates structure only: key set, non-empty lists, headline length.

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

Current interpretation: the user-visible flow is the Discord post. The existing test suite already runs the sender as a child process against a local HTTP server and records requests to `requests.jsonl`; that is the end-to-end invocation and its artifact. No auth, no browser, no secrets: tests use fake webhook URLs in a temp env file. No credentials needed for this leaf.

## Leaf architecture

Owned surfaces:
- `skills/broadcast-issue/SKILL.md`: "Context and message" section and the JSON example.
- `skills/broadcast-issue/scripts/discord-send.ts`: `Message` interface, `messageSchema`, `chunks()`.
- `skills/broadcast-issue/scripts/discord-send.test.ts`: fixtures and assertions.
- `docs/guide/merge.html`: the example block and the two paragraphs around it (lines 65–76 today).

Literal interfaces:
- stdin payload: `{"summary": string, "before": string[], "now": string[]}`, strict object, each list non-empty, summary 1–200 characters after trim.
- rendered parts: `## 🧪 <summary> (<MM/DD/YY>)`, `**Before**\n- ...`, `**Now**\n- ...`, joined by blank lines and split at part boundaries under 2000 characters exactly as today.
- CLI: unchanged, `--target NAME` repeated.

Exclusions:
- No change to retry, redaction, env-file reading, target validation or the merge-issue trigger.
- No change to `skills/merge-issue/SKILL.md`, `README.md` or other guide pages; they name the broadcast without its shape.
- Nothing under `issues/`.

Dependencies: none. Skill-local `bun install --cwd skills/broadcast-issue --frozen-lockfile` before running its tests; root `bun test` does not cover the skill folder because bunfig scopes it to `tests/`.

Readability rule for SKILL.md, in the skill's own words rather than a checklist the sender enforces: write each bullet as a sentence you would say to a colleague in account management; if a word only a developer knows is needed, replace it with what it does for the reader.
