# Focused final-shape check B

## FC1. FS3 and FS7: the lesson-rule aliases expose two broken relative links

`skills/lesson-rule.md` contains two relative Markdown links: **Seed** links `learn-issues/SKILL.md`, and **Home** links `seed-issue/SKILL.md`. They resolve from the canonical file's `skills/` directory. They do not resolve from any of the five proposed in-folder lesson-rule aliases.

Read-only observation, 2026-11-11: extract those targets and evaluate `Path('skills', target).is_file()` versus `Path('skills', skill, target).is_file()` for plan-issue, implement-issue, check-issue, learn-issues and chart-issues. Both canonical targets return `True`; all ten alias-relative targets return `False`. For example, a seat reading `skills/plan-issue/lesson-rule.md` reaches `skills/plan-issue/learn-issues/SKILL.md`, which does not exist.

This is the same path-text resolution FS7 deliberately models. `tests/docs-links.test.ts`, **brokenLinks**, resolves targets with `resolve(dirname(sourcePath), pathPart)`. An expanded check that follows the proposed alias files will therefore reject them. Excluding fenced examples does not fix these links because both are ordinary prose. Checking only the real file would miss the seat's alias-relative read path.

Smallest correction: allow FS3 to change just those two Markdown references into named skill/section references, using FS4's mechanism. Preserve the lesson rule's meaning. Change “The text of skills/lesson-rule.md does not change” accordingly. FS7 should explicitly check each reader-facing alias path, without deduplicating symlinks by real path before checking relative references. No extra directory aliases or link-resolution machinery are needed.

## FC2. FS5: the short-excerpt clause adds a planning duty

The retained `plan-issue/SKILL.md`, **plan.synthesis**, paragraph beginning “With `plan.md` written”, requires run-check capture and log citations but does not limit pasted output to a short excerpt. The other three skills' **Shared context** output paragraphs explicitly say “at most a short excerpt”. FS5 acknowledges that difference, then gives planning the same complete shared rule.

That adds a restriction to planning. Naming it in the report table does not preserve the binding “no seat gains or loses a rule”. The exemption reasons are explanatory and do not create the same issue.

Smallest correction: scope the short-excerpt clause in the shared file to implement, check and merge, or keep that clause local to those three skills. Plan follows the shared capture/citation/exemption contract without acquiring the cap. This preserves the taken extraction scope and requires no new operator policy decision.

Disputed FS codes: FS3, FS5, FS7.
