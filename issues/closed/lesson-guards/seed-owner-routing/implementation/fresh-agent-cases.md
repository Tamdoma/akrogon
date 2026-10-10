# Fresh-agent six-case proof — run record

Proves plan criterion 5 and the decision rules of criteria 1–4: a fresh agent that did not write the skill decided all six cases from the shipped text alone, posted nothing, committed nothing.

## Subagent identity

- Harness: `pi` 1.1.0, non-interactive (`pi -p`), fresh process, own ephemeral session.
- Model: `openai-codex/gpt-5.6-sol`, thinking level `high` (from session `model_change` event).
- Cwd: `/home/ivan/Work/infra/tamdoma/framework` (neutral consumer repo).
- Tool surface: built-in `read` + `bash`; `edit` and `write` disabled via `-xt edit,write`. Skills, extensions, MCP and context files disabled (`--no-skills --no-extensions --no-mcp --no-context-files`).
- Inputs: only the shipped SKILL.md path, the files it references, shell commands, and the six case descriptions. A hard rule in its task barred reading anything under `issues/` (plan/brief/design/state); the session log shows it read only SKILL.md from that tree.
- Observed tool calls: 22 reads, 33 bash. Post-run scan of the session: 0 mutating calls (no `gh issue create/edit/delete/comment/close`, no git writes, no file writes).

## Task text given (verbatim)

