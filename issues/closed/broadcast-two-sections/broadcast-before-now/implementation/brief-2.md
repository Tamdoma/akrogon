# Sub-brief 2: skill text and guide

## 1. Goal

Prose surfaces describe the two-section broadcast and the broad-audience writing rules. Plan decisions D4, D5.

## 2. Acceptance criteria

1. `skills/broadcast-issue/SKILL.md` "Context and message" describes two sections: `Before` always present and naming what was missing for additions; `Now` stating what is better about the system, not what code changed; headline after the repo name is one plain sentence a non-developer understands.
2. Forbidden items add file names, command names, code identifiers and unexplained acronyms to the existing jargon, internal paths, model names and test statistics.
3. The per-shipped-part scaling rule is replaced by: scale detail to what a broad-audience reader needs, merge parts when that reads better, keep small issues to a few short bullets, never drop a shipped outcome the reader would care about.
4. The JSON example body is `{"summary","before","now"}` only.
5. `docs/guide/merge.html`: metric reads `2` / `sections: before, now`; the `<pre>` example drops the `**Next**` block; the following paragraph carries the scaling rule.
6. `grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules` returns nothing.

## 3. Read-first list

- `skills/broadcast-issue/SKILL.md` — "Context and message" section and the JSON example in "Send".
- `docs/guide/merge.html` — metric at ~line 60, `<pre>` example and the paragraph after it (~lines 65–76).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.

## 4. Change list and needed interfaces

SKILL.md: rewrite the two "Context and message" paragraphs and the heredoc JSON example. Keep the section's peer-question paragraph and everything outside "Context and message"/the example untouched. Match the skill's existing terse style; no new headings.

merge.html: change the metric number and label, remove the `**Next**` span block from the example, and update the paragraph beginning "Detail scales with size." to the readability scaling rule. Keep HTML structure and `class="y"`/`class="s"` spans consistent with the file.

## 5. Do-not

- Do not touch `skills/merge-issue/SKILL.md`, `README.md`, other guide pages, or anything under `issues/`: out of scope per the design's exclusions.
- Do not change the title format `## 🧪 <repo>: <headline> (MM/DD/YY)` anywhere: locked by the operator.
- Do not add a readability checklist or mechanical guard description: the design forecloses it; rules only.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

## 6. Ordered steps

1. Edit `skills/broadcast-issue/SKILL.md` (criteria 1–4).
2. Edit `docs/guide/merge.html` (criterion 5).
3. Run the criterion-6 grep from the worktree root and paste its empty output.

Advisory size: 2 files, under 10 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/broadcast-before-now
grep -rn '\*\*Next\*\*' skills docs README.md --exclude-dir=node_modules
```

Expected: no output, exit 1.

## 8. Done-when, evidence and report

Empty grep output pasted; both files updated per criteria.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
