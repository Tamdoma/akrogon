# Intake: foreign-leaf-diagnostics

## Scope
`akrogon next` reports a registered repo whose issue tree holds leaves keyed to another registered repo with one actionable message instead of one error line per leaf on every pass. The copy mechanism (a framework merge in the consumer) and the consumer cleanup are separately owned.

## Provenance
- GitHub: Tamdoma/akrogon#17
- Operator: chart-issues door 2026-09-18, "pull recent 3 issues, use slot B"

## Source: Tamdoma/akrogon#17
# Registered consumer repo carries a copy of another repo's issues tree; every akrogon next pass emits 96 repo-mismatch errors

Source: Tamdoma/akrogon#17
URL: https://github.com/Tamdoma/akrogon/issues/17

Unverified intake.

## Observation
`akrogon next` prints one JSON error line per leaf for the registered repo `clinique-la-roya`, all of the form:

```
{"repo":"clinique-la-roya","path":".../clinique-la-roya/issues/closed/<issue>/<leaf>","error":"Leaf repo mismatch at ...: stored key \"framework\", registered key \"clinique-la-roya\""}
```

Observed 2026-09-18 after the pass that followed a handoff in the `framework` repo. The consumer repo `/home/ivan/Work/personal/MDConsultingNY/clinique-la-roya` contains an `issues/` tree that is a copy of the `framework` repo's: 96 `state.yaml` files under `issues/closed` and `issues/open`, every one with `repo: framework`, plus the framework's charts (`website-run-defects`, `hooks-reports-import`, `client-review-integrations`, ...), `issues/log.jsonl` whose entries carry `"repo":"framework"`, `continuity/`, `history/`, `config.yaml` and `token-ledger.yaml`. The consumer has no leaf of its own. The copy arrived in commits titled `add issues` on 2026-09-13 (c5ecc121) and 2026-09-14 (f2e8d774, d6e72a03) in that repo. The mechanism that wrote it there is not identified; no framework update step that copies `issues/` was found by grep.

`akrogon status` on the same registry does not surface these leaves. `akrogon next` walks them and emits the error for each on every pass.

## Location
Project: akrogon. Surface: `akrogon next` leaf walk over registered repos (`src/next.ts` around line 102 raising `RepoMismatchError`, `src/state.ts:42-44,87`) and whatever process seeds a consumer repo with a framework `issues/` tree. Workflow: multi-repo registry with one framework repo and several consumer repos derived from it.

## Reproduction
1. Register a repo whose `issues/open` or `issues/closed` contains leaves whose `state.yaml` `repo` key names a different registered repo.
2. Run `akrogon next`.
3. One error line per leaf, every pass. Frequency: every pass since the copy landed.

## Expected behavior
Not provided beyond: a registered repo's issue tree should only ever hold leaves keyed to that repo, and a foreign tree should be detected once at registration or at first walk with a single actionable message rather than a per-leaf error flood on every pass. Whatever copies `issues/` between repos should not carry another repo's leaves, log, ledger and continuity files.

## Urgency
Medium. Dispatch continues for other repos, but every `next` pass produces 96 error lines and the consumer repo's own future leaves would sit next to foreign history. Workaround: delete the foreign `issues/closed` and `issues/open` from the consumer repo.

## Agent findings
- (both) The incident input is gone: clinique-la-roya commit e9a9a388 "Remove framework issue records inherited through the framework merge" deleted the 96 leaves; `issues/open` and `issues/closed` there hold zero state files on 2026-09-18. Residue remains: `issues/chart/` (8 framework charts), `issues/log.jsonl` (488 lines with `"repo":"framework"`), `continuity/`, `history/`, `token-ledger.yaml`.
- (A) The copy arrived through a git merge of the framework repo into the consumer (clinique merge 19cd1bb0 "Merge clinique-la-roya project history into framework checkout"); a merge carries every tracked file, including `issues/`. (B) The exact import command was not traced; no consumer update script was found.
- (both) `discover()` in `src/next.ts:98-107` reports each mismatched leaf and counts it unreadable; `report()` at `:77-83` deduplicates per path within one invocation only. `next` runs on every herdr event (`plugin/herdr-plugin.toml`), hence the flood.
- (B, correcting the report) `akrogon status` overview walks open only (`src/status.ts:44-69`), rejects the first mismatched open leaf and prints one `unreadable` record (`:288-289`); detail uses `allLeaves` (`src/state.ts:87`), which throws on the first mismatch in open or closed. Closed-only contamination is invisible to the overview but breaks detail and floods next.
- (B) `src/init.ts:16-49` registers a repo without checking existing leaf ownership.
- (both) Existing coverage: `tests/next.test.ts:1098-1117`, `tests/status.test.ts:269-298`.
