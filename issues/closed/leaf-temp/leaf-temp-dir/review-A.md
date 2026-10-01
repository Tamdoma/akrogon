# Review A: leaf-temp-dir

Base: `88f252f02eb36aacee6dadf6668c303374b692d5`. Reviewed head: `5b31956d63d14d17cfbc2785ff210dd674ddf77d` (lane clean, matches report). Blind initial review; peer review not read.

## Verdict: nits

One immaterial report nit. No Fix: every done-criterion has a catching test run live below, design exclusions hold, and the diff touches exactly the 10 planned files.

## Evidence (run live on the reviewed head)

- `bun test tests/next.test.ts -t 'allocation carries TMPDIR'` → 8 pass (C1 fresh, 4 extended missing-seat, 3 refusal).
- `-t 'leaf temp path bounds'` → 1 pass (C2, string-only, production prefix, no writes).
- `-t 'closed tab scratch'` → 2 pass (C3 merged deletes plus porcelain clean, failed keeps sentinel).
- `-t 'sweep scratch catch-up'` → 2 pass (C4 open plus closed delete with no panes and no tab-close call; live panes close once, keep sentinel, second sweep deletes).
- `-t 'recreates missing scratch'` → 1 pass (C5 same tab and seats, no create or split).
- `-t 'fixture temp root'` → 1 pass (C6 `f.env` carry, `cli` default refill, `nextAt` inheritance).
- `ls -A /var/tmp/akrogon-1000` → 0 after every run above.
- C7: `grep -c` shows the `$TMPDIR` sentence exactly once in each of the 3 skills and `confirmed gone` exactly once in each of the 3 guides; contradiction sweep over `docs/guide/*.md` shows only sweep instructions and parking with no stale cleanup claim. `docs/guide/next.md` describes no allocation env, so no unchanged page went stale.
- Full `bun test` (353 pass) and `bun run typecheck` (pass) taken from the report at this same head; lane verified clean and unmoved, so no rerun.
- No `AREA.md` in the diff; no area-pointer check applies.
- Exclusions confirmed in the diff: `TMPDIR` only (3 `--env` pairs), no state/config/status/phase file touched, `:812` pane-hook caller ignores the new boolean with tab-close timing unchanged.

## Findings

- N1 (report line drift, deferred): report cites C3 `:3346/:3382`, C4 `:3412/:3463`, C5 `:3491`, C6 `:3516`; the formatted tree has them at `:3360/:3396`, `:3426/:3477`, `:3505`, `:3530` (prettier wrapped earlier tests). Reproduction is the `grep -n` above. Deferred because every test name is exact and each was found and run by `-t` filter, so verification is unaffected; a report gap blocks only when material. Promotion would need a cited test that cannot be found by name, which is not the case.
