# union-rollout, slot A round

Q1 recommended 1a: `learnings/LESSONS.md merge=union` in each repo's tracked `.gitattributes`, `akrogon init` appends it idempotently like the .gitignore entries (src/init.ts:50-59). 1b one file per active lesson (GitLab 2018 changelog approach). 1c gacp resolves the conflict itself (sync src/sync.ts:122 and merge seat rebase still break).
Evidence: scratch test git 2.55.0 2026-09-29, tracked union attribute rebased cleanly keeping both lines, control conflicted. git-scm gitattributes union warning (random order). Two writers: merged leaf branches (framework b1ea092e6) and main checkout gacp commits.
Pitfall: delete-next-to-add can resurrect a pruned line.

Q2 recommended 2a: leave issues/log.jsonl out. Single writer logMove at main checkout (src/log.ts:17), leaf branches cannot carry issues/ (src/phase.ts:257-263), framework's 57 log commits in 30 days all from main checkout.

Q3 recommended 3a: operator one-command step per repo appending the line to .gitattributes, committing only that file, pushing. 8 repos lack it (akrogon, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne, lingua-relay). Leaf changes init, its tests, skills/init-akrogon/SKILL.md:76 and docs/guide/setup.md:31. 3b rerun init (rewrites issues/config.yaml from schema). 3c preflight gate.
