# dispatch-scope

## Question
Q1. After a leaf completes, which leaves may that pass start?
Q2. What should the Herdr startup pass (`next.sh --all`) do?

### Carries
- Expected behavior from Tamdoma/akrogon#29: leaves in other registered repos start only when the operator runs `akrogon next` for them (or `--all`).

## Findings
See INTAKE.md Agent findings. Tier better-than-training: inspected code in this repo and the Herdr plugin manifest (read 2026-09-26). No outside practitioner source applies; this is akrogon's own dispatch contract.

Options for Q1:
- A. Dependents only: start only leaves in the same repo whose `blocked-by` names the completed leaf. Keeps chaining, no new state.
- B. Same repo only: sweep the completed leaf's repo. Still starts newly handed-off unrelated leaves there.
- C. Nothing: completion starts no leaf. Every dependent needs a manual `next`.

Options for Q2:
- A. Resume only: startup advances leaves that already have a tab or worktree and starts no new leaf.
- B. Keep the global `--all` sweep at startup.

## Taken
Operator, 2026-09-26: "1a, 2a"

Q1: A. A completion pass starts only leaves in the same repo whose `blocked-by` names the completed leaf. Reason: keeps dependency chains (55 of 220 leaves use them) without a new state field, and nothing unrelated can start. Foreclosed: B (same-repo sweep still starts freshly handed-off unrelated leaves), C (no chaining).

Q2: A. Herdr startup resumes only leaves that already have a tab or worktree, plus merged leaves still in `issues/open/`, and starts no new leaf. Reason: closes the same global-start hole at restart. Foreclosed: B (global startup sweep).
