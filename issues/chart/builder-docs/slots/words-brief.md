# Brief: docs word choices (slots B and C)

Work blind: do not read any other slot's return in this folder.

## Context

Read the operator's answers and the correction: /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/forks/signposts.md, sections `## Taken` and `## Correction 2026-11-27`. The reader is a somewhat technical operator (agency owner, ops leader) who runs AI workflows; the docs are a plain how-to guide, no marketing jargon, no heavy technical jargon.

Two separate things must have two clearly different category names:
- Category X: who answers the charting questions. Values today: manual (operator answers signposts and every fork), autopilot (operator answers signposts, agent answers forks), full autopilot (agent answers both).
- Category Y: how a settled chart gets built. Values today: direct (the planning agent itself builds one small settled change in a worktree, slot B reviews, the merge queue lands it) and lifecycle (written task contracts go to fresh slot A and slot B seats who plan, build, review; the merge queue lands it). Direct is not only for fixes: it is any small, settled change, built fast.

The operator suggested "mode" for X and "route" for Y. The terminal prints `Route: direct` / `Route: lifecycle` in CHART.md and the command is `akrogon direct`. "Quick fix" was rejected (not always a fix).

## Task

Recommend: (1) the category name for X and for Y, (2) the value names for each, (3) one sentence each the docs would use to tell X and Y apart. For every name give the reason and the confusion it avoids; reject at least one alternative per slot with a reason. Prefer words the reader already knows and words that match what the terminal prints. Under 40 lines.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/words-<your slot letter lowercase>.md, then run `hc send t126 "done <your slot letter>: <return path>"`.
