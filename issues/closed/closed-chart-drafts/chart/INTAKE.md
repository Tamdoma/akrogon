# Intake: closed-chart-drafts

## Scope
Destination: akrogon. Stop chart-owned draft files from being read as leaves after an owner closes, and stop one unreadable file from saturating dispatch capacity. Framework's hand-renamed drafts are evidence, not work.

## Provenance
- GitHub: Tamdoma/akrogon#39
- Operator: 2026-09-28 "let's chart the issue, use slot B (codex)"

## Source: Tamdoma/akrogon#39
# Closing an epic moves chart draft state.yaml files into issues/closed, which stalls all dispatch

Source: Tamdoma/akrogon#39
URL: https://github.com/Tamdoma/akrogon/issues/39

Unverified intake.

## Observation
When the last leaf of an epic merged, `completeOwner` (`src/phase.ts`) moved `issues/chart/<owner>` into `issues/closed/<owner>/chart`. That chart held draft leaves at `slots/leaf-draft/<slug>/state.yaml`. The inventory scan of `issues/open` and `issues/closed` then reported both as unreadable:

```text
{"repo":"framework","path":".../issues/closed/audit-prose-and-log/chart/slots/leaf-draft/comparison-log","error":"... Invalid leaf depth: .../chart/slots/leaf-draft/comparison-log/state.yaml"}
```

With `unreadable > 0`, `activeCount` (`src/next.ts`) counts every non-failed leaf in the repo, merged ones included, so it reaches `max_active` and `akrogon next` starts nothing. The draft slugs also duplicate the real leaves' slugs.

## Location
akrogon `next` and `phase` merge completion, framework repo (Tamdoma/tamdoma-framework), epic audit-prose-and-log, 2026-09-28.

## Reproduction
Chart an epic whose chart keeps `slots/leaf-draft/<slug>/state.yaml`. Merge all its leaves so it moves to `issues/closed`. Run `akrogon next --all`. Every run since then has reported the invalid depth errors.

## Expected behavior
Closing an epic should not add files that the leaf inventory reads as leaves, and one unreadable archived file should not stop dispatch for the whole repo.

## Urgency
It blocks every new dispatch in the repo until someone fixes it by hand. Workaround used: rename the draft files to `state.draft.yaml` under `issues/closed` and `issues/chart`.

## Source: operator 2026-09-28
let's chart the issue, use slot B (codex)

## Agent findings
Independent maps in slots/map-A.md and slots/map-B.md agree on the mechanism (A,B):
- Framework doors wrote full leaf drafts (brief, design, state.yaml) to `issues/chart/<c>/slots/leaf-draft/<slug>/` in 4 charts on 2026-09-28. skills/chart-issues/SKILL.md:61 says "scratchpad", questions.md:46 says post-creation exchange files live under `<chart>/slots/`.
- `completeOwner` src/phase.ts:173-174 moves `issues/chart/<owner>` to `issues/closed/<owner>/chart`. Added in a2b9e07 ("sync issues") with no stated reason. shapes.md:36 and SKILL.md:67 say charts stay in place after handoff.
- `discover` src/next.ts:95-105 and `leavesUnder` src/state.ts:93-101 read any `state.yaml` under open/closed; `validateLeafDepth` src/state.ts:86-91 rejects depth 5.
- src/next.ts:273-274: with any unreadable entry, capacity counts every readable non-failed leaf, merged included, plus unreadable. Deliberate conservatism from f9e7ddd, tested at tests/next.test.ts:699.
- `allLeaves` src/state.ts:104-117 throws on the bad depth, so `findLeaf` and `akrogon phase` also fail for the whole repo (A). Detailed status and park share the exposure (B: src/status.ts, src/park.ts:39-42).
- Live now: no misplaced state.yaml in any registered repo. 8 hand-renamed state.draft.yaml remain in framework. akrogon holds 36 archived charts under issues/closed/*/chart, none with state.yaml.
