# Control — blind Slot B notes

Read Intake, Control Question/Carries and Boundary Taken. No control-A.md or merged files read. Boundary locks accepted: freeze every automatic action including cleanup, --resume always automatic, manual next/--all preserve their full cascades without clearing pause. All sources below checked 2026-10-08. Repo paths are relative to /home/ivan/Work/infra/akrogon.

## Q1 — Storage and commands

### Pick, reason and cost

Recommend machine-local operational state in one ignored, schema-validated file under globalHome(), separate from both configuration files. Proposed path: `.paused-repos.yaml`, containing the set of paused registered repo keys. Missing file means no pauses as the explicit initial state. Existing unreadable or invalid state must raise an error, never silently enable dispatch. Add the exact ignore entry because globalHome() defaults to the tool checkout.

Recommend `akrogon pause` and `akrogon unpause`, each with no positional arguments, resolving the current registered repo through requireRepo. They work from its subdirectories and worktrees. Print the affected repo and resulting state after the locked write. Repeating pause/unpause succeeds without changing the meaning. No --all or repo-name selector is needed to meet this report.

Reason: stopping a local Herdr launch loop should not change checked-in project policy or unrelated machine configuration. Cost: a small new operational-state reader/writer is needed, and pause belongs to this AKROGON_HOME rather than every machine using the Git repository. A repo-key rename does not inherit the old key's pause. Record this identity choice explicitly rather than letting implementation guess.

### Rejected options

- Key in issues/config.yaml: fewer storage files, but turns a temporary local action into a tracked project edit that sync or another checkout can propagate or overwrite. Choose only if the operator wants shared policy.
- Key in global config.yaml: machine-wide location is familiar, but this file is tracked here too and mixes runtime control with editable configuration. A command rewriting it also risks clobbering unrelated edits.
- In-memory flag or environment variable: does not persist reliably across independent hook processes or Herdr restarts.
- Toggle command: a retried request can invert the desired state. Explicit set/clear commands make retries safe.
- Extend park/unpark: these move issue folders and intentionally reject allocations. They are a different operation.

### Evidence

- Operator tier: #61 Intake, https://github.com/Tamdoma/akrogon/issues/61. The use case is local seat replacement or usage-limit handling while other repos keep dispatching.
- Better-than-training: `src/config.ts:153` defines globalHome using AKROGON_HOME or toolRoot; `src/config.ts:161` reads machine config; `src/config.ts:165` reads repo config. `git ls-files config.yaml issues/config.yaml .gitignore` returned all three. `.gitignore:1` onward has no pause-state entry. This changes the recommendation from “anything under home is local” to an explicitly ignored separate file.
- Better-than-training: `src/config.ts:188` resolves worktrees through the Git common directory; `src/config.ts:201` rejects unregistered locations. `src/park.ts:47` uses that resolver and the global lock. `src/akrogon.ts:31` parses strict CLI options. Reuse those command conventions.
- Better-than-training, outside primary docs: Temporal exposes distinct pause/unpause/describe/trigger operations in https://python.temporal.io/temporalio.client.ScheduleHandle.html. Argo CD exposes an explicit automation-enabled flag in https://github.com/argoproj/argo-cd/blob/master/docs/user-guide/auto_sync.md. These support explicit state-setting controls rather than toggles, but do not determine local versus shared storage for Akrogon.

### Pitfalls and removal

Atomic write plus the existing global lock prevents concurrent pauses from losing another repo's state. Use the existing rename-based writer (`src/shell.ts:67`) and parse once at the storage boundary. Test preservation of another repo, repeated requests, corrupt state, AKROGON_HOME isolation and worktree resolution. Reads at the locked automatic-action boundary must use current persisted state, not a config object cached before pause.

### Missing question

Is the pause local to this AKROGON_HOME, keyed by the registered repo name, or intended to follow a repository across registration renames/machines? Recommend the first and document it. If rename persistence is required, settle the alternative identity before designing storage.

## Q2 — Unpause behavior

### Pick, reason and cost

