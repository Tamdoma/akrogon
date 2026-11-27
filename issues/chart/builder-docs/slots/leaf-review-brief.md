# Brief: leaf contract review (slots B and C)

Review each draft leaf as the implementer who must build it. Drafts (read every file):
/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cbe6ffb3-cf96-4e61-ac35-95fbfe7b9209/scratchpad/drafts/builder-docs/ (EPIC.md, taxonomy-rename/, charting-guide/, charting-pictures/)
/tmp/claude-1000/-home-ivan-Work-infra-akrogon/cbe6ffb3-cf96-4e61-ac35-95fbfe7b9209/scratchpad/drafts/builder-docs-rest/ (EPIC.md, guide-chapters/, guide-pictures/; these are written into issues/parked/ and unparked by the operator after reading the charting chapter)

Locks: /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/forks/signposts.md and forks/docs-shape.md (`## Taken`).

Return disagreements only, each with evidence (path or source) and the exact fix: a done-criterion that cannot pass within the leaf's ownership, a fact that is wrong about the repo (paths, tests, commands), a missing consumer, a cross-leaf promise no owner accepts, a link that would be dead at landing, a criterion that names a test count or a score standing in for a model's reading, or a binding decision with no home. Name the file and the line text. Under 50 lines.

Reading rule: read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges.

Write to /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/drafts-review-<your slot letter lowercase>.md, then run `hc send t126 "done <your slot letter>: <return path>"`.
