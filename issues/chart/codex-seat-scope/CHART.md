# Chart: codex-seat-scope

## Destination

A leaf seat whose harness launcher is a bash script (codex through the mise wrapper) starts inside its leaf scope and stays out of the scope's tools/ child, so B seats stop being refused with `seat outside its leaf scope` and leaves stop failing with "seat B was lost 3 times before ending a turn".

Route: direct

## Forks taken

- [signposts](forks/signposts.md): carried from this door session (consultant-recipe), not re-asked. N2 restart, N3 keep (operator)
- [seat-root](forks/seat-root.md): 1a seat pid marker in the shared placement, 2a every leaf seat kind through one `sh` hop (operator)

## Open forks

none

## Fog


## Off route

- Fork-and-wait launchers (a forked bash child execs the harness): a silent residual, not guarded (seat-root Taken).
- Codex-native `shell_environment_policy` delivery (F O4).

## Pending steps

none (done 2026-11-25T16:33:52Z: see Direct attempt main step)

- (done) After the fix is installed (`~/.akrogon/current` holds the landed SHA): list any codex seat sitting in `tools/t-<seat pid>` (F Q-F2), then restart framework h1-from-seo-plan and canonical-list-binding by `akrogon phase <slug> check.review` and `akrogon next <slug>` (N2).

## Mode record

- mode 2026-11-25T15:49:00Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/bc9c88fb-09b5-4721-976d-216e082b60c9.jsonl: manual (operator answers forks; signposts carried from this door session); consultants B t3rz (pi), C t3s0 (agy), D t3s1 (pi), supplied, used as given; reviewer E door-created at the review, recipe codex gpt-6.2-sol high (operator words "Slot e (codex sol 6.2 high) as reviewer"); route: operator words "Manual rooute", read as the direct route, asked again at the handoff review

## Direct attempt

- branch: codex-seat-root
- worktree: /home/ivan/.akrogon/worktrees/akrogon/codex-seat-root
- base: 9a7cf4166ad1ba094f5aef9d16817f26c5181f87
- head: 4325f9ce566c5d8588f84b7a214422e1dffe62a0
- rounds used / fix_rounds: 0 / 12
- push attempts: 1 / 2
- done: red-first tests (27bdd983, 26b5ad9b), fix (4325f9ce), verify green on 4325f9ce (1496 pass), direct-guards passed, pushed 9a7cf416..4325f9ce, deployed (current 4325f9ce at 16:32:15Z)
- not done: none
- trigger: none
- reviewer: E (door-created, codex gpt-6.2-sol high, operator words)
- review files: slots/review-E-1.md (verdict ready, no Fixes or Nits)
- main step: no GitHub source to close; broadcast delivered to DISCORD_WEBHOOK_URL and DISCORD_WEBHOOK_URL_2; census found no codex seat stranded in tools/; N2: framework h1-from-seo-plan, canonical-list-binding, geo-reads-leave-ia-plan, read-pages-from-plan recovered to check.review and dispatched (B seats t3v0, t3v1, t3v2, t3v3), all four codex seats live at their scope roots with their tool shells placed in t- dirs (live confirmation)
- landed SHA: 4325f9ce566c5d8588f84b7a214422e1dffe62a0

Closed 2026-11-25
