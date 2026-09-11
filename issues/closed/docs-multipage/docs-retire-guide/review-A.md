# Review A: docs-retire-guide

Base: a2b9e07179546a935f854d5a9ea9ca160c5d3408
Reviewed head: f934e4c51ca56710b1a4f3675c007f2887e1afcd (one commit ahead of base, `git status --porcelain` empty)
Debate: no, so no positions or rebuttals apply.

## Diff inspected

- `docs/guide.html` deleted. `docs/` holds exactly the 16 locked pages plus `style.css`.
- Four browser specs: removed guide reads, source tabs, byte-copy assertions, `styles()` computed-style comparisons, and parts/next/day geometry comparisons. Test names no longer promise source preservation. `Locator` import is still used by every spec. Independent checks retained: no inline style, shell head/header/footer/script equality with idea.html, nav order and `aria-current`, stylesheet/font loading, anchors, reveal/reduced motion, sticky header, overflow containers, screenshots, and the existing parts/next/day overflow exceptions.
- Operate derives the title expectation from the migrated page's own section `aria-label` and compares only the shell to idea.html, not content to itself. Matches plan D3.
- `learnings/LESSONS.md` active guide-source-spec line removed and its history file dated as applied. Evidence in the history file (`readFileSync` of guide in operate and shell specs) matches the pre-change tree.
- No page content, CSS, config, or dependency changes.

## Verification run by A

```
test ! -e docs/guide.html                                   -> absent
grep -rn "guide.html" src skills plugin docs REFERENCE.md   -> no output, exit 1
rg -n 'guide\.html' tests/browser                           -> no output, exit 1
grep -on 'href="/[^"]*"' docs/*.html                        -> no root-relative hrefs the checker would skip
bun run format                                              -> exit 0, worktree unchanged
bun test                                                    -> 43 pass, 0 fail, exit 0
bun run typecheck                                           -> exit 0
AKROGON_BASE=a2b9e07... bun test --changed="$AKROGON_BASE"  -> 0 files affected, exit 0
git --no-pager diff --check                                 -> exit 0
```

Browser evidence not rerun (no code change since B's run, no specific concern). Verified artifacts exist under the worktree: `.evidence/docs-retire-guide/*.log` (shell 4 passed, concepts 4 passed, operate 4 passed, practice 24 passed), traces and screenshots under `.evidence/docs-{shell,concepts,operate,practice}/browser` (4/4/4/24 trace.zip, 8/16/20/20 png). Link check log records the inline checker with fixture self-tests passing and 16 pages, 288 relative hrefs, 0 failures.

## Criteria

- AC1 pass. AC2 pass (checker covers `<link>` hrefs, decodes escapes, strips query/fragment, rejects outside-docs). AC3 pass. AC4 pass by recorded evidence and artifacts. AC5 pass.

## Findings

None blocking. No nits.

## Verdict

ready

## Merge

Fetched origin; rebased f934e4c onto origin/main 9d64342 (sync issues) with no conflicts. Rebased head: 28aa08c. Refreshed AKROGON_BASE: 9d64342273d52039535f8ac3997d7fc7de23fab8.

```
bun run format                          -> exit 0, worktree unchanged
bun test                                -> 44 pass, 0 fail, 492 assertions, exit 0
bun run typecheck                       -> exit 0
bun test --changed=9d64342...           -> 0 files affected, exit 0
```

No advisory checks configured. No reusable Nit to record.
