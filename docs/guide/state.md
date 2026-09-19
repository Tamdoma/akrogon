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
- **hand_built** keeps a leaf out of automatic dispatch.

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

Use hand_built when you intend to handle the leaf yourself:

```yaml
slug: export-csv
created: '2026-09-19'
repo: widgets
phase: plan.synthesis
debate: 'no'
blocked-by: []
hand_built: true
sources: []
```

That prevents later dispatch. It does not stop an agent already working.

## The fields Akrogon owns

Akrogon records the worktree, Herdr tab, completed seats, review verdicts and prompt delivery attempts. It also records failure details.

Leave those fields to the commands. Editing them by hand can make the file disagree with the running agents.

A prompt delivery failure and a seat-declared blocker are different failures. Read the recorded reason before choosing a recovery.

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
