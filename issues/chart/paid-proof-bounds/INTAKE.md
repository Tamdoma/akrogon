# Intake: paid-proof-bounds

## Scope

Every paid model launch a leaf uses, directly or through a runner, is covered before launch by an operator-approved grant with a total bound; seats stop at that bound instead of rerunning or sleeping until a spend reset, and a fresh paid run happens only where the model behavior itself is under test.

Part of a six-chart pass opened 2026-10-18 over seeds #102-#108; sibling charts: paid-proof-bounds, merge-stacks, owner-completion, state-unknown-keys, criterion-outcomes, sync-identical-ignored. No dependency between them.

## Provenance

- GitHub: Tamdoma/akrogon#107
- Operator: 2026-10-18 chart-issues invocation
- Operator: 2026-10-18 split round answer

## Source: operator 2026-10-18 invocation

> Let's check all of the issues that were pulled and chart them out. Use slot b and c consultants that are already active. We're searching for the most elegant systemic issues. Always better to remove redundancies and complicated code first before adding and stacking new code.

## Source: operator 2026-10-18 split round

> 1a | 2a | 3a | 4a

Round answered 2026-10-18: 1a fold #103 and #108 into one chart; 2a order #107, #104, #103+#108, #102, #105, #106; 3a leave the two flaky tests out; 4a no framework replay-resume chart now.

## Source: Tamdoma/akrogon#107

# Paid claude -p sessions in proofs and live replays have no grant or rerun bound, so seats use full live runs as their debug loop

Source: Tamdoma/akrogon#107
URL: https://github.com/Tamdoma/akrogon/issues/107

Origin repo: Tamdoma/tamdoma-framework

Unverified intake.

## Observation

On 2026-10-18 (framework repo, 00:00 to about 14:30 CEST), Claude Code sessions used about 1.33B input tokens, almost all cache reads, until the operator's account hit "monthly spend limit … resets 3:40pm". The operator had to switch accounts mid-day. Counted from `~/.claude/projects/*/*.jsonl` usage records with timestamps since 2026-10-17T22:00Z, deduplicated by message id and request id:

| Source (Claude project dir) | Share | Detail |
|---|---|---|
| `framework/.temp/proof-34b/consumer*` | 46% | About 5,600 turns, 4,800 of them Opus. About 400 headless `claude -p` skill sessions today (`dev-build-astro` 146+, `dev-assemble-batch` 45, single-file Write tasks), run all night at 20-29 sessions per hour from 00:00 to 06:00. Launched by the proof checks of forms-wiring and check-accuracy leaves: codex seat sessions for forms-capture-cases, forms-declaration-scope, project-status-pages, shown-prop-coverage, deferred-form-action, landing-composition, component-loader and coverage-roles each ran 100-850 `dev-build-astro` invocations. |
| Live replays (`worktrees/framework/<leaf>/.temp/...`) | 36% | replay-cases 12%, hub-child-links 10%, satellite-no-inert-form 8%, cadence-capture 6%, mostly Sonnet. Each leaf reran the full live replay 8-12 times in one implement pass (hub-child-links reached `live-replay-10`, replay-cases `live-run-12`), at about 13M input tokens per run. |
| Operator and watch sessions at the framework root | 10% | Opus. |

Seat logs show the pattern: make a small fix, `rm -rf .temp/satellite-live-replay`, then `akrogon run-check --name live-replay-N -- bun .claude/workflow/scripts/run-satellite-live-replay.ts ...`, which runs the whole pipeline again. Seats also added probe sessions (`claude -p 'reply ok'`). When the limit hit, seats scheduled delayed relaunches (`sleep 5700 && bun ...`) and slept until the reset.

## Location

