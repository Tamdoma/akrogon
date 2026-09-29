# Intake: cross-leaf-proof

## Scope
Destination akrogon: charting, standing design, planning and review guidance so each property is proven by the cheapest test that catches it, in the leaf that owns it, and a proof leaf converges in one or two runs. One chart, one destination.

## Provenance
- GitHub: Tamdoma/akrogon#41
- Operator: chart-issues door 2026-09-29

## Source: Tamdoma/akrogon#41
# Cross-leaf defects surface one multi-hour run at a time when integration is left to the last leaf of an epic

Source: Tamdoma/akrogon#41
URL: https://github.com/Tamdoma/akrogon/issues/41

Unverified intake.

## Observation
In the framework repo, the epic `satellite-network-simplify` was charted into about 10 leaves. Each leaf passed its own tests on hand-written fixtures. The first run of real producer output through every stage was `live-replay`, the last leaf of the epic.

Each labelled live run halts at the first failure. `live-replay` found 17 cross-leaf defects one per run, and each cost a fix plus a multi-hour rerun. The leaf stayed in `implement` for several days. Until the operator overrode the design on 2026-09-29, each defect also went through its own fix leaf with a full plan, implement, review and merge cycle.

Reported defects by kind (from the leaf's implementation report):
- Shape mismatches between leaves: #1 pool-smell rejected fixture observations, #2/#3 plan-script brief fields violated `page-brief.schema.json`, #9 client link payload missing at build audit, #10 prep allowlist omitted page subjects.
- One rule implemented twice and drifted: #10/#11 prep and verify built different subject allowlists, #12 auditor heading match missed the writer's heading, #14 chrome uniqueness check stricter than worker instructions.
- Renderer defects visible only in a real browser: #4 stale frozen bundle, #13 dark-mode button contrast 1.225, #15 two-column layout never stacks at 360px, #17 anchor targets under the sticky header.
- A check the generator cannot satisfy: #16 required distinct layouts across 4 sites with 2 hero modules. #14 required pairwise-unique short labels.

Operator overrides used to finish: fix small cross-leaf defects in the live-replay branch, resume from the failed stage instead of restarting, parallel content batches, and finally drop the full from-scratch proof run in favour of a resumed run.

## Location
akrogon charting and leaf lifecycle as used by the framework repo: chart-issues epic splitting, standing design, `check.review`, and merge gating. Evidence is in the framework repo at `issues/open/satellite-network-simplify/satellite-route/live-replay/implementation/report.md`, `.../live-replay/design.md` (Operator constraints), and `learnings/history/2026-09-29-last-leaf-integration-serial-defects.md`.

## Reproduction
Chart an epic whose leaves pass data through a pipeline, with the end-to-end proof as its last leaf. Each leaf passes on hand-written fixtures. The final leaf's first real run then finds cross-leaf defects serially. This was observed once, over several days, with 17 defects.

## Expected behavior
The reporter proposes that the factory find cross-leaf defects near the leaf that causes them, without removing any check:
- A1: the first leaf of an epic is a thin real end-to-end spine, and every later leaf must keep that spine passing before it can merge.
- A2: integration or proof runs collect every failure in one pass instead of halting at the first.
- A3: the design names each fixture's source, and fixtures that depend on an upstream leaf are recorded from that leaf's real output.
- A4: review flags any rule whose writer and checker have separate implementations.
- A5: each new check states the generator capacity it assumes, with a test proving real generator output can pass it.

## Urgency
High for delivery time. A single epic's final proof took several days of serial runs. The workaround used was operator overrides that relaxed the leaf design (in-branch fixes, resume instead of restart, and dropping the from-scratch proof run), which weakens the proof.

## Source: operator 2026-09-29
look at the pulled issue. This leaf has been running for two or three days, which is just not acceptable. So something is wrong in the way that this is being tested. I need to make sure that the system, when it does this type of testing, actually creates the simplest, most effectie way to test so that issues progress faster if possible.

## Agent findings
See CHART.md territory map (A, B, C merged 2026-09-29).
