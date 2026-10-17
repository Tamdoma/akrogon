# Review A: any-consultants

- Base: `0dfae200ae84fc46f10e0d07973c78721cf5d7c9` (origin/main)
- Reviewed head: `b92b0608372eff522036ed10da26348ce612a9e4`
- Diff: three files — `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md`. No `Test-Change:` trailers in range; none required (no file matched by `src/test-files.ts` changed).

## Evidence

- `akrogon verify` on head `b92b060`: green (`verify leaf b92b060…: green`; 993 pass / 0 fail; logs `check-test-1792224916883-861525.log`, `check-typecheck-1792224919795-861525.log`).
- Plan's criterion proofs rerun green on the reviewed head: `check roster-green: 0 .../check-roster-green-1792224708162-860816.log`, `check owned-files: 0 .../check-owned-files-1792224708257-860954.log`.
- Full diff read line by line (12 insertions / 12 deletions across the three files).

## Criterion check

1. Roster rule: `SKILL.md` Open and `questions.md` Blind peer exchange both state the operator may name none (`single slot`) or any number, letters follow naming order with the first named peer as B. All cap wordings removed (`C is named only with B`, `optionally C`, `then the C pane when given`, `<B pane> --direction down`, `B and C sharing`). Repo-wide grep finds no stale coupling residue. Pass.
2. Stated-once rules: first-reply naming (Open), pane creation (one paragraph per file), blind exchange, return-path examples (D added across `map-`, `fork-name-`, `rebuttal-`, `final-check-` series), brief pointer `(A, B, C, D)`, rebuttal/final-shape/leaf-review/seat-record each as `each named peer`, agreeing-slot tags extended with `(A,B,C,D)` in both Take and Handoff. `map-brief-A.md` retains the old form but is verbatim-unchanged pre-existing text, not a regression. Pass.
3. Pane creation: later-peer command is `herdr pane split <previous peer pane> --direction down --ratio 0.5 --cwd <root> --no-focus` in both files; size sentence keeps the A-fills-tab gate and says all created peers share the right 35%, adding the proven consequence (each later peer half the previous peer's height — matches readiness.yaml proof: B 19 rows, C and D 9). Pass.
4. Direct route: `B is not named` eligibility unchanged, `check-issue direct slot=B` unchanged, and `B — the first named peer —` now defines B where the section opens. Guide line 241's `a B pane named` stays consistent. Pass.
5. Guide peer section: any number of named peers, blind to A's work and every other peer's work; diagram generalized to `each further peer researches independently`; line 207 already covers `each named peer`. Pass.
6. `git diff --name-only` output is exactly the three owned files (verified). Pass.

## Affected docs check

The changed behavior is the peer roster; the doc page describing it (`docs/guide/chart.md` peer section) was opened and updated consistently. `skills/AREA.md` and `docs/reference-index.md` name no peer-count claims — no stale pointers. No `AREA.md` in the diff.

## Findings

None. No Fix, no Nit, no Operator actions.

## Verdict

ready