- akrogon `skills/chart-issues/SKILL.md:63`: the grant rule.
- `skills/implement-issue/SKILL.md:53` and `skills/check-issue/SKILL.md:35`: grant reuse "for probes, implementation, repairs, reruns ... without asking again".
- `src/readiness.ts:46`: the grant `bounds` field.
- Framework side, contributing: `.claude/workflow/scripts/run-satellite-live-replay.ts` (only `--case`, `--case-file`, `--limit-minutes`, `--evidence-dir`, so no stage resume) and `.claude/workflow/scripts/lib/session-trace.ts:160-172` (`launchSkillSession`).

## Reproduction

Chart a leaf whose done-criterion is a live replay or a `claude -p` skill proof, for example hub-child-links criterion 4: "One full replay on the plumbing fixture writes topic_hub and topic_cluster pages ... Recorded with revision, date and capture command." Let implement run. Every red result in the replay leads to fix, delete evidence and full rerun, with no count limit. The same pattern appears in 6 of 33 open and 32 of 558 closed framework briefs that need a live run.

## Expected behavior

A paid model session is a billing effect, so it carries the same repeat bound that live-change grants carry. Implement and check seats debug from offline checks and the saved artifacts of the last live run, then use a live run once as final evidence. A seat that exceeds the bound stops and reports instead of rerunning or sleeping until a spend reset.

## Urgency

High cost impact: about 80% of one day's Claude spend came from proof and replay reruns, and it hit the account's monthly spend limit, which stopped four leaves until the account was switched. Workaround in use today: the operator watch sent each replay seat a rule ("offline first, at most one more live run, no probes, no delayed relaunch"). This is per session and lost at the next leaf.

## Suspected cause

Agent view, with the operator asking why the spend is so high.

- Main condition: `chart-issues/SKILL.md:63` records a grant only for a "live-change" (destructive, public, billing, DNS, retention effects) with "repeat and recovery bounds". A paid `claude -p` session is not classified as a billing effect, so leaves that launch them carry `grants: []` and only a `proofs[]` entry whose `limits` pins the model ("proves the Opus 5.5 medium pin only", hub-child-links `readiness.yaml`). Compare media-range-live, whose Cloudflare grant carries `bounds: ... at most one pass rerun after a failure` and stopped correctly after 3 passes.
- Contributing: `implement-issue/SKILL.md:53` lets seats reuse grants "for probes, implementation, repairs, reruns ... without asking again", and nothing tells a seat that a live run is final evidence rather than a test loop.
- Contributing, framework-owned: the live replay runner cannot resume or run one stage, so every retry pays the full pipeline.
- Contributing: done-criteria phrase the live run as "one full replay", which seats read as "rerun until green".

Files read:
- `~/.akrogon/current/skills/chart-issues/SKILL.md:63,109-122`, `implement-issue/SKILL.md:53`, `check-issue/SKILL.md:35,67-69,93`. These are the installed release `~/.akrogon/releases/9e0df5b049fd...`, not the source checkout.
- `src/readiness.ts:46`
- framework: hub-child-links and media-range-live `readiness.yaml`, `brief.md`; `run-satellite-live-replay.ts` flag list; `lib/session-trace.ts`; `lib/phase-capture.ts:31`
- seat logs via watch-issues `log-tail.ts`
- codex sessions under `~/.codex/sessions/2026/10/1[78]`

Not inspected: which leaves' proofs drove the overnight proof-34b runs at the exact hours (attribution is by codex sessions that mention the path), and whether merge seats rerun proofs. Would disprove: proof-34b runs coming from one runaway process rather than many seats' proof checks.

Related reports:
- Tamdoma/akrogon#41 (closed): multi-hour runs surface cross-leaf defects late. Related cost pattern, different mechanism.
- Tamdoma/akrogon#98: base red rediscovered by every leaf, another source of repeated proof runs.
- Searched Tamdoma/akrogon, all states, limit 6, for "claude spend", "live replay rerun" and "token cost grant". Only #41 matched.

## Agent findings

Opening map merged with attribution: issues/chart/paid-proof-bounds/slots/map-merged.md, sections for #107.
