# Intake: lessons-merge-conflicts

## Scope
Stop `learnings/LESSONS.md` from blocking rebases in registered repos when the main checkout and origin/main both add lesson lines. Destination: akrogon (init writes the rule) plus the existing registered repos.

## Provenance
- GitHub: Tamdoma/akrogon#40
- Operator: 2026-09-29 "look at the new issue that was pulled. Let's chart it if we haven't already."

## Source: Tamdoma/akrogon#40
# gacp rebase conflicts on learnings/LESSONS.md when local and remote both add lessons

Source: Tamdoma/akrogon#40
URL: https://github.com/Tamdoma/akrogon/issues/40

Unverified intake.

## Observation
`gacp` runs `git pull --rebase --autostash origin main`. It stopped with a content conflict in `learnings/LESSONS.md` because the local commit and origin/main both added new lesson lines at the top of the file. `gacp` aborted the rebase and left the checkout unchanged.

Seen 2026-09-29 in the framework repo: local commit `01ae5176a` ("add issues") conflicted with origin/main on `learnings/LESSONS.md`. It failed twice.

Supplied context:
- Framework added `learnings/LESSONS.md merge=union` to `.gitattributes`. The first retry still conflicted: the rebase replays onto origin/main, which did not have the line yet.
- Adding the same line to `.git/info/attributes` made the next `gacp` rebase clean. All 4 new lessons from both sides were kept. It pushed as `2c2e1360f..5376311de`.
- The other 7 registered repos have no union rule: akrogon, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne.
- `akrogon init` owns the `learnings/LESSONS.md` scaffolding and the ignore entries (`skills/init-akrogon/SKILL.md:76`).
- `issues/log.jsonl` is also appended to by many sessions and may conflict the same way. Not observed yet.

## Location
The `gacp` function (`docs/guide/gacp.md`, `~/.local/bin/gacp`) in registered consumer repos. The file was `learnings/LESSONS.md`.

## Reproduction
1. In a registered repo, commit a new lesson line at the top of `learnings/LESSONS.md`.
2. Before pulling, have origin/main receive a different lesson line at the top of the same file.
3. Run `gacp`.

Seen twice in a row on 2026-09-29 in framework. Likely whenever parallel leaves or sessions write lessons.

## Expected behavior
`gacp` keeps both sides' lesson lines and pushes without a manual conflict resolution.

## Urgency
It blocks `gacp` until the conflict is resolved by hand. Workaround: in each repo, add `learnings/LESSONS.md merge=union` to both `.gitattributes` and `.git/info/attributes`, then rerun `gacp`. Only framework has this so far.

## Source: operator 2026-09-29
look at the new issue that was pulled. Let's chart it if we haven't already.

## Agent findings
- F1 Two writers reach origin/main's LESSONS.md: merged leaf branches (framework `b1ea092e6` "contact-page b: lesson ...") and the main checkout's gacp commits ("add issues"). implement-issue, plan-issue, chart-issues and merge-issue all write lesson lines (skills/*/SKILL.md).
- F2 All three rebase paths hit the same conflict: gacp (`~/.local/bin/gacp`), `akrogon sync` (src/sync.ts:122 `git rebase --autostash`) and the merge seat's rebase (skills/merge-issue/SKILL.md:33).
- F3 Scratch test, git 2.55.0, 2026-09-29: with `L.md merge=union` in a tracked `.gitattributes`, two clones appending different lines rebased cleanly and kept both lines. The same setup without the attribute conflicted. Scratch repos deleted.
- F4 git docs (git-scm.com/docs/gitattributes, read 2026-09-29): union "take[s] lines from both versions ... tends to leave the added lines in the resulting file in random order". `$GIT_DIR/info/attributes` has highest precedence, then the work tree `.gitattributes`. This explains framework's first retry: the replay target lacked the line.
- F5 Only framework has the rule (tracked and in info/attributes). akrogon, pi-extensions, mdcny-ghl-data-pulls, boulevard-automation, clinique-la-roya, lens, Himne and lingua-relay lack it. lingua-relay is registered but not listed in the seed.
- F6 `issues/log.jsonl` is written only by `logMove` at the main checkout (src/log.ts:17), and leaf branches cannot carry `issues/` diffs (src/phase.ts:257-263). Framework's 57 log commits in 30 days are all main-checkout commits. No second writer exists today.
- F7 `akrogon init` appends missing `.gitignore` lines idempotently (src/init.ts:50-59). It writes no `.gitattributes`. skills/init-akrogon/SKILL.md:76 and docs/guide/setup.md:31 describe what init writes.
- F8 Practitioner: GitLab (Robert Speicher, "Solving GitLab's changelog conflict crisis", 2018) removed CHANGELOG conflicts by making each entry its own file compiled at release. It does not discuss merge=union.