Recommend unpause only clears the persisted pause. It makes later automatic events eligible again and does not invoke next or synthesize an event. An operator who wants immediate progress runs manual `next` or `next --all` separately. Cost: if no new event arrives, a closed seat or deferred cleanup can remain pending until that manual pass or startup resume. Print that fact with the command result.

### Rejected options

- Clear and sweep the repository: convenient but can allocate unrelated unstarted leaves and couples a successful control change to dispatch failure.
- Clear and resume allocated work only: avoids some new work, but --resume currently covers all registered repos and completion can start dependents. A repo-scoped resume action would add scheduling behavior beyond the control change.
- Replay missed events: stores an unnecessary event backlog. Existing state-based next passes can catch up without recreating old event order.

### Evidence

- Operator tier: `forks/boundary.md` Taken freezes cleanup until the first pass after unpause. It does not require unpause itself to be that pass.
- Better-than-training: `plugin/herdr-plugin.toml:10` provides startup resume and `plugin/herdr-plugin.toml:13` onward provides future events. `src/akrogon.ts:84` routes --resume; `src/next.ts:1272` sweeps allocations across registered repos, with dependent cascades from completion.
- Better-than-training, primary API docs: https://python.temporal.io/temporalio.client.ScheduleHandle.html describes unpause and immediate trigger as separate methods. This supports separate control and immediate-dispatch actions. Temporal's scheduled timing semantics do not prove Akrogon will receive another event.

### Pitfalls and removal

Do not promise immediate catch-up. Verify unpause performs no Herdr allocation/prompt/cleanup itself, preserves other repos, and permits the next ordinary automatic pass. A repeated unpause must not trigger extra work. State clearing success should stand independently of a later next failure.

### Missing question

Does the operator expect deferred cleanup immediately on unpause or only on a later pass? The recommendation needs explicit agreement because freeze-all can leave completed tabs visible.

## Q3 — Status visibility

### Pick, reason and cost

Recommend a repo-level line such as `Automatic dispatch: paused` next to each paused repo heading, including empty repos and status --charts. Add the same repo-control indication to targeted leaf status. Display the repo control without changing leaf phases, dependency blockers, merge queue order or capacity counts. Cost: a small addition to both status output paths. Active repos can retain current output.

### Rejected options

- Label every leaf phase “paused”: incorrectly hides the phase and suggests running agents have stopped.
- Put pause among dependency blockers: incorrectly suggests manual next cannot run and can distort eligibility.
- Show pause only on the command result or config output: the operator can forget it later, especially after restart.
- Add new columns or a separate listing command: unnecessary for this one repo-level fact.

### Evidence

- Better-than-training: `src/status.ts:326` has separate targeted status output ending at :350. `src/status.ts:353` scopes scans to the current repo or all registered repos, and `src/status.ts:379` prints repo headings before chart/leaf/empty-repo output. Place visibility at these existing surfaces.
- Better-than-training, outside primary docs: Temporal's ScheduleHandle.describe at https://python.temporal.io/temporalio.client.ScheduleHandle.html exposes schedule state separately from executions. Argo CD's automation-enabled flag is separate from application synchronization state in https://github.com/argoproj/argo-cd/blob/master/docs/user-guide/auto_sync.md. These support separate control and work-state reporting.

### Pitfalls and removal

Test targeted, multi-repo, empty-repo and --charts status, including plain non-TTY output. Preserve the actual phase and existing failure/readiness information. A paused repo with running seats should still show both facts. Invalid pause state must surface its error rather than print an apparently active repo.

### Missing question

Should status print active/paused for every repo or annotate only paused repos? Recommend annotate paused only to keep normal output compact.

## Research limits

Practitioner-first searches included `site.astronomer.io pause unpause dag maintenance resume catchup` and `site.temporal.io schedule pause unpause trigger CLI`. Astronomer's support recipe https://support.astronomer.io/hc/en-us/articles/5826491510931-Airflow-How-To-Programmatically-Pause-Unpause-DAGs (Ryan, updated 2025-05-16) demonstrates explicit per-DAG state changes, but gives no stronger case-study evidence for Akrogon's storage identity or unpause effects. Primary documentation is the strongest directly applicable outside evidence used here. No external service was mutated and no recommendation is treated as an operator answer.
