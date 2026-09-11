# Review A: grounding-layout

Base: e3881142f23eee780a114664c7a71770a5965d8f
Reviewed head: 421934b6a38fc03bee7abc06a446812c7f01f6e7
Verdict: ready

## Verification evidence

- Diff: 30 paths, 15 pure renames docs/ -> docs/guide/ (HTML + style.css), setup.html rename with one index-path line changed, REFERENCE.md -> docs/reference-index.md, three new AREA.md, three skill edits, README link, four browser URL constants. No src/ code, tests, dependencies or issues/ paths on the branch (`git diff --name-only origin/main...HEAD -- issues` empty, `git status --porcelain` empty).
- Area named-path check (one shell loop per file from repository root): src/AREA.md 7 paths, skills/AREA.md 10 paths, tests/AREA.md 7 paths, all present. Sizes 26/27/27 lines, each with exactly Commands, Key files, Non-obvious patterns, See also as `##` sections. Spot-checked claims against source: retryCommand warns then rethrows (src/shell.ts:54-57), dirty-worktree refusal (src/phase.ts:151), bunfig root = tests, eight skills, command-reference test reads README.
- Index links resolved from docs/: ../src/AREA.md, ../tests/AREA.md, ../skills/AREA.md, ../plugin/, guide/, ../issues/, ../learnings/ all present. Seven lines.
- `rg -n 'REFERENCE[.]md' --glob '!issues/**' --glob '!learnings/**' .` returns only auditdeepseek.md:413 (historical, D6 residual, correctly reported by implementation).
- Guide copy: only setup.html:74 describes the index; no other page text describes docs location or area docs. `docs/*.html` absent, docs/guide holds 17 entries.
- Authoritative /home/ivan/Work/infra/akrogon/issues/config.yaml grounding.index = docs/reference-index.md, uncommitted, matching D5.
- Reran: `bun run typecheck` exit 0; `bun test` exit 0, 211 pass, 0 fail; `bun run format` exit 0; Playwright shell config exit 0, 4 passed (headless Chromium, trace on). Implementation evidence for the other three browser configs is under .evidence/grounding-layout/green-*.log.
- Skill rules: init reuses valid index, proposes docs/reference-index.md, allows only needed adjacent AREA.md writes with the four-section/40-line shape, prohibition sentence replaced (criterion 6). implement names AREA.md, sections and cap (criterion 7). check rule is diff-scoped, one shell command, missing path = Fix, no extra reads (criterion 8). No prose test added.

## Findings

- No Fix. Criteria 1-3, 5-9 pass. Criterion 4 passes for all operational surfaces; its literal zero-match clause fails only on the historical auditdeepseek.md:413, which design excludes from owned surfaces (D6). Implementation reported this rather than claiming compliance.
- Note, not a Nit against this leaf: `bun run format` reformats the untouched src/next.ts on this branch and on base. Pre-existing and out of scope; I restored the file after the run.

## Merge

Rebase target: origin/main at e3881142f23eee780a114664c7a71770a5965d8f (already up to date, no rebase changes). Head 421934b6a38fc03bee7abc06a446812c7f01f6e7. AKROGON_BASE refreshed to e3881142f23eee780a114664c7a71770a5965d8f.
Checks in worktree: `bun run format` exit 0 (reformatted untouched src/next.ts, restored, pre-existing); `bun test` exit 0, 211 pass, 0 fail; `bun run typecheck` exit 0; guarded `bun test --changed` exit 0, 0 affected tests. No advisory commands configured. B's Nits are the acknowledged D5/D6 design residuals, not reusable lessons; no LESSONS.md entry added.
