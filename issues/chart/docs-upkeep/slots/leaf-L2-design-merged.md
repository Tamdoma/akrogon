# Design: index-repair

## Binding decisions, verbatim

Round 1, Q1 (taken 2026-09-19, operator "1a"): When the planning agent writes the plan, it adds one line per affected doc, agent and human, found by reading the index and README. The implementer treats those lines as tasks. The reviewer checks them against the diff. Reason: three sentences in three skills, no config, no code. Foreclosed: a config list of doc paths.

Round 1, Q2 (taken 2026-09-19, operator "2a"): The reviewer starts from what the code change did, opens the doc page that describes that behavior even if it wasn't changed, and files a Fix if a claim is now wrong or a path is dead. If nothing documented changed, the report says so in one line. The "open no area file outside that diff" restriction is revised. Foreclosed: implementer-only wording.

Round 1, Q3 (taken 2026-09-19, operator "3a"): Two small leaves, one in pi-extensions and one in mdcny, each fixing its own index. Foreclosed: deferring the repair.

Round 1, Q4 (operator 2026-09-19: "4 - the init command must establish the docs structure if it doesn't exist. Akrogon attaches to the repo by creating the docs/, the reference-index file and mapping out AREA.md files. Otherwise it can't work efficiently. Challenge me and ask slot B if this is good", then after the challenge "4a"): The init-issues skill must produce the map (reuse or create a top index linking real entry points, AREA files only where one index line is not enough, verify targets, put the index path in the proposal) before reporting setup complete. `akrogon init` refuses a declared index that is not a readable non-empty regular file, before writing config, scaffolding or registering, naming the path and pointing to init-issues. `.default('none')` is removed so `none` is only ever explicit. Boulevard is re-grounded by the operator running init-issues again. Foreclosed: the command creating docs/, the index or AREA files itself; a recursive mandatory AREA inventory; a new config key; automatic repair of consumer docs; rejecting existing explicit `none` configs.

Session locks: no watchers, hooks or programs that edit docs; leaf branches carry code only, never `issues/`; `.env` and `.env.*` are never opened, printed or written by a tool.

Applicable here: Q3 in full. Q1, Q2 and Q4 are excluded; they change akrogon's skills and command and are owned by the akrogon leaf `docs-impact-rule`.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no auth, secrets or user-visible flow. The verification command is the missing-path check in criterion 1, run from the repo root. Negative case: the report shows the check failing before the edit and passing after. No env values.

## Leaf architecture

Owned surface: `docs/reference-index.md` only.

Method: extract every path from the index (table cells in backticks and markdown link targets); (B) classify each as literal or glob; test literals with `[ -e "$path" ]` and globs with `compgen -G` from the leaf worktree root; for each unresolved one decide rename, deletion or generated artifact from git history and `git check-ignore` before editing the row.

Exclusions: no AREA.md creation, no reorganizing the index, no edits to extension code or docs beyond the index, no new tooling.

Dependencies: none.