> You are an agent executing the "seed-issue" skill end to end for six test cases. This is a routing-and-decision exercise.
>
> First read exactly this file, the skill you must follow:
> /home/ivan/Work/infra/akrogon/issues/worktrees/seed-owner-routing/skills/seed-issue/SKILL.md
> Also read the files its procedure directs you to read when a case calls for it (repo akrogon.yaml files, files a report names).
>
> HARD RULES (violating any one voids the exercise):
> 1. NEVER run "gh issue create", "gh issue edit", "gh issue delete", "gh issue comment", "gh issue close", or any command that posts to or mutates GitHub. You may and should run read-only lookups exactly as the skill specifies: "gh issue list" and "gh issue view". Never run "gh api" with a non-GET request.
> 2. NEVER modify, create, delete, or commit any file. Read-only filesystem commands only (read tool, ls, test -e/-f, readlink, command -v, git remote get-url, git rev-parse, git -C ... rev-parse). If your tools include edit or write, do not use them.
> 3. Do NOT read any file under /home/ivan/Work/infra/akrogon/issues/ . That tree contains planning artifacts that would taint your independent decision. The only permitted file under that repo outside issues/ is the SKILL.md above and files the skill sends you to.
> 4. Where the skill's procedure would post an issue, STOP before the post and report the decision instead. Where the skill requires a visible stop, emit that stop (path + reason) as your verdict.
> 5. Treat each case as an independent run. For cases whose consumer repo is not your cwd, use absolute paths and "git -C <dir>" so the checks resolve against that repo.
>
> For each case output a block:
> - CASE <letter> VERDICT: <destination repo "owner/repo" | "STOP: <visible stop>" | "NO POST, existing report <url>">
> - REASON: 1-3 sentences citing the specific skill text that forced this outcome.
> - COMMANDS: every command you actually ran for the case with its exit status or key output.
> - FINAL LINES: the skill's final two lines (Last operation / Next) as they would print.
>
> Environment facts you may verify but must not take on faith: your cwd is /home/ivan/Work/infra/tamdoma/framework (consumer repo, origin https://github.com/Tamdoma/tamdoma-framework.git, root akrogon.yaml). The "akrogon" command resolves under /home/ivan/.local/bin/akrogon. Run every resolution step the skill requires; do not guess.
>
> === CASES ===
>
> CASE A — Consumer repo: /home/ivan/Work/infra/tamdoma/framework. The seed-issue report names skills/check-issue/SKILL.md as the failure's location. Determine the destination repo per the skill's Destination section.
>
> CASE B — Same consumer repo. The report names .claude/hooks/tests/blueprint-call-refs.test.ts as the failure's location.
>
> CASE C — Same consumer repo. The report names package.json as the failure's location.
>
> CASE D — Consumer repo: /home/ivan/Work/infra/akrogon (the repository containing the skill source; origin https://github.com/Tamdoma/akrogon.git, no root akrogon.yaml). The report names src/next.ts as the failure's location.
>
> CASE E — Same as CASE A, but simulate "akrogon" being absent from PATH by re-running the skill's akrogon-resolution command under a restricted PATH, e.g. PATH=/usr/bin:/bin command -v akrogon. Then apply whatever the skill says happens when the owner test was reached and command -v akrogon prints nothing. Also answer this companion question with the skill text cited: a consumer-code report whose named paths all exist under the consumer root never reaches the owner test — does a missing akrogon change that report's destination?
>
> CASE F — Consumer repo: /home/ivan/Work/infra/tamdoma/framework. A reporter supplies this seed-issue report: "Lesson seeds printed by learn-issues never become guards: no pass reads learnings/LESSONS.md, learn-issues only prints a seed line, and the same failure classes keep recurring at merge." Location: skills/learn-issues/SKILL.md (the seed printer) and skills/check-issue/SKILL.md (does not accept lessons as review input). The reporter also supplies this link as related context: https://github.com/Tamdoma/akrogon/issues/73 . Follow the skill in order: inspect named paths, resolve the destination repo, run BOTH read-only duplicate lookups the skill prescribes against the routed repo (author-recent list AND the keyword search; pick a reasonable 2-3 word keyword from the failure and a sane --limit), and view the supplied link. Then apply the covering-report judgment: does a found report cover the same failure by mechanism/defect? Decide and emit the final two lines.
>
> When all six blocks are written, stop.

## Case A — akrogon-owned path absent from consumer

- Input: consumer `/home/ivan/Work/infra/tamdoma/framework`; report names `skills/check-issue/SKILL.md`.
- Expected: Tamdoma/akrogon.
- Subagent verdict: **Tamdoma/akrogon**. Reason: absent consumer path is akrogon-owned when it exists under the resolved akrogon root; akrogon destination falls back to that root's origin when its `akrogon.yaml` is absent.
- Observed evidence: `rev-parse --show-toplevel` → framework; `akrogon.yaml` read → `issues_repo: Tamdoma/tamdoma-framework`; `test -e framework/skills/check-issue/SKILL.md` → exit 1; `command -v akrogon` → `/home/ivan/.local/bin/akrogon`; `readlink -f` → `src/akrogon.ts`; akrogon git root → `/home/ivan/Work/infra/akrogon`; `test -e akrogon/skills/check-issue/SKILL.md` → exit 0; `test -f akrogon/akrogon.yaml` → exit 1; `git remote get-url origin` → `https://github.com/Tamdoma/akrogon.git`.
- Assessment: **match**.

## Case B — consumer-resident test path

- Input: same consumer; report names `.claude/hooks/tests/blueprint-call-refs.test.ts`.
- Expected: Tamdoma/tamdoma-framework.
- Subagent verdict: **Tamdoma/tamdoma-framework**. Reason: all named paths exist relative to the consumer root so the owner test is never reached; consumer `akrogon.yaml` `issues_repo` controls.
- Observed evidence: `rev-parse` → framework; `test -e .../blueprint-call-refs.test.ts` → exit 0; `akrogon.yaml` read → `issues_repo: Tamdoma/tamdoma-framework`. (Also read the named file and its one-hop callers per the skill's Report section.)
- Assessment: **match**.

## Case C — consumer-resident manifest

- Input: same consumer; report names `package.json`.
- Expected: Tamdoma/tamdoma-framework.
- Subagent verdict: **Tamdoma/tamdoma-framework**. Reason: `package.json` exists under the consumer root; owner test never reached; `issues_repo` controls.
- Observed evidence: `test -e framework/package.json` → exit 0; `akrogon.yaml` → `issues_repo: Tamdoma/tamdoma-framework`.
- Assessment: **match**.

## Case D — akrogon repo is itself the consumer

- Input: consumer `/home/ivan/Work/infra/akrogon`; report names `src/next.ts`.
- Expected: Tamdoma/akrogon (consumer origin fallback).
- Subagent verdict: **Tamdoma/akrogon**. Reason: `src/next.ts` exists in the consumer repo so no owner test; with root `akrogon.yaml` absent the destination derives from GitHub origin.
- Observed evidence: `git -C .../akrogon rev-parse --show-toplevel` → akrogon; `test -e akrogon/src/next.ts` → exit 0; `test -f akrogon/akrogon.yaml` → exit 1; `git remote get-url origin` → `https://github.com/Tamdoma/akrogon.git`.
- Assessment: **match**.

## Case E — akrogon command absent (PATH simulation)

- Input: case A again, but `PATH=/usr/bin:/bin command -v akrogon` → exit 1, no output.
- Expected: visible stop naming path and reason, no post; companion: missing akrogon does not affect consumer-resident reports.
- Subagent verdict: **STOP** — `/home/ivan/Work/infra/tamdoma/framework/skills/check-issue/SKILL.md` reached the owner test, but `command -v akrogon` returned no path under the restricted PATH. Reason: the skill requires a visible stop there with no fallback to the consumer destination.
- Companion answer (cited correctly): a report whose named paths all exist under the consumer root never reaches the owner test, so missing `akrogon` does not change its consumer destination.
- Final lines emitted: `Last operation: failure: ... command -v akrogon returned no path` / `Next: none stopped with reason: the akrogon root could not be established`.
- Assessment: **match**.

## Case F — covering report dedupe (#73)

- Input: same consumer; report "lesson seeds printed by learn-issues never become guards", locations `skills/learn-issues/SKILL.md` and `skills/check-issue/SKILL.md`; reporter-supplied link `https://github.com/Tamdoma/akrogon/issues/73`.
- Expected: routes to Tamdoma/akrogon; dedupe finds #73 covering the same mechanism → no post, prints #73's URL.
- Subagent verdict: **NO POST, existing report https://github.com/Tamdoma/akrogon/issues/73**. Reason: both named paths absent from consumer but present under akrogon root → routed to Tamdoma/akrogon; skill posts nothing when a found report covers the same mechanism/defect, and #73 describes the same excluded lesson input, manual seed-only outlet, recurring failures.
- Observed evidence: `test -e` both paths under framework → exit 1; under akrogon → exit 0; akrogon resolution chain rerun; `date -u -d '2 days ago' +%F` → 2026-10-08; `gh issue list -R Tamdoma/akrogon --state all --author @me --search "created:>=2026-10-08" --limit 20 --json number,title,state,body` → exit 0, included #73; `gh issue list -R Tamdoma/akrogon --state all --search "lesson guards" --limit 10` → exit 0, returned #73; `gh issue view 73 -R Tamdoma/akrogon --json number,title,state,body` → exit 0.
- Final lines emitted: `Last operation: https://github.com/Tamdoma/akrogon/issues/73` / `Next: none existing report found`.
- Assessment: **match**.

## Outcome

Six of six verdicts match expected. Nothing was posted to GitHub, nothing committed, no file mutated by the subagent (session scan: 0 mutating tool calls out of 55). The fresh agent's decisions traced to the shipped skill text alone, which is the criterion-5 proof.
