# Worker duty

## Question
Q1. Should implement-issue workers keep running the full changed-tests command, or run only their unit's targeted lanes while A runs the changed-tests command after each pick?

### Carries
- slots/system-merged.md leverage 2 (C pick, B dissent), R5. worker-protocol.md:11,25, brief-template.md:37, implement-issue SKILL.md:57. check-reruns locks. Intake report 2 (two raw worker runs).

## Findings
- Workers run only the targeted tests their brief names (none named = no changed-tests run); A runs the changed-tests command after each pick and every check at phase ends (A,B,C).

## Taken
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken: workers run targeted tests only; A owns changed-tests and phase-end checks. Edits worker-protocol.md, brief-template.md, implement-issue SKILL.md. Implements load-guard "workers do not run the full check".
