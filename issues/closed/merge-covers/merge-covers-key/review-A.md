# Review A: merge-covers-key

Base: 4534a569205c3903bcfd56145e74ec8caa4197d5
Reviewed head: 54b6a34917e1934be1947c0ad5169fa371f8e462
Worktree clean at review, head ahead of base. No AREA.md in the diff.

## What was judged

Whole diff (7 files, 3 commits) against plan D1-D8, brief criteria 1-5, design
exclusions, report claims, and live contracts. Blind review; peer's review not
read.

## Verification evidence

- Live probe in a scratch repo (`AKROGON_HOME` temp, real `bun src/akrogon.ts`):
  unknown cover fails exit 1 naming repo and `nope`; non-empty covers with
  empty `merge_checks` fails exit 1 naming repo and `[keep]`; valid mixed
  config exits 0 with `merge_covers` in output; malformed config under
  `akrogon status` still prints the `{"unreadable":...}` diagnostic (error-type
  preservation holds).
- Reran on reviewed head: `bun test tests/config.test.ts tests/status.test.ts
  tests/docs-links.test.ts` → 55 pass, 0 fail.
- Report's full-suite evidence on this base: 542/542 and 430/430. Not rerun in
  full; targeted rerun above plus the live probe cover the changed behavior.
- `grep merge_covers` over check/implement skills: no hits. Docs sweep of
  remaining `every \`checks\`` and `merge_checks` hits: all describe
  implement/check passes, proof scope, or setup wrapping. Correctly unchanged.
- Test-changing commit carries a `Test-Change` trailer naming the added cases
  and unchanged expectations. No existing assertion changed anywhere in the
  diff.

## Findings

No Fixes. No Nits.

- D1-D4 hold: field, refine, type-preserving repo prefix in both `readRepo`
  and `initialize`, output presence, setup passthrough by spread (`withSetup`
  untouched in the diff).
- D5-D6 hold: merge prose covers stack, solo, and red/rerun via the clarifier;
  both guide pages and the init template state the skip rule.
- D7 holds: unit tests plus fixture execution with fail-first breaks recorded
  in the report. D8 holds: no check/implement change, no ordering change.
- Criteria 1-5 each have passing proof linked in the report. No doc page
  describing the changed behavior was left stale.

## Verdict

ready
