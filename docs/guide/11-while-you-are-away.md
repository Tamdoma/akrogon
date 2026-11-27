# While you are away

Leaves keep moving through `akrogon-listener.service` even when you step away, without any extra setup. If you want an agent checking in on `client-portal` overnight to nudge waiting work, retry transient failures, catch looping seats, and diagnose deeper failures while you sleep, start the optional [watch-issues](../../skills/watch-issues/SKILL.md) watcher in your `w-client-portal` tab.

You start the watch and you stop it. It works the same across all four supported harnesses: **`claude`**, **`codex`**, **`pi`**, and **`agy`**.

## Starting the watch in `w-client-portal`

Open your agent CLI (`claude`, `codex`, `pi`, or `agy`) in an hc terminal inside `w-client-portal` (in the same hc session that holds `client-portal`'s space, passing the registered repository root such as `~/code/client-portal`) and send:

```text
watch-issues ~/code/client-portal
```

In `claude`, you can also use the slash alias `/watch-issues ~/code/client-portal`.

Starting the watch does two things right away:

1. Launches one timer terminal named `<prefix>-watch` in the same hc session (for example, **`cp-watch`** when `client-portal` uses prefix `cp` in `~/.akrogon/config.yaml`). Only one watch runs per repository; if one is already live, it reports that timer and starts no second one.
2. Runs one check immediately, then `cp-watch` sends a `watch-issues tick` line to your watching agent every **20 minutes**.

Two timing behaviors are worth knowing up front:

- **Busy coalescing**: If the watcher is still busy handling a check or a consult case when the next 20-minute mark arrives, `cp-watch` keeps only the latest unsent tick. As soon as the watcher goes idle, that one tick runs a single check instead of piling up a backlog.
- **Typing while a tick is due**: Because hc has no guarded send to a watcher showing `done`, a prompt you type into `w-client-portal` right when a tick goes out can receive the tick alongside it. On **`claude`** and **`agy`**, the check runs inside that turn; on **`codex`**, your typed prompt's task is dropped and must be retyped.

## What each check does

Every 20 minutes (and once on start), the watcher runs one structured check over every open leaf in `client-portal`:

1. **Observe repository state once**: Runs `observe.ts` (`bun <skill-folder>/scripts/observe.ts <root>`) as its sole read of pause state and open leaves (`session`, `paused=true|false`, each leaf's phase, attempt counts, `blocked` list, seat addresses and statuses, busy durations, active transcript log paths, and any failure record). If `client-portal` is paused with `akrogon pause` (`paused=true`) or the read fails, the check reports that and stops without touching any leaf.
2. **Start unblocked waiting leaves**: If an open leaf has an unfinished required seat that is idle or absent and its prerequisites are merged, the check starts it with `akrogon next <slug>` (or `akrogon next --all` from `<root>` when several unblocked leaves wait). While `scheduled-email` is still waiting on unmerged `csv-export`, the check leaves `scheduled-email` alone and reports it as waiting. If every leaf of an issue still under `issues/open/` is already `merged`, it runs `akrogon next <slug>` once to finish completion and re-observes.
3. **Retry recoverable failures (up to two unproductive cycles)**: When a leaf is in `failed` for a non-human-prerequisite reason and every required seat of `failure.phase` is idle or absent, the check reads `issues/log.jsonl` for that slug and recovers it with `akrogon phase <slug> <failure.phase>` and `akrogon next <slug>`. One `failed -> P` recovery followed directly by `P -> failed` counts as one unproductive cycle. After **two consecutive unproductive retries**, the check stops retrying on its own and opens a consult case instead.
4. **Check busy seats for loops**: For every working seat, the check reads its transcript tail through `log-tail.ts` (falling back to `hc read` if no transcript log is available). A slow command alone is never a reason to interrupt. Only on concrete loop evidence (the same command or edit three or more times with the same result, three or more consecutive errors, or an edit-undo cycle), concrete out-of-brief work, or a hung tool with a fatal error or exited process, the check steps in **at most once per seat per watch**:
   - On **`claude`**, **`pi`**, and **`agy`**, it interrupts the seat (`hc interrupt`), verifies the terminal is idle with an empty input line, and sends one corrective prompt naming the evidence, the brief target, and the next step.
   - On **`codex`**, the seat is **notify-only** (interrupting a backgrounded command leaves codex working), so the watch notifies you instead of steering.
   - If the same seat loops again on a later check, the watch notifies you rather than stopping it a second time.
5. **Open a consult case for deeper failures**: When a leaf hits a consult trigger (such as `scheduled-email` failing twice in a row on a flaky integration test or a broken commit on `main`, failing on a human prerequisite, having an `unknown` failure record, or having a missing or malformed `issues/log.jsonl`), the watch checks whether an identical signature already closed a case (`consults.ts match`). If clear, it opens one case folder under `~/.akrogon/watch/client-portal/consults/<case-id>` (outside the watched repository) and launches one peer consultant terminal (`cp-watch-consult`) using the machine **`slots.consultant`** recipe from `~/.akrogon/config.yaml` (`akrogon seat --watch-consultant`). The watch and consultant exchange numbered turn files (`turn-<n>-watch.md` and `turn-<n>-consultant.md`) via `hc send`. When the consultant proves a permitted fix (such as repairing `main` in a detached case worktree, proving it with `akrogon verify --holder <case>`, and pushing fast-forward, or fixing a clean idle leaf worktree inside its decided brief and design), the watch records agreement, closes the consultant, re-observes, and resumes the leaf (`check.fix` if `failure.phase` was `merge`, `check.repair`, or `check.review`; otherwise `failure.phase`).
6. **Send desktop notices and summarize**: Writes a notice via `akrogon notice` whenever a leaf needs you (or when a consult pushes to `main` or moves a leaf), which herdr-app displays as a desktop notification banner (adding `--attention` only for stop-list items that need a human). The check ends with a short reply (at most five lines) in `w-client-portal` stating what it saw, what it did, and any case folder path.

## What keeps moving vs what waits for you

Leaving `watch-issues` running overnight lets `client-portal` handle routine interruptions without waking you, while keeping human-only decisions strictly yours.

**What keeps moving without you:**

- Starting `scheduled-email` (or other unblocked leaves) once `csv-export` merges or seats go idle.
- Retrying transient non-human failures up to two consecutive unproductive cycles when seats are idle.
- Detecting a looping `claude`, `pi`, or `agy` seat and giving it one corrective steer.
- Consulting with `slots.consultant` on deeper failures, landing verified fast-forward base repairs or clean idle leaf-local fixes within locked decisions, and resuming the leaf automatically.

**What still waits for you (the stop list):**

When a failure or consult case hits any item below, the watcher stops acting on that leaf, leaves it in `failed`, records its findings in the case folder, and sends an attention toast naming the case and the blocker:

- Missing keys, credentials, or logins (for example, a `POSTMARK_API_KEY` that Postmark rejects as revoked).
- Grants or permissions (such as approving a live staging email send or a wider API scope).
- Any change to an operator decision or lock (locked `brief.md`, `design.md`, or seed decisions).
- Host tooling installs or downgrades.
- Any force push or git history rewrite.
- Any fix that would change what was decided.
- Stopping the watch itself.

**What the watch never does:**

- Never kills an agent process.
- Never kills or removes any hc terminal other than its own verified timer (`cp-watch`) and its own verified consultant (`cp-watch-consult`).
- Never stops the same seat twice in one watch.
- Never uses `hc send --force`, never runs `akrogon phase ... failed`, and never answers a leaf seat's prompts.
- Never opens `.env`, and never edits `state.yaml`, leaf worktrees, or `issues/` directly.

## Stop the watch

Stop the watch from any terminal in the same hc session (in `w-client-portal` or another agent terminal) by sending:

```text
watch-issues stop ~/code/client-portal
```

In `claude`, you can also use `/watch-issues stop ~/code/client-portal`. This stops the timer terminal (`cp-watch`) and closes any active consultant terminal (`cp-watch-consult`).

Keep these automatic stop rules and harness limits in mind:

- **Automatic stops**: The watch also ends on its own when the watching agent exits, when its terminal finishes or is reused (foreground or transcript changes), or when **`claude` or `agy`** shows a **`/clear`** reset. Having no open leaves does **not** end the watch; it stays live until stopped.
- **`/clear` vs `/new`**: While `claude` and `agy` `/clear` resets stop the watch cleanly, **`codex` and `pi` `/new`** may leave the watch running into the new conversation. The first tick in the new conversation detects that it is the first prompt and attempts to stop the watch automatically (though sending another prompt before that first tick spends that check, leaving the watch running until you send `watch-issues stop`).
- **Compaction keeps the watch alive**: A conversation compaction summary arriving before a tick is not treated as a reset; the watch stays active across compactions overnight.
- **Exiting a shell-launched agent**: If you exit a shell-launched agent right as a tick goes out (with or without a held draft in hc), the tick text can land in the underlying shell or a program you just started there. If you start a replacement agent running `watch-issues`, it refuses the stale tick because the tick's process ID (`pid=`) no longer matches.

For full watcher rules and machine consultant configuration, see [watch-issues](../../skills/watch-issues/SKILL.md), [Settings](../reference/config.md), and [Commands](../reference/commands.md).

Previous: [Merging](10-merging.md) · Next: [When work stops](12-when-work-stops.md)
