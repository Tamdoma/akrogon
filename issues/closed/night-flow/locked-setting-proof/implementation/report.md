# Implementation report: locked-setting-proof

Base: `c53f6196533289555518577f08907ec9c713721c` (`AKROGON_BASE`)
Head: `9bb3879ad111b49e43e1d51c44067258df7c05f3` (one commit on `locked-setting-proof`)

One wave, one unit, delegated to one worker in `locked-setting-proof-u1`; worker commit `5f3acb1` cherry-picked as `9bb3879`, worker worktree removed. Brief: `implementation/brief-1.md`.

## Changed files and reasons

- `skills/chart-issues/SKILL.md` — one sentence added to the Take operation-proof paragraph (`:57`), between "…run with the real identity and target." and "Declining a required probe holds the handoff": "When a decision locks a setting of an outside tool (a config key, file setting, flag or environment variable), its proof uses that same key, location and value and observes the property the decision relies on, and a proof of a different form, such as the CLI flag for a locked config key, does not count for it."

No other file changed. `git --no-pager diff c53f619..HEAD --stat` lists only that file (1 insertion, 1 deletion — the sentence appends inside an existing line).

## Criterion proof

1. Rule stated in the Take operation-proof paragraph: proved by the sentence quoted above from the committed diff (`git show 9bb3879 -- skills/chart-issues/SKILL.md`). All three rule elements present: same key/location/value, observed property, different form does not count.
2. Sweep by meaning of `skills/chart-issues/` (`grep -rniE "prove|proof|probe|counts|call"`): no line allows a different form to prove a locked setting; no in-scope fix needed. Out-of-scope hits listed for the record:
   - `SKILL.md:63` — proof fixture lifecycle and cleanup; disposable resources, not locked settings.
   - `SKILL.md:65` — producer save operation proven on disposable data; save-operation proof form, not locked-setting proof.
   - `SKILL.md:93` — "charting proofs do not count" for live-run done-criteria; reinforces separate proof forms.
   - `assets/questions.md:56` — exploration "never replaces required operation proof"; reinforces the rule.
   - `assets/shapes.md:168`, `:286` — allowed done-criterion proof forms (own-test, end-to-end, real-outside-call, live-run); these govern done-criteria, not operation proofs of locked settings.
   - `assets/shapes.md:284` — refuses handoff on an operation with no recorded proof; enforces presence, licenses no different form.
   - `assets/shapes.md:290` — `akrogon status` validation limits; no form claim.
   - `assets/standing-design.md:8,10,14,15,16` — test economics, machinery, chain re-recording, live-run rules; none concern a locked setting's proof form.
   - Remaining hits (`SKILL.md:25,33,51`; `questions.md:19,29,39,46`; `shapes.md:39,59,76,218,219,253–262,278,280,288`; `scripts/*.ts`) — unrelated uses of "prove/proof/call/counts".

## Commands run

| Command | Result | Wall time |
|---|---|---|
| `AKROGON_BASE=c53f619… bun test --changed="$AKROGON_BASE" --timeout=30000` (lane) | 0 tests affected, 0 fail — prose-only diff | seconds |
| `akrogon run-check --name 'format' -- …bun run format` | pass; all files unchanged | <1 min |
| `akrogon run-check --name 'test' -- …bun test --timeout=30000` | 792 pass, 0 fail across 41 files | 91.36s (minutes) |
| `akrogon run-check --name 'typecheck' -- …bun run typecheck` | `tsc --noEmit` clean | <1 min |

`merge_checks` is empty for this repo; no merge-stage command applies here.

## Known limitations

- The rule is prose the chart door applies; no automated check rejects a charted proof run in a different form than the locked setting (carried from `plan.md`).

## Unverified criteria

None.
