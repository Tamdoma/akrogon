# Review B: guide-markdown

Base: b1bdde3105a673cf57f350b8e3c636ce3b9eee6b
Reviewed head: 51c8e53 guide-markdown: markdown operator guide, link test, drop HTML guide and playwright
`git status --porcelain`: empty. Head is one commit ahead of base.

## Verification evidence

- `bun test`: 273 pass, 0 fail (report; suite includes docs-links + corrected command-reference).
- AREA.md path check: tests/helpers.ts, tests/phase.test.ts, tests/command-reference.test.ts, tests/docs-links.test.ts, src/shell.ts, docs/reference-index.md — all exist.
- docs/guide/: exactly 17 .md, zero .html/.css; tests/browser gone; playwright absent from package.json and bun.lock.
- Every page ends with the Previous/Next/Home footer; all 17 pages use the widgets/export-csv example.
- Claim spot-checks against source: attempts semantics (src/next.ts:350-391), blocked-by checked per dispatch (src/next.ts:534-542), blocked-by names leaves only (src/next.ts:158-163 lookup by slug), leaf depth 2-3 (src/state.ts:86-91), sync eligibility (src/sync.ts:11-33,109-114), failed routing (src/routing.ts:35-38), phase bookkeeping reset (src/phase.ts:95-112), four skill roots (src/install.ts:11), init --from optional (src/akrogon.ts:32-37), hook events + startup pull/next (plugin/herdr-plugin.toml), merged-completion sweep (src/next.ts:669,694,703), max_active global (src/next.ts:265-299), priority/slot ignored (src/state.ts:69-77), `herdr plugin log list --plugin akrogon` verified against live CLI.
- gacp: function is verbatim subshell body; report shows `bash -n` pass and a real temp-repo run (commit, rebase, push).
- Link test: positive over real tree, negative cases for dead file and missing anchor; report shows deliberate broken link failing then passing.

## Findings

### Nits

- N1: `docs/guide/idea.md:9` — "That'ssue holds a leaf" is a typo for "That issue". One word; the surrounding sentence is correct.

## Verdict

nits — all done-criteria verified; the typo is cosmetic, not a defect.
