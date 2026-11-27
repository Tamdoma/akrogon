# Brief: opening territory map (slots B and C)

Work blind: do not read any other slot's map in this folder.

## Inputs

- Intake: /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/INTAKE.md (whole).
- Signposts and corrections (locks): /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/forks/signposts.md (whole). The approved names in its last correction are locked and must be used in the docs AND the codebase where needed (skills, printed command text, tests).
- Live surfaces: /home/ivan/Work/infra/akrogon/README.md, docs/ (all human pages and docs/pictures/*.svg; docs/reference-index.md is the agent map and stays), skills/chart-issues/ (where mode words live), src/ (printed mode and route words), tests/ that pin doc paths or words, https://tamdoma.ai (picture style), the operator's herdr workspaces (`hc ls`) and the last two weeks of charts under issues/chart/ for the real working pattern.

## Task

Map the territory for this chart, proportional to the work:
1. The material forks: page architecture (chapters and pages), what each chapter covers, picture set and style, the codebase rename scope (which files print or define the mode words, what tests pin), the cold-reader check, leaf split and order (charting chapter first per signposts 7a).
2. Practitioner questions a docs lead would ask for this reader.
3. Pitfalls over the work's lifetime: what each option could break or invite later (stale docs, broken pinned tests, renames that miss a printed string, SVGs that fail in GitHub dark mode, a rename in a skill reaching doors only after release).
Ground every claim in an inspected file (path) or a fetched source with date. Give your recommended shape for each fork with its reason and cost. Under 120 lines. Write no docs content.

## Reading rule

Read process text by named section for the step you are answering: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work. Name sections, never line ranges. The docs and the mode-word files are the subject of the work, so you may read them whole.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/builder-docs/slots/map-<your slot letter lowercase>.md, then run `hc send t126 "done <your slot letter>: <return path>"`.
