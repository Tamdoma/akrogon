# Design: seed-slug-cut

## Binding decisions, verbatim

# How is the seed slug shortened?

## Question
Cut the hyphenated slug to at most 40 characters at a hyphen boundary, never mid word. A single word longer than 40 characters is hard cut at 40. Number stays first.

## Resolution
Reporter statement taken as the answer (2026-09-11): "the slug is cut to about 40 characters at a word boundary. The number stays first and is the identity; nothing reads the words." Foreclosed: keeping 100, or cutting mid word.

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
Owned surfaces: `slug(title: string): string` in `src/pull.ts` and the pull scenario in `tests/pull.test.ts`. The signature and the `issue` fallback are unchanged. Cut rule on the hyphenated form `h`: if `h.length <= 40` return `h`; otherwise take `h.slice(0, 40)`, and if `h[40]` exists and is not a hyphen, drop back to the last hyphen in that slice when one exists; strip a trailing hyphen. A 40-character slice with no hyphen stays as is. The end-to-end verification is the existing pull test invoking the CLI against the fake gh fixture, which leaves the seed files as its artifact.

Exclusions: seeds already on disk are not renamed. Pull already rewrites the desired set and unlinks stale numbered files, so old long names disappear on the next pull. No other command or filename changes.
