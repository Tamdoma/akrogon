# Map A: Tamdoma/akrogon#41

## Destination
akrogon charts and leaf contracts for a multi-leaf pipeline epic make cross-leaf defects fail in the leaf that causes them, and a final proof leaf converges in one or two runs instead of days, without removing any check.

## Evidence (inspected)
- E1 framework live-replay design.md "Excluded here": "Fixing any defect the run finds. The run fails, and the owning leaf reopens." brief.md criterion 9: "The run happens once at that revision with no source edit after." Together: each defect cost a new chart, a full plan/implement/review/merge leaf, then a from-scratch multi-hour rerun from research.
- E2 implementation/report.md "Labelled-run history": 18 labelled runs plus rehearsals R1-R9. Rehearsals with stand-ins (R1-R4) found #4b, #5, #6, #7 in one continuous chain; labelled runs found one defect each.
- E3 Upstream leaves proved themselves on hand-written fixtures; first real producer output through every stage was the last leaf (learnings/history/2026-09-29-last-leaf-integration-serial-defects.md).
- E4 akrogon has no rule placing integration proof: standing-design.md:9 requires an end-to-end command only per leaf touching a user-visible flow; chart-issues SKILL.md Drain split rule and shapes.md:118 say nothing about where integration proof sits in an epic.
- E5 Two classes of defect were not integration at all: #16 (check demands 4 distinct sites from 2 hero modules) and #10/#11, #12, #14 (rule implemented twice, writer and checker drift). Both are catchable at unit level in the leaf that adds the check.

## Material forks
1. Where does integration proof sit in a pipeline epic? (A1, A3)
   - Rec: the first leaf is a thin real end-to-end spine (every stage wired, real producer outputs recorded as the fixtures later leaves consume), and every later leaf keeps it green as a done-criterion. Alternative: per-boundary contract tests only. Spine wins because 4 of 17 defects were shape mismatches across boundaries nobody owned.
   - Home: chart-issues SKILL.md Drain split rule plus shapes.md handoff audit.
2. What does a proof leaf do when its run finds a defect?
   - Rec: default in-branch fix with a test and resume from the failed stage; only a defect needing a design change stops the leaf. The operator already chose this on 2026-09-29 for live-replay. Question: is the final evidence a resumed run or one clean run at the end?
   - Home: standing-design.md line.
3. Do proof runs collect every failure in one pass? (A2)
   - Rec: yes via a rehearsal mode that stands in for a failed stage and continues, reporting all failures, before any labelled run. E2 shows rehearsals already did this. This is consumer code, so akrogon can only require it in the proof leaf design.
4. Writer/checker single source (A4) and check capacity (A5).
   - Rec: two standing-design lines checked at review: a rule's writer and checker import one function; a new check ships with a test that real generator output passes it at target scale. Review flag in check-issue is the enforcement point.
5. Runtime budget for a leaf's verification.
   - Rec: a verification step slower than N minutes needs a cheaper rehearsal that runs first. Operator goal is fastest sufficient test. N needs an answer.

## Practitioner questions
- Freeman and Pryce, GOOS ch.10 "walking skeleton": the thinnest real slice built, deployed and tested end to end first (https://www.oreilly.com/library/view/growing-object-oriented-software/9780321574442/ch10.html). Supports fork 1.
- Ian Robinson, consumer-driven contracts (https://www.martinfowler.com/articles/consumerDrivenContracts.html): provider replays consumer expectations every build. Supports fork 1 alternative and A3.
- How long is a spine run? If the spine needs live agent sessions it is hours again; it must run on recorded outputs to be cheap.

## Pitfalls
- A spine leaf that needs real paid or long sessions reproduces the problem at the front of the epic.
- Standing design lines are copied into every leaf design; a pipeline-only rule must say when it applies or it bloats unrelated leaves.
- Resume-from-stage weakens proof unless the resumed stages are recorded against the final HEAD (the operator already had to waive "same revision").

## Fog
- Whether akrogon code (not only skill prose) needs a change, e.g. a stall signal when a leaf sits in implement for days. Existing chart seat-stall-detection may cover it.

## Off route
- Fixing live-replay or any framework leaf. That is framework work already underway.
- Removing any check.

## Proposed split
One akrogon issue, skill prose only: leaf 1 chart-issues epic-splitting rule (fork 1), leaf 2 standing-design lines (forks 2, 4, 5), leaf 3 check-issue review flag (fork 4). Independent, parallel.
