# Fork: standing-block

## Question
How do standing rules reach a leaf without the verbatim copy?

## Carries
standing-design.md last line, shapes.md:142 and :148, plan-issue:14, implement-issue:21, check-issue:14.

## Findings
- (B) O3: charting translates applicable rules into leaf criteria; O4: downstream skills read the canonical file. (A): a one-line pointer plus the interpretation paragraph; consumer-repo leaves see only the installed path.
- (B) R11: implement and check read design.md only.

## Taken
Operator answer (2026-09-14): `27a` design.md points at the installed standing-design path and keeps the interpretation paragraph; the verbatim copy at shapes.md:142 goes. Open designs keep their copied block. Forecloses keeping the copy.
