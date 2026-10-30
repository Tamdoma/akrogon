# Opening map brief, slot B

You are consultant slot B for a chart door (slot A) in the akrogon repo at /home/ivan/Work/infra/akrogon. Work independently. Do not edit any file except your return file. Make no commits.

## Task

Write an independent territory map for the intake below: the material forks (decisions that change the outcome), questions a practitioner would ask, and pitfalls over the work's lifetime, including what each option could break or invite later and not only now. Ground every claim in inspected surfaces (file and function, ledger lines, journal output) or say it is unverified. Proportional to the work: short.

Investigate the suspected cause yourself. Useful checks: which caller kills `akrogon verify` about 2 minutes in (harness shell-tool timeouts of claude, codex and pi seats; seat transcripts near the stopped receipts' start times), whether the `akrogon-run-*` systemd scopes of the killed run outlived it (journalctl --user), what a SIGTERM/SIGHUP/SIGKILL does to `runOnce` and its checkout, and what already exists to catch it (reconcile sweeps, receipt reuse).

## Intake

The mirrored report, verbatim: /home/ivan/Work/infra/akrogon/issues/seeds/119-akrogon-verify-leaves-25-receipts.md (GitHub Tamdoma/akrogon#119).

## Live surface paths

- /home/ivan/Work/infra/akrogon/src/verify.ts (`runOnce`, receipt append and `finally` rewrite)
- /home/ivan/Work/infra/akrogon/src/run-check.ts (`checkedRun`, systemd scope)
- /home/ivan/Work/infra/akrogon/src/reconcile.ts (verify-* store leftovers, failed run units)
- /home/ivan/Work/infra/akrogon/src/AREA.md (sections on verify and run-check)
- /home/ivan/Work/infra/akrogon/issues/verify-runs.jsonl, /home/ivan/Work/infra/akrogon/issues/timings.jsonl
- /home/ivan/Work/infra/akrogon/skills/ (the skills seats follow when they call verify; find which ones call it)
- Harness templates: `akrogon config` `harnesses:` (claude, codex, pi)

## Locks

None yet. Autopilot mode: the door decides forks itself by the operator's values (simplicity, function over form, removing over adding, systems thinking, speed and price).

## Reading rule

Read process text (skills, AREA.md, docs) by named section for the step you answer: locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content that changed since you read it, and content lost to compaction stay readable, and the full source stays allowed when the source is the subject of the work (src/verify.ts and its direct callers are the subject here). Name sections, never line ranges. You choose your own evidence.

## Return

Write your map to exactly: /tmp/claude-1000/-home-ivan-Work-infra-akrogon/c3774c8f-6ba3-47ca-bc6a-407baccb70a9/scratchpad/map/map-B.md

Shape: Cause (what you proved, with evidence and tier, and what stays unproven); Forks (each with options, your pick, reason, cost, what it breaks or invites later); Practitioner questions; Pitfalls (each with what removes it); Proposed split (leaves and dependencies). Write the file last, in one go, when done.
