# Round 1: discovery, review, repair, init

## Question

### Q1 · How does the agent know which docs a change touches?
Right now nobody writes it down. The plan lists files to read, but not docs to update, so the implementer has to remember at the end.
- A: the planning agent adds one line per affected doc, agent and human, found from the index and README; implement treats them as tasks; check verifies them against the diff.
- B: a config list of doc paths.

### Q2 · What does the reviewer check?
Today's rule: check the paths in any AREA.md in the diff, open nothing else. An untouched doc is never opened.
- A: the reviewer starts from what the change did, opens the page describing that behavior even when unchanged, files Fix for a wrong claim or dead path, or states in one line that no documented behavior changed.
- B: leave the reviewer alone.

### Q3 · Fix the stale docs we found now?
- A: two small leaves, pi-extensions index and mdcny index. akrogon rows go with the guide work.
- B: ship the rule, leave the entries.

### Q4 · Should init refuse a repo with no grounding choice?
Boulevard has no agent docs because the proposal left the field out and the command filled in `none`.
- A: remove the silent default; init demands an index path or an explicit `none`.
- B: keep the default, fix boulevard by hand.

### Carries
- Locks: no watchers or extra programs; leaf branches carry code only; least complex solution; skills are the lever unless a fork says otherwise.
- Related: slots/map-merged.md, slots/q4-challenge-B.md.

## Findings
Research tier better-than-training for all four: inspected skills/implement-issue/SKILL.md:27, skills/check-issue/SKILL.md:35, skills/plan-issue/SKILL.md:25, skills/init-issues/SKILL.md:16,56-60,75-77, src/config.ts:35-45, src/init.ts:18-50, merge windows in six registered repos. Full evidence in INTAKE.md and slots/.

(both) Q1-A and Q2-A: the hole is the review blind spot; the config-list alternative (B's) names docs but not the sentence that went stale.
(both) Q3-A.
(B, taken by A) Q4 reshaped after the operator's answer: the command cannot draw the map without duplicating the skill's judgment; a mechanically created docs/ tree is an empty shell (mdcny's three-line index shows it). One mapper (the init-issues skill, made mandatory), one narrow validator (`akrogon init` refuses a declared index that is not a readable non-empty regular file before any write or registration), explicit `none` only. An existence check alone does not cover the `none` case, so the default removal is part of the answer. B's rebuttal on the merged map: none.
(B) Token cost: 3-8k extra input tokens per no-debate leaf, 7-15k with debate. Estimate of added context, not billing.

## Taken
Operator, 2026-09-19: "1a | 2a | 3a | 4 - the init command must establish the docs structure if it doesn't exist. Akrogon attaches to the repo by creating the docs/, the reference-index file and mapping out AREA.md files. Otherwise it can't work efficiently. Challenge me and ask slot B if this is good | Question before we continue: are these changes gonna cost us more tokens? If yes, on average how much, and is it worth it?"

Operator, 2026-09-19, after the Q4 challenge: "4a"

- Q1: A. Reason: three sentences in three skills, no config, no code. Foreclosed: config doc list.
- Q2: A. Reason: closes the review blind spot. Foreclosed: implementer-only wording.
- Q3: A. Reason: dead entries mislead agents now. Foreclosed: deferring.
- Q4: A in the reshaped form. The init-issues skill must produce the map (reuse or create a top index linking real entry points, AREA files only where one index line is not enough, verify targets, put the index path in the proposal) before reporting setup complete. `akrogon init` refuses a declared index that is not a readable non-empty regular file, before writing config, scaffolding or registering, naming the path and pointing to init-issues. `.default('none')` is removed so `none` is only ever explicit. Boulevard is re-grounded by the operator running init-issues again. Foreclosed: the command creating docs/, the index or AREA files itself; a recursive mandatory AREA inventory; a new config key; automatic repair of consumer docs; rejecting existing explicit `none` configs.
