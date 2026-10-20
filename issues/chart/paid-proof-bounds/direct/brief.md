# Brief: paid-proof-bounds

## What

Wording-only change to the lifecycle skills so a seat never reruns a paid model pipeline that saved real output could answer, and a paid model launch is covered by the leaf's existing grant like any other billing effect. No code, schema or state change.

## Why

Tamdoma/akrogon#107: on 2026-10-18 framework seats reran full `claude -p` replays 8 to 19 times per leaf after small deterministic fixes, until the account limit stopped them. Two skill texts invite it: the grant reuse sentence authorizes "reruns ... without asking again" and only checks "before mutating", so read-only paid sessions carried `grants: []`; and standing-design's recorded-output rule is scoped to chain triggers, so plans wrote "on failure rerun from scratch" for a leaf's own proof.

## Done-criteria

1. No skill under `skills/` authorizes reruns "without asking again", and the grant reuse sentence in plan-issue, implement-issue, check-issue and merge-issue checks the grant's bounds before each covered operation, paid model launches included.
2. chart-issues Take and Handoff describe the leaf grant as covering live changes and paid model launches (read-only and nested included) before the first covered proof, with no "live-change" or "mutating proof" scoping.
3. standing-design holds one recorded-output rule for every proof with a model or outside stage, not only chain triggers: deterministic stages and consumers run real against saved output; a fresh call is the smallest interaction that proves the property and happens only on a model-facing input change, a missing or unreliable recording, or a named fresh-start, order, live-interaction or whole-run property, and only under a covering grant; an unknown input is investigated; and the slow/live bullet no longer restarts or demands a full run merely because reuse is unsure.
4. plan-issue's rerun trigger for a model or outside stage names its model-facing inputs, recording and real consumers; implement-issue's implement-end and check.fix rerun rules and check-issue's check.repair rerun and live-proof rules point to that one rule.
5. shapes.md Preflight refuses a live-run done-criterion requiring a fresh or full replay unless it names the property saved output with real consumers cannot prove.
