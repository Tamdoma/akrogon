# Report the scope each verification run proves

Date: 2026-11-12. Judgment lesson from framework leaf `inline-dispatch-finish`, review B-N1.

## Case

The plan separately named `bun run hooks:verify`, but retained execution covered the configured `framework:verify:cheap` checks and seven targeted hook test files. The implementation report described the configured verify as a broad selftest result without retained output for the separately planned full hook chain. All leaf criteria had narrower boundary proofs, so the absent extra suite was a Nit rather than an additional merge gate.

## Evidence

- Framework `package.json` defines hooks:selftest under framework:verify:core, not framework:verify:cheap.
- `akrogon log /home/ivan/Work/infra/tamdoma/framework/issues/open/inline-completion/inline-dispatch-finish/implementation/check-cheap-1794503246331-1062403.log` shows the configured cheap command, its actual checks, and base/head `84e53c1e1155a4732934e5d063b4f9b9cc8bcd15` / `be597f3f52ada2bbd75a888b28b9884eb3e87676`.
- `akrogon log /home/ivan/Work/infra/tamdoma/framework/issues/open/inline-completion/inline-dispatch-finish/implementation/check-checkfix-criteria-1794503215455-1057305.log` shows 296 passing tests in the seven targeted files, including the pinned-inline regression and repaired gate replay.
- Leaf `plan.md`, `implementation/report.md`, and `review-B.md` record the planned extra suite and the scope distinction. No retained hooks:verify run was present at re-check.

## Learning

Read the expanded command and retained test-file output before stating what a green verify covers. Distinguish required checks, criterion proofs and a separately planned suite. Whether missing evidence is material to an acceptance outcome requires judgment. Do not turn an unneeded additional suite into a new blocking contract or claim that it ran.

This is a reporting/review judgment, not a fixed command or schema defect, so no seed report is filed.
