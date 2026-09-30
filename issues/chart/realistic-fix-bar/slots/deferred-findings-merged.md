# Deferred findings

## Question
Q1. Where does a downgraded finding live, and must the repair seat fix it?

### Carries
- Seed: "Reproducible defects that need contrived input are Nits, listed as deferred follow-ups, and do not block merge."
- Locks: [fix-bar](fix-bar.md) (handcrafted reproduction without a realistic source is a Nit), [test-bar](test-bar.md) (no regression fixture for a Nit), [success-measure](success-measure.md) (each Nit states why it is deferred).

## Findings
Research: better-than-training · `skills/check-issue/SKILL.md:41,55`, `skills/implement-issue/SKILL.md:56-60`, `skills/merge-issue/SKILL.md:31`, `docs/guide/learn.md:3-9`, read 2026-09-30; practitioner · GitLab code review guidelines https://docs.gitlab.com/development/code_review/ (non-mandatory suggestions are labelled non-blocking and do not hold the merge). Nits already live in `review-<slot>.md` and merge-issue turns held reusable Nits into lessons. `implement-issue:56` repairs "the recorded findings" without separating Fixes from Nits, so A may spend a repair round on deferred findings. (A,B, from independent opening maps)

Options:
- 1a Nits stay in `review-<slot>.md` with the reproduction, why it is deferred, and what evidence would promote it to a Fix. The repair seat fixes Fixes only and leaves Nits untouched unless a Nit falls inside the lines it is already changing for a Fix. No ticket, no new state. (A,B)
- 1b Each deferred finding is filed as a GitHub seed by the merge slot. Visible backlog, but a new merge step, external writes and backlog noise. (A,B reject)

Pitfalls: if implement-issue still reads "all recorded findings", A keeps repairing Nits and the time saving is lost. A Nit later confirmed by a real source becomes new intake, not a reopened leaf. (A,B)

## Taken
