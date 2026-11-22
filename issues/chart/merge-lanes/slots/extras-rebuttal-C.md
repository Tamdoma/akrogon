# Rebuttal: extras (slot C)

Disagreements, factual corrections, and current positions on the differing points in `slots/extras-merged.md` (checked 2026-11-21).

## Q1 — Crash-window fix (line 9, differs)

- **Position held (shift to B — drop the `reconcileBatch` `:873` edit)**: Re-reading `src/phase.ts:763-789` confirms `applied` stays `true` throughout `git push` (where push outcome is uncertain), and `applied: false` is written only after `git push` explicitly returns `non-fast-forward`/`[rejected]` (`:774-785`), so overwriting on a crash in that window is safe recovery and avoids editing `reconcileBatch` beside `failed-merge-resume`.

## Q2 — Slow alarm rule (lines 17–21, differs)

- **Missing in A and B (`slowEligible` red fast-fails)**: Neither A nor B fixes `slowEligible` (`src/verify.ts:172-178`), which currently admits red runs; 11 fast-fail red runs under 60 s in `framework` since 10-28 (`verify-runs.jsonl`) pull the rolling median down and prematurely close open episodes regardless of baseline rule.
- **Disagree with A and B's `accepted`-pin rule**: At 47–87 merge runs/day in `framework`, a 20-run `accepted` close fires in ~6–12 h — B's own replay stepped the pin up 3 times (`4.0->6.3`, `5.4->9.0`, `8.9->13.8`) and cleared `Slow merge:` from `akrogon status` every time while also producing 7 transient recovered episodes (and 23 episodes under A).
- **Disagree with B's rejection of drift on line 21**: B tested 7 days and 1.25×, whereas C's 14-day floor of 20-run green medians at 1.5× + 2 min produced 0 false alarms in `framework` (10-28..11-11) and `akrogon` (73 runs), fired once on `11-12` (`1.57×`), and kept `Slow merge:` open in `akrogon status` through `11-21` (`2.92×`).
- **Position held (C)**: Green-only `slowEligible` (`item.exit === 0`) + 14-day min-of-20-run-medians drift check (`>1.5× && >=2m`, gated on `>=20` green runs) + spike recovery hysteresis (`3× <=1.25×`, or B's `>=5`-run episode median recovery for spikes).

## Q3 — Guards before verify (lines 27–29, differs)

- **Minor factual correction on line 27**: `verify` runs in its own detached `verify-<id>` worktree (`src/verify.ts:464`), so the suite itself cannot dirty the leaf worktree; keeping `landGates` after verify only guards against external/parallel writes during verify.
- **Position held (shift to A — drop / leave recorded in `red-exit` Taken 9)**: At 1 of 649 `framework` attempts and 0 of 69 `akrogon` attempts since 10-24 (~12 min/month, <0.05% of lane time), it is not worth reopening `red-exit` Taken 9 or adding a second pre-verify gate pass to `src/land.ts`.
