F1 — #110 would close with an uncovered observation.
Evidence (2026-10-22): draft state.yaml includes Tamdoma/akrogon#110, while draft design.md, “Binding decisions, verbatim”, excludes its mise shim hang as Off route. Intake #110 reports both the hang and the authentication failure. shapes.md, “Leaf files”, requires a partial match to stay open with its uncovered part shown.
Change: remove #110 from this leaf's sources and retain it in intake with the shim investigation explicitly uncovered. Keep the credential documentation change.

F2 — The locked locale setting has no readiness proof entry.
Evidence (2026-10-22): fork check-contract.md, “Findings”, records P2 using LANG=C.UTF-8 and observing one character instead of two. Draft readiness.yaml records only P1 and P3. chart-issues SKILL.md, “Take”, requires proofs of locked outside-tool settings to be linked from readiness.yaml.
Change: add P2 to readiness.yaml with its recorded command, local identity, tool versions, date, result, cleanup and limits, linked to the fork. No additional probe is needed for the already recorded result.
