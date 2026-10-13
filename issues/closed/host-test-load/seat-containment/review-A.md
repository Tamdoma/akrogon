# Review A: seat-containment

Base: 6c43d3f3e8b353015e94f19bf56e4a884b0c3139. Reviewed head: e5776ad.

Verdict: nits

## Evidence

- I read the full diff `6c43d3f...HEAD` for src, systemd, docs and the AREA files, against plan.md D1-D8, the implementation notes, design.md (interfaces, exclusions) and implementation/report.md.
- Checks on e5776ad (report, run after the last change to every test and fixture): format rc 0, typecheck rc 0, test 878/0, test_changed 863/0. No code changed since, so I did not rerun them.
- Every done-criterion has a test plus live evidence:
  - C1: install and self-update tests, plus live `systemctl --user show akrogon.slice`.
  - C2 and C6: seat-containment boxing test, the delayed-placement reproduction and live attempt 3.
  - C3: next placement, run-check, base-run and config tests.
  - C4: the busctl.fail and busctl.misplace cases.
  - C5: the outside-pane and unreadable-cgroup tests, plus the live restart in attempt 3.
- The race fix has fail-before and pass-after evidence. 3be9dd1 failed with the live error, and e5776ad passes.
- AREA paths, listed with `grep -o` and `[ -e ]`: src/AREA.md names `run-holder.yaml` and `run.lock`, and tests/AREA.md names `issues/config.yaml`. These are runtime or registered-repo paths that came from main or earlier text, not from this diff. Every path this diff adds exists.
- Docs: install.md, setup.md, next.md and the README install row match the code. The slice values, the reload on install and self-update, the reserved bus name, the close-and-recreate of outside panes, the skip on an unreadable cgroup and the unboxed hand-split panes all match.
- Design exclusions hold. There is no stop or start verb, no TasksMax, no per-leaf limit, no slice removal and no adoption of restored shells (they are closed and recreated).

## Nits

- N1. src/AREA.md:19 says `leafSlice` is "used by leaf-stop", but no leaf-stop code exists yet. It is the design's planned consumer (design.md:103).
  - Deferred because nothing misbehaves. A reader finds one export with a forward claim.
  - It becomes a Fix if leaf-stop is dropped from the roadmap.
- N2. The 5 s adoption poll in `box` (src/next.ts) has a fixed ceiling. Live placement took milliseconds.
  - Deferred because no observed run came near it.
  - Evidence that would make it a Fix: a live `next` log under host load where placement took longer than 5 s.
- N3. Each poll step calls `herdr pane process-info` again, even though the pid is already known. That is up to 100 herdr calls on a slow placement.
  - Deferred as cost only, with no wrong behavior.

## Operator actions

None.
