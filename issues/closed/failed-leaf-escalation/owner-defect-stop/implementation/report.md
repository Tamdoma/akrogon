# Implementation report: owner-defect-stop

Base: `d5b27353fd3ecd3fb59325fb94e6547c85e6893b`. Head: `758039c` ("watch-issues: guard next on unmerged prerequisites, notify owner-defect failures, extend stop closure"). Mode: subagents, two sequential waves of one unit (unit 2 depended on unit 1's landed rules).

## Changed files and reasons

- `skills/watch-issues/SKILL.md` only (3 bullets, 3 insertions, 3 deletions):
  - Waiting bullet: no `akrogon next` for leaves whose `blocked=` names an unmerged leaf; report waiting on that prerequisite; unknown slug reported as gap; `--all` scoped to unblocked leaves. Covers plan C2.
  - Failed-on-human-prerequisite bullet: merged-owner-defect reasons join the class with inventory resolution (merged only, never reopened, missing/ambiguous unresolved, unmerged attribution falls to failed-otherwise); first recognizing fire sends one owner-defect notice with fix-leaf next step, replacing the generic notice. Covers plan C1, C4.
  - Stop section: transitive closure (merged, failed-with-shown-evidence, or waiting chains leading to such failures) with four blockers (unreadable inventory, unknown slug, runnable leaf, busy seat). Covers plan C3.

## Commands run with pasted results

Unit 1 worker (commit `9db4d21`, cherry-picked as `758039c`):

```text
$ AKROGON_BASE=d5b27353fd3ecd3fb59325fb94e6547c85e6893b bun test --changed="d5b27353fd3ecd3fb59325fb94e6547c85e6893b"
--changed: 1 changed file, but no test files are affected
 0 pass, 0 fail
```

Lane changed tests after pick: same command, same result (prose-only change hits no test files).

Unit 2 worker (read-only, no commit): same changed-test command, exit 0, no test files affected. All six observer runs exit 0, empty stderr.

B full suite on lane head `758039c`:

```text
$ bun run format
(unchanged across files) exit 0
$ bun test
306 pass, 0 fail, 3621 expect() calls, 14 files [117.22s]
$ bun run typecheck
$ tsc --noEmit, exit 0
```

Exclusion sweep:

```text
$ git --no-pager diff d5b2735 --stat
skills/watch-issues/SKILL.md | 6 +++---
$ git --no-pager diff d5b2735 -- src skills/watch-issues/scripts
(empty)
```

Docs sweep: `grep -rn "human prerequisite" docs/ skills/watch-issues/SKILL.md` hits only `docs/guide/in-practice.md:89`, whose generic prose ("every remaining leaf is waiting on a human prerequisite that has been reported") still describes the extended Stop rule; no human-doc edit per plan D6.

## Artifact paths

- Walkthrough: `/tmp/owner-defect-stop-4wDXq7/owner-defect-stop-walkthrough.md` (106 lines; fixtures under `/tmp/owner-defect-stop-4wDXq7/case-{a,b,c}/`, stubs under `stubs/`). Six runs (owner-defect with dependent, plus runnable leaf, credential with dependent; each delivery shown/unshown) with verbatim observer output and per-leaf judgments: one notice per newly recognized failure, no stop while independent work runs, no fix-leaf instruction for the credential case. Covers plan C5.

## Known limitations

- Reason-text ownership parsing is heuristic by design (no `--owner` field); vague or adversarial text stays unresolved for the operator to settle (plan open limitation).
- Walkthrough exercised a single unambiguous merged owner; ambiguous/missing-owner and `delivery: error` variants were not exercised.

## Unverified criteria

None. C1-C7 verified: C1-C4 by rule diff inspection, C5 by the walkthrough artifact, C6 by the exclusion sweep, C7 by the blocking checks above.
