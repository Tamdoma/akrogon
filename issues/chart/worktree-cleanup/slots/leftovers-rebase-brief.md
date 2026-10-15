# Brief for slot B: leftovers rebased onto origin/main

You are slot B. Read-only; write only your return file.

You reviewed the `akrogon leftovers` change earlier (your last return: "No findings."). It is now applied onto origin/main (8b8515f), which added host-wide kept units: `reconcileHost` writes `<globalHome>/reconcile-host.json` and plain `akrogon status` printed them as `Kept by last cleanup:` lines.

New in this diff, on top of what you reviewed:
1. Plain status no longer prints host kept lines. `akrogon leftovers` prints them in a final `systemd units` block, grouped by reason, hiding 'own slice', 'live run record', 'live tab', 'pane list unavailable'. `akrogon status <slug>` still prints `Kept:` host lines.
2. `readKept` and `readHostKept` share one strict reader (ENOENT empty, other errors thrown, invalid JSON named).
3. Conflict resolution in README.md and src/akrogon.ts usage string (kept upstream's slice sentence and `log`).
4. docs/guide/next.md names `akrogon leftovers`.

Diff vs origin/main: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/slots/leftovers-rebase.diff
Worktree: /home/ivan/.claude/jobs/6a0d8d81/tmp/lw (branch leftovers-command). Full suite: 871 pass, 1 fail (tests/leaf-slices.test.ts "a shell run admitted while another slice stops protects its own slice"), which fails the same on clean origin/main here.

Task: check-issue Fix/Nit bar. Return Fixes and Nits with file:line evidence, or "No findings." Check especially: are any hidden unit reasons not self-clearing; does a stricter readHostKept now break a reconcile or status path that read it leniently.

Return: /home/ivan/Work/infra/akrogon/issues/chart/worktree-cleanup/slots/leftovers-rebase-B.md. Write to a temp file in that folder first, then rename to the exact path.
