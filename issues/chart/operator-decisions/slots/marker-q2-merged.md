# Marker Q2 reshaped, merged, 2026-11-19
- Pick (A,B): counts when the issue author and every body editor have `permission` write or admin (maintain maps to write) on the issue's repo, read per distinct login via `gh api repos/<r>/collaborators/<login>/permission`; else, or on a failed read, "marked, not taken" with the reason; the opening map names the deciding login (B). Use `permission`, not `role_name` (B, GitHub REST docs).
- Rejected (A,B): marker alone (akrogon public, issues open, no interaction limit); org membership (admits read-only members, drops outside write collaborators, A: needs org scope); config list (A,B: needs code under strict config schema, second list); last editor only (B); edit-diff authorship (B); door's account only (operator).
- Costs (B): an outsider-authored report later edited by a colleague is not taken; permission read at door open, so a removed colleague's decision stops counting for new charts while taken forks stay.
- Pitfalls: caller permission needed for the read is undocumented and only proven as admin (B), limit recorded and a colleague run offered; Moderate role mapping unknown (B), limit; bots read none, not taken (B); edit after pull, not taken (A,B round 1).
- Open (B): repo checked is the issue's repo, not the leaf destination; closing akrogon issues to outsiders is outside this chart.
- Where slots differ: none.
