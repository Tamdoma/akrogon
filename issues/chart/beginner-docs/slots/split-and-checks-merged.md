# Merged notes: split-and-checks (A, B)

Rebuttal: slots/split-and-checks-rebuttal-B.md (two corrections applied).

## Q1 split
- Five leaves in one issue, owner ISSUE.md with the A seat lock (A,B).
- The door writes the full page map and picture list before handoff: each page's path, one subject, source/skill it follows, picture, incoming links, owning leaf, plus what happens to each old docs/guide page and each affected test (B; A agrees). This is door work, not a leaf (A,B).
- Order follows real links, not file folders (B; A agrees): L-reference and L-pictures first, in parallel only if the map shows reference uses no new picture (else reference waits on pictures); L-use after the pages and pictures it links; L-examples after the how-to pages and pictures it links; L-start last, owning README, the docs home, start/, the reference-index link and deletion of the old docs/guide (B).
- Size: README + guide are about 19,156 words (B, wc -w). If the map shows reference or pictures too big for one session, split by subject bundle at the door (B; A agrees).
- Migration: old docs/guide stays on main until L-start removes it. Needs the operator's OK (B Q1a).

## Q2 tests
- Every merge keeps main green; each shared test file has exactly one owning leaf (B; A agrees):
  - L-reference: docs-links (all docs, nested, images), hold-retired and run-permit doc scans, command-reference moved with the table and its wording checks removed.
  - L-use: rollback test's doc pointer; door-reset's wording check removed.
  - L-start: log-reader's README wording check removed; final check that no link points at the old guide.
- One deliberate break per retargeted check, placed in a new nested page (A,B).
- The docs part of the retirement scans covers README + docs, never chart folders. Existing source, skill and AREA scans and runtime retirement tests stay untouched (B).

## Q3 checks
- Existing tools only, no new test files (A,B).
- Each animated SVG: opened directly with reduced motion set, screenshot right after load and later, both show the still full picture; also checked at page width, narrow width, light and dark backgrounds (B; A agrees).
- B reviews each picture's meaning against its source, and every story page (start/ and examples/) against the scrub list, links, alt text and images (A,B).
- Leaf re-checks each case's landing and the varhop failed/merged conflict (A,B).
