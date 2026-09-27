# Merge record

## Question

Q1. How are three-way merges attributed, given today's `(A)`, `(B)`, `(both)` tags?

### Carries
- forks/peer-shape.md Taken: C is a full blind peer, named only with B, so a merge has two or three slots.
- door-second-slot Taken: merged file uses attribution tags; B's rebuttal sits under the challenge check.

## Findings

Research 2026-09-26:
- better-than-training · `skills/chart-issues/SKILL.md:47,57`, `assets/questions.md:50` · `(both)` assumes two slots · with three, a tag must name which slots agree. `src/` and `tests/` do not parse tags, so this is wording in the skill and guide only.

## Taken
Operator 2026-09-26: `1a`

Q1-A: merged points list the slots that agree, such as `(A)`, `(B,C)` or `(A,B,C)`, with the same rule for two or three slots; `(both)` leaves the skill and guide. Existing charts keep their `(both)` tags as history.

Why: one rule covers every slot count, and no code reads the tags.

Forecloses: keeping `(both)` beside a new `(all)` word.
