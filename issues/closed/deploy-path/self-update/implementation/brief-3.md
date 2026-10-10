# Sub-brief 3: guide (plan U3, wave 1)

## 1. Goal

`docs/guide/install.md` describes how landed work deploys itself and stops telling the operator to `git pull`. Done-criterion 9.

## 2. Acceptance criteria

1. Lines 37-41 ("The links point back to this checkout. Update it with: git pull") are replaced by text covering all of:
   - Landed work deploys itself: after a merge lands, and on `akrogon next` runs (`next`, `next --all`, `next --resume`) that select or cover the akrogon repo, one step fetches the default branch, fast-forwards the checkout when it is strictly behind, runs `bun install --frozen-lockfile`, and reconciles the skill links.
   - It prints one line: `deployed <old>..<new>` on a fast-forward, `current <sha>` when already up to date, otherwise the failing step, the git or bun error, the lag count and the remedy.
   - The operator still acts when the line reports the checkout is on another branch or detached, ahead of or diverged from the remote (`akrogon sync` is the remedy), or blocked by an uncommitted edit that overlaps incoming changes (commit or finish that edit).
   - A failed step retries itself at the next trigger; nothing else changes.
2. No `git pull` instruction remains in the file.
3. `bun test tests/docs-links.test.ts --timeout=30000` passes (no broken anchors/links).
4. Style matches the file: short paragraphs, operator-facing, no new headings.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `docs/guide/install.md` — the whole file.
- `issues/open/deploy-path/self-update/brief.md` done-criteria and `design.md` binding decisions for exact trigger/output wording.

## 4. Change list and needed interfaces

Owns: `docs/guide/install.md` only. Prose only; no code.

## 5. Do-not, reasons and exceptions

- Do not mention `akrogon install` internals, herdr, or locks — operator-facing only.
- Do not add test changes — docs is checked by review and docs-links.
- Do not grow the section into a feature doc; two or three short paragraphs max.
- If the required content forces a heading or restructure beyond the block, return a mismatch; the exception is a revised brief from A.

## 6. Ordered steps

1. Read the file and the brief/design excerpts.
2. Replace lines 37-41.
3. Run the section-7 commands.
4. Commit `docs/guide/install.md` alone. Size: 1 file, ~4 turns.

## 7. Commands

```
AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000
bun test tests/docs-links.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

Block replaced, no `git pull`, docs-links green. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
