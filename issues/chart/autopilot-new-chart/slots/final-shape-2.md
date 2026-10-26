# Corrected final shapes after final-check-B FC1 and final-check-C FC1-FC5

Round 1 `no` (Nb):
- Proposal question: "chart <X> on its own (yes) or bring it into <waiting chart> (no)?"
- Yes: operator words add <X> to the handed list (`changed list` mode entry); A charts <X> in the same autopilot run, handover as usual [C FC4]; the waiting chart resumes after <X>'s leaves are written.
- No: A resumes the waiting chart with the found work in scope as forks or prerequisite leaves; A rewrites the Destination under that answer and records the operator's no verbatim as the override [C FC5].

Round 2 `cross-repo` (X1, corrected):
- After <X> is handed off, when the waiting chart's dependent leaf has a different destination repo than <X>'s leaves [C FC2], the waiting chart stays unhanded with one ordinary `wait:` line naming every needed <repo>/<leaf> of <X> and its landed check: each named leaf folder is under that repo's `issues/closed/` [C FC3]. No `pending step:` line [B FC1].
- Resume: the operator's next message in the same door, by the existing waiting-chart rule; the mode stays on meanwhile [B FC1, C FC1]. No cross-repo blocked-by, no timer.
- Same destination repo: `blocked-by` on <X>'s leaves, no wait.
