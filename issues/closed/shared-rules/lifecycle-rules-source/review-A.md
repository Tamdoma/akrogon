# Review A — lifecycle-rules-source

Base: 81c6bc8338846fb397c55fd46988bcd03d945573. Reviewed head: e8eaaf8d30aacbfc1fab78132a88d49fa20f9f66. Verdict: fix.

## Fix

**F1. The `.env.example` exception is stated twice.** `skills/lifecycle-rules.md` line 11 ends "(the merge seat's is that configured merge checks may read the committed non-secret template `.env.example`)" while `skills/merge-issue/SKILL.md` line 20 states the same clause as merge's own line. Realistic source: the next editor of merge's `.env` exception (a real seat-rule edit, routine in this repo — 8 of the 18 shared-rule commits since 2026-10-01 touched this family). Consequence today: the clause lives in two places and a later edit must reconcile both by hand — the exact drift cost the leaf removes, contradicting done-criterion 1's "no second copy" and plan decision D3 (seat-only rules stay local). Criterion hit: done-criterion 1 (each family stated in one place; each skill keeps one short line for what is its own) and criterion 3 (the `.env.example` difference survives — in merge's line, not also in the shared file). Repair: delete the parenthetical, keeping "A seat's own exception is named beside its skill's link to this file."

## Nits

**N1.** `skills/check-issue/SKILL.md` states "`check.review` launches no covered operation" twice: once in the Shared-context link block and once as the fuller sentence in `## check.review`. Deferred: same file, no divergence yet; trim the link-block clause or leave it for a later wording pass. Evidence to promote: any edit touching one copy and missing the other.

**N2.** The two edited "seat rule" sentences in `docs/reference/checks.md` name implement/check/merge for seat parts but omit plan-issue, which does hold a seat part (its record file `plan.md` and retry pointer). Deferred: the shared file names all seats and plan's link block states its own parts; the omission misleads no rule lookup today. Evidence to promote: a reader reporting they could not find plan's seat rule.

## Verification evidence

- `check link-check: 0` — docs-links test passes on this head; the four in-folder link files resolve and `lifecycle-rules.md` holds no relative links (criterion 5).
- `check known-red-literals: 0` — shared file holds `akrogon verify --known-red`, merge-issue/SKILL.md holds `akrogon verify --attempt <id> --known-red` (criterion 6).
- `check run-check-rule-test: 0` — moved literal assertions read the shared file and the two worker-facing copies.
- `check docs-links-full: 0` — all 11 docs-links tests pass.
- `akrogon verify` on head e8eaaf8d: first run red on a door-reset timing flake, retry green — `inconsistent` per the red-check rule; the diff touches no code path that test exercises.
- AREA.md check: all 21 paths `skills/AREA.md` names exist from repo root (live listing run this pass).
- Clause table in `implementation/report.md` walked along the nine reading paths: every clause reachable by each seat that held it; producer save held by plan+implement only; fixture cleanup/absence by check+merge only; excerpt clause by implement/check/merge only; merge's `.env.example`, `--attempt` forms and endings; check's flock + merge_checks refusal + check.review no covered op.
- Re-read sentences: plan/check/merge verbatim; implement's names the conditional reads and agrees with them (criterion 4).
- `src/akrogon.ts:24` unchanged; `### Shared endings` still answers the retired-hold message (plan D11 stands).
- `check.repair`'s borrow resolves: the stub keeps "During check.review, a red test or check" as its opening words.
- Word counts: 14,311 → 11,574 across the four SKILL.md plus 1,307 in the shared file.
- `Test-Change:` trailers on c49650bb and e8eaaf8d name real sources (criterion 6 / criterion 1 moves).

## Report-audit notes

- The report's commands section lists run-check names and verify results; no command was skipped, filtered or run before the latest change to its test file — the final `docs-links-full` run is on e8eaaf8d.
- Report's "grep verified" claims independently re-verified in this pass (four marker phrases once in `lifecycle-rules.md`, absent from SKILL.md files).
- No proof-command corrections were made or needed.
