# Pending-step review B

Base: `568556b99236a3463e2eec416a625700e8990b06`.
Reviewed head: `a8130076a7e1c860eb3a4cd547f9748358ca284d`.
Verdict: **ready**.

No Fixes or Nits.

The deletions implement `CHART.md:22` and the expanded same-class scope in `pending/brief-B.md:3`. The reviewed worktree is clean, and `git ls-files config.yaml held.yaml admission.lock reconcile-host.json runs/` returns nothing there. No production code changed.

The host prerequisite holds: `/home/ivan/.akrogon/config.yaml` exists and the installed `akrogon status` exits successfully. `src/config.ts:197-201` selects that configured home before the tool root, and `src/state-home.ts:65` skips migration when destination configuration exists. The removed reconcile report and admission locks also resolve through the active home (`src/reconcile.ts:94`, `src/admission.ts:48`). The documented location in `docs/guide/install.md:64-70` agrees with this behavior.

The deploy plan limits deletion to obsolete root copies after cutover. Removing the locally changed obsolete file before self-update avoids its collision with the incoming deletion. `src/next.ts:1385` invokes self-update, and `src/self-update.ts:134-179` applies the incoming checkout while preserving unrelated changes. Actual push, deployment and the origin/main absence check remain the door's work.

## Deleted test and citation

At the base, `tests/harness-template.test.ts:8-17` forces `AKROGON_HOME` to the checkout and reads its machine configuration. Its three cases at `:23-37` inspect the operator's Claude template and its model substitution. That template is removed from repository ownership with `config.yaml`; retaining the test would require an absent tracked machine file or make repository verification depend on a host's private configuration. The deletion is supported by the requested state removal, rather than removal of a test for changed production logic.

The only test-changing commit, `a813007`, carries this supported trailer:

```text
Test-Change: tests/harness-template.test.ts issues/chart/run-release/CHART.md Pending steps: the tracked tool-root config.yaml is removed, and this test only read the operator's claude harness template from it; the template is machine state in ~/.akrogon/config.yaml, not repo code.
```

## Verification

`issues/verify-runs.jsonl:95` records verification of the exact reviewed SHA, with setup, formatting, tests and typecheck all exiting 0. Read the matching retained logs under `pending/`: `check-format-1792115347622-848454.log`, `check-test-1792115483255-848454.log`, and `check-typecheck-1792115485249-848454.log`. Tests report 955 pass, 0 fail and 9,637 assertions across 56 files. This run follows the test deletion. No rerun was needed.

Read-back limitation: `akrogon log` rejects the supplied `pending/` path with `no log for recorded path`. Its chart locator accepts only `direct/` (`src/evidence.ts:35-37`). The files exist and were read directly, with their exits and reviewed SHA corroborated by the verification receipt. This is not a failed product check.

Only this review file was written. No product edits, root-file deletions, commits, pushes, deployment or phase commands were performed.

Last operation: pending-step review recorded `ready`.
Next: chart door pushes, performs the scoped root cleanup and deployment, then records origin/main absence and working-status checks.
