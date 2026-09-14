# Fork: red-check owner

## Question
After a clean rebase, checks go red. Does B repair through check.fix, or does A fix forward in merge?

## Carries
merge-issue:33, :35 "a broken default branch discovered by this leaf is fixed forward with failing tests as criteria", routing.ts:33.

## Findings
- repo, framework reviews: 8 red-check merges, each repaired by B through check.fix with tests as criteria; A's merge pass reads code it did not write. Changes: red after rebase is a semantic integration defect, the implementer's job.
- Astra section 3 "Paired initial review and A-only repair review": A re-checking B's repair is kept for independence. Changes: A fixing then merging its own fix would remove the only second look.
- model-knowledge, no stronger source: A fixing forward at merge is the cheaper route by one contribution but the reviewer becomes the author.

## Taken
- repo, measured 2026-09-14: merge-issue:29 already runs every `checks` command after the rebase, so no test layer is added. Red after a clean rebase happened once in 137 merges (discord-chunk-report); B repaired it through check.fix, A re-checked, the leaf merged on attempt 2.

## Taken
Operator answer (2026-09-14): `15a`. Red checks after a clean rebase route to check.fix as today; B repairs, A re-checks the repair diff, A merges. Foreclosed: A fixing forward in merge.
