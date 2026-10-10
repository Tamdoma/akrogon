# State

The state file tells Akrogon what should happen next. It is separate from the code in the leaf's worktree.

## What it looks like

A new CSV export leaf can start with:

```yaml
slug: export-csv
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by: []
sources: []
```

Save it here:

```text
~/Work/widgets/issues/open/export-csv/export-csv/state.yaml
```

The repo value must match the registration key in the machine configuration.

## The fields you'll actually touch

- **repo** identifies the registered repository.
- **phase** selects the lifecycle step. Use the phase command for changes.
- **blocked-by** lists prerequisite leaf slugs.

For example, a download-button leaf can wait for the export code:

```yaml
slug: download-button
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by:
  - export-csv
sources: []
```

To keep work away from agents, park its issue with `akrogon park <issue>`. Parking removes the whole issue from the open queue (see [next.md](next.md)). To freeze automatic work for the whole repo including allocated leaves instead, pause it with `akrogon pause` (see [next.md](next.md)).

## The fields Akrogon owns

Akrogon records the worktree, Herdr tab, completed seats, review verdicts, prompt delivery attempts and the `merge_stamp` breaking ties in the merge turn's dependent-count ordering. It also records failure details.

The merge holder's state carries `batch`, the record the command wrote for its merge pass, kept after the push for reconciliation: `attempt` (the id every batched phase call must repeat), `built_on` (the remote base the stack was built on), `members` (each carried leaf as `{ slug, base, head, tip }`, its saved merge-base, pre-batch head and applied tip), then `top` (the applied stack head), `tested_top` (the head the merge seat checked), `tested_main` (the remote base that head stood on), `candidate` (the head submitted for the push), `decision` (`reuse` or `rerun` after a refused push), `applied`, `excluded` (slugs excluded from the attempt by stack-build conflicts) and `solo` (the holder rebases itself instead of using a recorded top).

A holder whose batch ran red carries `batch_limit`, half its red batch's member count: its next batch carries at most that many members, while a red ending that ejects a culprit clears the record without setting `batch_limit`. The flag clears on any move out of the phase.

Leave those fields to the commands. Editing them by hand can make the file disagree with the running agents.

A prompt delivery failure and a seat-declared blocker are different failures. Read the recorded reason before choosing a recovery.

```text
+------------+   read   +-----------+
| state.yaml |--------->| next pass |
+------------+          +-----------+
      ^                      |
      | save                 v
      |              prompt required seats
      |                      |
      |                      v
      |                  seats work
      |                      |
      |                      v
      |                phase command
      |                      |
      +---- record done or move phase
```

For export-csv, the first review verdict is recorded while the other required seat is outstanding. A completed transition saves the new phase and clears the previous pass's bookkeeping.

## One concrete use

Check the leaf before changing it:

```sh
cd ~/Work/widgets
akrogon status export-csv
```

If a failed leaf is ready to continue, choose the appropriate active phase:

```sh
akrogon phase export-csv implement
akrogon next export-csv
```

A failed leaf can resume at any active phase. It does not have to return to the phase where it stopped. Choose based on the work already completed. See [Phases](phases.md).

## Why the record survives a conversation

The state and artifacts live in files. A later pass can read the brief, plan, implementation report and reviews even when an earlier conversation has ended.

This supports resuming unfinished work. It is not a full process checkpoint. The seat still needs to inspect the current diff and any Git operation in progress.

For CSV export, a failed merge may leave valid code and a useful review behind. Recovery should preserve that work and finish the missing step, rather than start the feature again.

Previous: [Parts](parts.md) · Next: [Install](install.md) · [Home](../../README.md)
