# Review A: issue-flow-report

Base: `ed0a05d` · Reviewed head: `9103caa` · Verdict: **fix**

Verification evidence: `akrogon verify` green on 9103caa (format 0, test 833 pass/0 fail, typecheck 0) at implement end; no code change since. All five done-criteria traced to the diff and the green planned tests; the criterion-4 real run in `/home/ivan/Work/infra/akrogon` is recorded in `implementation/report.md` (75 carried rows, 57 uncarried, `summary backlog: 57 median 5.0d oldest 15d`, exit 0). AREA.md paths named by the changed line verified present in the registered checkout. Test-Change trailers on c7c9b42, c8d820e, 9103caa cover both changed test files with cited sources. Deliberate-break evidence (PR filter removed → `summary uncarried closed: 1` red) recorded in the report.

## Fix

- **F1 — `docs/guide/files.md` flow paragraph misdescribes which repositories are listed.** The new paragraph reads "one `state=all` issue listing per repository a leaf's `sources` names". The code lists `sort(union(carrier repos, originSource(repo)))` (`src/timing-report.ts` `flowReport`): the origin repository is always listed even when no leaf carries anything. Realistic source: an operator runs `akrogon timing --flow --since <d>` in a repo whose leaves carry no `sources` (every repo predating sources adoption, e.g. `boulevard-automation` today) — the guide says no listing runs, yet the command calls `gh api` on the origin and prints the whole backlog as `uncarried`. Consequence today: the guide cannot explain where the `uncarried`/backlog/`summary uncarried closed` lines come from in exactly the repos where every line is uncarried, and misdescribes the command's GitHub reads. Criterion: 5 (`files.md` must describe the leaf-carried coverage accurately). One-line fix: name the origin alongside the carried sources.

## Nits

- **N1 — `flowIssueSchema` types `created_at: z.string()` instead of `z.iso.datetime()`.** A non-ISO `created_at` yields `ms()` NaN → `isoUtc(NaN)` throws mid-print, or a listed issue misclassifies as `not in listing`. Deferred: no realistic source — GitHub's REST contract returns ISO 8601 for `created_at`, matching the loose-schema style already in `pull.ts`. Promoted by a real API response violating ISO.

## Notes

- Planned tests committed red at c7c9b42, corrected by A at c8d820e (fake-gh env not forwarded — planned-test wiring defect found by worker 1's mismatch, correctly routed through A's exception, not a worker edit), green on the product head.
- `pullRepo` behavior verified unchanged by `tests/pull.test.ts` green inside verify.
