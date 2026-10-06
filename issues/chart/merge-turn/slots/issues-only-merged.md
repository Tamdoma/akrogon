# issues-only, merged round (A, B, C)

Sources: slots/issues-only-A.md, -B.md, -C.md. A checked after reading B and C: `issues/config.yaml:11` (`test_changed` uses `bun test --changed="$AKROGON_BASE"`), `src/sync.ts:109-119` (sync stages `issues` minus seeds), `.gitattributes` (`learnings/LESSONS.md merge=union`), `git log -- learnings` (akrogon `add issues` commits a2e8241, e99801d, 8ebb3f6, b1bdde3 change `learnings/`; leaf commits 0cd981b, 802987a do too).

## Facts all slots agree on (A,B,C)
- After the merge turn, the only thing still moving main during a batch run is the operator: `add issues` plain commits and `akrogon sync` (`src/sync.ts:136`).
- Two seats already reused green runs by hand after an issues-only move (fw lane-orphan-check review-B.md:139-147, spec-mutation-anchors review-B.md:113). No rule defines it (`skills/merge-issue/SKILL.md:51`).
- `issues/config.yaml` is the check list and must never be ignored.
- Operator record commits usually also change `learnings/` (A,C). A rule that ignores only `issues/` still reruns for most of them (A,C).
- No inspected check reads tracked files under `issues/` or `learnings/`. akrogon tests use temp fixture repos; framework scripts mention `learnings/` only in comments. A search, not a proof (A,B,C).

## Q1. When main moved only by record commits during the batch run, does the batch rerun?
- 1a (A,C recommended): reuse on proof. After a refused push the command restacks the batch on the new main and runs `git diff --quiet <tested top> <new top> -- . ':(exclude)issues' ':(exclude)learnings'` plus `git diff --quiet <tested top> <new top> -- issues/config.yaml`. Both equal: push with no new run, record both SHAs and the result. Anything else: rerun. The command decides and prints, the seat only acts. Comparing tops (C) beats comparing old and new main (A's first form) because it also catches a changed restack. Cost: pushed SHA differs from tested SHA with identical code outside the record folders, which reads the check-scheduling lock's "final rebased commit" as "same code".
- 1b (B recommended): hold publication. `akrogon sync` refuses while a turn is held; operator plain pushes wait by agreement. Cost: a local command cannot stop plain `git push`, which is how `add issues` lands today (B,C), so the race stays unless every writer obeys.
- 1c (A,B,C): always rerun. Cost: about one 35-minute run per record commit during a batch. 2026-10-05 had three such commits in 90 minutes (C).

## Q2. Which folders count as records?
- 2a (A,C recommended): everything under `issues/` except `issues/config.yaml`, plus everything under `learnings/`. Fixed in akrogon, no setting. Cost: a rule for every akrogon repo that no check reads tracked files there, documented next to `checks` in `docs/guide/setup.md:53-54` (C).
- 2b (A,C): `issues/` minus config.yaml only. Cost: most `add issues` commits still cost a run.
- 2c (C) / B's 1b variant: per-repo declared record or input paths. Cost: new setting, and B's declared-inputs form reopens the locked check-record runner (check-scheduling.md:22-24).

## Disagreement
- B: folder names are not proof for arbitrary commands; `AKROGON_BASE` also changes after restack. A answer: with the leaf restacked, `<new main>...<new top>` and `<old main>...<tested top>` differ only in record files when the top comparison passes, so `bun test --changed` selects the same tests unless a test is selected by a record file, which none is. The probe below covers the remaining "secret reader" risk.

## Pitfalls avoided
- Mixed commit (records plus code) or a code commit behind a record commit fails the comparison and gets a full run (C).
- `merged --check` still runs on the new top (seconds) (C).
- Restack over a lesson commit does not stop: `learnings/LESSONS.md merge=union` (C).
- Probe before handoff (C, pending): search the check commands of akrogon and framework for reads of tracked `issues/` or `learnings/` files, record the result in the fork.
- Done-criterion (C): a record-only commit during a batch run ends in one check run total and a push; a one-line code commit ends in a second run.

## Challenge check
- 1a bends the lock's literal reading. If the operator wants the pushed SHA to always equal the tested SHA, the answer is 1c and its cost is real.
- 2a rests on "no check reads these folders", backed by search and the pending probe.

## After rebuttals
- C: no disagreement, adopts the merged 1a form.
- B F2 accepted: equal tops alone are not enough. If main gains a code commit that matches part of the leaf's change, the tops stay equal but the leaf's own range (used by `test_changed` through `AKROGON_BASE`, `issues/config.yaml:11`) shrinks. 1a now needs both: old main and new main equal outside the record folders (A's first form), and tested top and new top equal outside the record folders. Together they mean the leaf's range is unchanged outside records, so the `AKROGON_BASE` selection is unchanged. The merged claim at "Disagreement" is replaced by this.
- B F3 accepted: union merge covers only `LESSONS.md`. A restack conflict on any file, history files included, falls back to the normal path: resolve, then rerun. A resolved conflict never qualifies for reuse.
- B F1 accepted as framing: 2a is an operator-approved rule ("checks must not read tracked `issues/` or `learnings/` files, except `issues/config.yaml` as the check list"), not a proof. B still prefers 1b. Held disagreement, shown to the operator.
