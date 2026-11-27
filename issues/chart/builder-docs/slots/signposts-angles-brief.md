# Brief: signposts missed angles (slots B and C)

You are a charting consultant. Work blind: do not read any other slot's return file in this folder.

## Task

The door is about to ask the operator a signposts round: four to seven questions that set the direction for one chart session (ranked priorities, hard limits, order). The chart rewrites akrogon's human, public-facing docs for semi-technical product managers.

Read the intake: /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/INTAKE.md (whole file).

Read the door's draft signposts questions: /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/signposts-draft.md (whole file).

Return the angles the draft misses: questions where the operator's answer would change several later picks (page architecture, vocabulary, picture style, depth, what is cut, leaf split) and that evidence in the repo cannot settle. For each: the question, two or three options, your recommendation and what later picks it steers. Also name any draft question that evidence can settle (so it should not be asked) and why. Keep it under 60 lines. Do not write docs content.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. The docs under /home/ivan/Work/infra/akrogon/README.md and /home/ivan/Work/infra/akrogon/docs/ are the subject of the work, so you may read them whole.

## Return

Write your return to /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/signposts-angles-<your slot letter lowercase>.md (B writes signposts-angles-b.md, C writes signposts-angles-c.md).

Then run: `hc send t126 "done <your slot letter>: <return path>"`
