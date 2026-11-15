# Brief: territory map, slot B

You are slot B, a consultant to the chart door (slot A, hc address t126) charting `round-rewrites` in the akrogon repository. The mode is manual: the operator answers every fork. A draws its own map at the same time, and you do not see it. Your map is your own position, not a review of A. You start with an empty context; everything you need is named here.

## Task

Draw a territory map for this chart. Its destination, as recorded: the operator can answer a door round as first written, without first asking for a simpler rewrite, with the cause of today's rewrites established before any skill text changes.

The problem: the chart door (skill chart-issues) asks the operator its questions in "rounds". The rule for writing a round already demands everyday words. The operator still sends a rewrite alias (`eli`, `elid`, `scr`, `foc`, `ref`) after most rounds and answers only the rewrite. In the current door session this also happened to rounds A had written at the `elid` level from the first draft. The first job of this chart is to find the cause from evidence. No rule text is proposed before the cause is known.

What you receive:

- The intake: /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/INTAKE.md
- The session's signposts with the operator's answers: /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/forks/signposts.md (sections Question, Taken, Needs)
- The chart record: /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/CHART.md (sections Destination, Fog)
- The round rule: /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md and /home/ivan/Work/infra/akrogon/skills/chart-issues/SKILL.md (sections Shared context, Take, Handoff, Autopilot). Local main is at a33d967b, which is also the installed release.
- The operator's own standing instructions, which define the aliases and how the operator reads: /home/ivan/.claude/CLAUDE.md (a claude door receives it in every session) and /home/ivan/.codex/AGENTS.md.
- The door transcripts, which hold every first-draft round, every alias message, every rewrite and every operator answer: each chart folder under /home/ivan/Work/infra/akrogon/issues/chart has a seats.yaml whose seat A entries name the door's transcript files (claude transcripts under /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/). Charts opened before seats.yaml existed have no pointer; the same projects folder holds their sessions. This session's rounds are in 846b5690-f87d-4c52-b009-a33971d75fe3.jsonl there.
- The chart records of every chart: /home/ivan/Work/infra/akrogon/issues/chart (fork files keep each round's Taken answer and corrections).
- Earlier changes to the round shape: charts /home/ivan/Work/infra/akrogon/issues/chart/round-drawings and /home/ivan/Work/infra/akrogon/issues/chart/direction-round, landed leaves /home/ivan/Work/infra/akrogon/issues/closed/fork-rounds, /home/ivan/Work/infra/akrogon/issues/closed/question-labels and /home/ivan/Work/infra/akrogon/issues/closed/round-drawings, and `git log` on skills/chart-issues/assets/questions.md.

Locks that bind the map:

- Signposts (Taken): 1a rank by fewer parts first, then the operator's time, then clock time, then tokens. 2c no change may remove the second-seat review, clean-checkout checks before a merge, the operator's approvals, the decision record, or any current chart-door step (blind consultant notes, rebuttals, final-shape checks). 3a a change is charted only with a number from the factory's own records showing today's cost; a design claim also needs an outside practitioner source. 5b one bounded paid before/after run may be proposed for a token win recorded data cannot show; its cap is not stated, so run no paid call. 6a changes land in akrogon only. 7a earlier operator decisions stay binding; list one only when its facts changed, with the new number.
- Split of the survey (/home/ivan/Work/infra/akrogon/issues/chart/factory-wins/forks/split.md, section Taken, question 2): this chart's first fork finds the cause, and no rule text is added before the cause is known.
- Word caps on door text were declined by the operator on 2026-10-26 (/home/ivan/Work/infra/akrogon/issues/chart/door-cost/CHART.md, item O6).
- A leaf branch carries code and skill text only: no leaf may touch a path under `issues/`.

Return these parts:

1. The measurement. From the door transcripts, pair each operator round with what followed it: answered as first written, or answered only after one or more clarify messages (an alias or a free-text request to explain). State your method, the transcripts read and skipped, and the counts. For the rewritten rounds, say what the answered text changed against the first draft, measured where it can be (length, which round parts were kept, dropped, shortened or moved, what sat in the last lines, word choice, drawings) and quoted where it cannot. Say what the rounds answered as first written have in common that the others lack.
2. The candidate causes, each with the evidence for it and against it, and your ranking. Consider at least: the required round parts and their order, the register rule and how a door applies it, the fork's content, peer material carried into the round, how the operator reads (see the operator's standing instructions and what each alias asks for), and whether the alias is a fixed second step that no first draft can remove. Say which cause each observation supports and which observation would separate two causes that today look the same.
3. The rule texts in play and where they pull against each other: quote the words of questions.md, SKILL.md and the operator's standing instructions that a point rests on.
4. The material forks: each question the operator must answer, its options, what each option could break or invite later and not only now, and your pick with its reason and cost. A fork may be "no change" when the evidence says the rewrite cannot be removed by the door.
5. Evidence per fork: the factory-record number showing today's cost with the command, file or record and the date you ran or read it, and an outside practitioner source for each design claim, with URL and date read. Label estimates. Say "no number" or "no source found" with the searches run.
6. Questions a practitioner would ask that the forks do not cover, and pitfalls over the work's lifetime with the step that removes each.
7. How "answered as first written" can be shown as an observable result for a leaf, by the cheapest sufficient proof, and which external operations or pre-existing parts would need an observation before handoff.
8. Your proposed split into leaves, or none: which outcomes are parallel, which have a real dependency, and what stays out.

Keep the map proportional to the work. Do not read any file under /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/slots/ other than this brief. Do not edit any file except your return file. Make no product change, no live mutation and no paid call. Run only read-only commands. Start no agents.

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it and content lost to compaction stay readable; the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule. In this chart /home/ivan/Work/infra/akrogon/skills/chart-issues/assets/questions.md is the subject of the work, so its full source is allowed. Transcripts are large: search and extract from them with commands, never print one whole.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/slots/map-B.md, then run: hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/round-rewrites/slots/map-B.md"
