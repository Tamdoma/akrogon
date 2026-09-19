# B view: initialization should guarantee a useful map, not manufacture one

**Require the setup workflow to establish useful documentation. Keep the judgment in `init-issues`, and let `akrogon init` validate the declared result before registering it.** Creating a `docs/` directory and empty AREA files mechanically would satisfy the shape without providing the understanding the operator wants.

## What the code actually does

1. **F1 — The command does not currently reject a nonexistent index.** `src/init.ts:18-24` parses the proposal/config, then line 31 writes the repository config. Lines 32-50 create lifecycle scaffolding and register the repo. There is no grounding-index existence check. So “the command only refuses a proposal whose index path does not exist” is a proposed improvement, not today's behavior.
2. **F2 — The skill already owns the intelligent part.** `skills/init-issues/SKILL.md:16` inspects the repository. Lines 56-58 require reusing a suitable index or creating one, linking real entry points, and writing AREA files only for areas needing more explanation. Lines 75-77 separate those writes from command-owned configuration and require verification. Strengthen compliance with that contract rather than implement a second mapper in TypeScript.
3. **F3 — The schema permits a successful setup without a map.** `src/config.ts:35-45` accepts `grounding: none`, accepts an object whose index is optional, and defaults omitted grounding to `none`. Direct initialization without a proposal reaches those defaults (`src/init.ts:18-23`). Boulevard currently has `grounding: none` at `issues/config.yaml:13`. Its successful merged leaves demonstrate that the lifecycle can run without an index. They do not demonstrate efficient agent discovery. The current files alone cannot establish who chose that setting or whether the setup skill was invoked correctly.
4. **F4 — A useful map need not relocate existing docs.** Framework's `docs/reference-index.md:5-9` points into `.claude/skills/`, `.claude/hooks/`, `.claude/workflow/`, `.claude/docs/` and `.claude/guides/`. That is already a valid structure. A root `docs/reference-index.md` can be a thin entrance, but the skill should also reuse an existing suitable top index elsewhere, as its current line 56 permits. AREA files belong beside meaningful areas, not under a mandatory new docs tree.

## Recommended contract

- **Skill:** Before reporting attachment complete, reuse or create a useful top index and map the actual code and operating-document entry points. Create adjacent AREA files only where one index line is insufficient. Verify targets and put the chosen index path in the proposal. Reuse existing conventions and preserve unrelated docs. A successful run must not silently leave grounding absent because the schema allows it.
- **Command:** Add a small preflight before `writeRepoConfig` and every registration/scaffolding mutation. When an index is declared, resolve it against the repo root and require a readable, nonempty regular file. Reject a missing file, directory or empty file with the path and an instruction to complete setup through `init-issues`. This verifies an artifact, not whether its explanations are good. The skill remains responsible for mapping quality and link verification.
- **Exception policy:** Make `grounding: none` a deliberate operator exception, not the silent outcome of an incomplete new setup. Keeping explicit `none` valid is the smallest compatible policy. The skill should use it only when the operator has actually chosen it. If the operator instead wants *all* registrations to require an index, that is a separate compatibility decision: remove the exception and repair Boulevard before enforcing it. Do not silently change the meaning of existing configs.

An existence check alone would **not** prevent Boulevard's `none` case. It would only reject declared-but-missing indexes. That distinction needs to be explicit in the fork. Likewise, requiring a nonempty file cannot prove that a lifecycle-only scaffold describes the product. The data-pulls index (`docs/reference-index.md:3-5`) demonstrates that gap.

I would challenge “the init command must create docs/ and AREA files” on ownership, not the desired outcome. The command cannot decide area boundaries, useful entry points or non-obvious practices without duplicating the skill's judgment. A deterministic skeleton is not a substitute. The least complex arrangement is one mapper, one narrow validator, and an explicit policy for opting out.

This expands the previously proposed skills-only leaf into a small command-validation change if selected. Own `src/init.ts` and the existing initialization test surface in addition to the setup skill, with negative cases for missing/empty/directory index and proof that refusal leaves config/registration unchanged. No generator, recursive mandatory AREA inventory, extra config key, watcher or automatic repair of consumer docs.

## Added token cost of Q1-A and Q2-A

These are estimates of **additional text introduced into context**, not measured provider billing or a measured typical-leaf total. I measured text sizes in this checkout and use roughly four characters per token. Code paths, tables and commands can tokenize more densely.

| Read | Measured size | Approximate input tokens |
| --- | --- | --- |
| Current akrogon README | 5,883 characters / 792 words | 1,500–2,000 |
| Current src/skills AREA page | 1,392–1,495 characters | 350–500 each |
| Guide topic main text, excluding HTML shell/SVG | Median 1,993 characters; range 1,054–4,628 | Typically 500–800; longest about 1,200–1,500 |

The pending rewrite can change those sizes. Reading raw HTML would cost much more than reading the migrated Markdown, so these guide estimates use extracted main text rather than the repeated website shell.

- **Q1-A:** One planner reading README adds approximately 1.5–2k input tokens if it was not already read. A planner's one or two relevant doc pages can add about 0.5–1.6k. Existing grounding/AREA reads are already prescribed by `plan-issue/SKILL.md:25`, so counting all of them again would overstate the increment. Implementation often already reads affected docs under `implement-issue/SKILL.md:27`; new discovery is the uncertain part.
- **Q2-A:** Two initial reviewers each opening one or two ordinary doc pages introduce roughly 1–3.2k input tokens across the pair. Add roughly 0.7–2k if both also need one or two previously unread AREA pages. A repair review only adds the pages needed for that repair, not a repeat of the entire docs inventory.
- **Per leaf:** Budget roughly **3–8k additional input tokens** for a no-debate leaf with targeted reads, plus a few hundred tokens of impact/evidence notes. A debated leaf has more planning passes (`src/routing.ts:27-31`), so repeated README/doc reads can push this toward **7–15k**. These are working ranges, not caps. Broad API changes and large consumer manuals can exceed them.

For scale, if a leaf otherwise uses 100k total input tokens, an extra 3–8k is roughly 3–8%; against a small 20k leaf it is 15–40%; against 300k it is 1–3%. Those denominators are comparison scenarios, **not measured typical leaf usage**. Actual billing can differ substantially: newly read text may be carried into later requests, cached, compacted or reread in another seat. Dollar estimates require the actual model/cache usage.

Keep cost low by naming relevant docs during planning, reading only pages whose claims are affected, reusing already-loaded context, and accepting a brief “no documented behavior changed” explanation for an internal refactor. Do not mandate a README reread on every tool turn, a full documentation sweep per review, or a token quota that prevents reading the page needed to verify a change. One avoided stale command or failed onboarding attempt can justify several thousand input tokens, but that benefit is a judgment rather than a measured saving here.
