# Sub-brief 1: seed-cause-evidence U1 — rewrite skills/seed-issue/SKILL.md

## 1. Goal

Extend the standalone seed-issue skill so a filing does bounded read-only discovery, always writes a last `## Suspected cause` section, runs two read-only `gh` lookups for related reports, and prints one optional root-report line on a strict five-condition trigger. Plan decisions D1-D6. Owned path: `skills/seed-issue/SKILL.md` only, in the worktree `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence-u1`.

## 2. Acceptance criteria

1. The report rule (`:26`) is reworded in place: six sections, "diagnosis" lifted, "recommended fixes" and planning metadata still banned, title describes what was seen and names a cause only when the reporter's statement is itself a cause, marked suspected.
2. "Not provided" (`:28`) stays legal for the five original sections and for missing details; `## Suspected cause` is never a bare "Not provided".
3. Template gains `## Suspected cause` after Urgency with five placeholder lines: conditions (main and contributing, no wider than the evidence), whose view, files read (installed/vendored copies flagged, unverified destination links named), not inspected or would disprove, related reports.
4. One discovery rule: open the files the failure names, follow one hop to caller or shared contract; file reads only, no project commands, installs or edits; stop at a supported hypothesis or a named evidence gap; post whichever was reached.
5. One lookup rule: two read-only `gh issue list` calls on the routed repo before posting (`--author @me` two-day window; 2-3 word keyword search; both `--state all`, `--json …,body`); retry a failed call once with a visible warning; judge candidates by body; `gh issue view` only for reporter-supplied links; never comment, label or change state on a linked issue; a failed lookup still posts and states "search failed" with command and error in the section and the final outcome.
6. One root-line rule: after successful creation, when all five conditions hold (supported hypothesis; another open linked report shares it; no found report covers it; lookup did not fail; this report is not itself a cause statement), print `/seed-issue Suspected root cause: <condition>. Seen in <owner/repo#n>, … <evidence limit>.` before the final two lines; footer stays `Next: none` with its reason naming the printed line.
7. Related line content: linked reports as `owner/repo#n` each with a reason, or "none found", or "search failed" with the error; always the repo, query, states and limit searched.
8. Section behavior on thin input: supported cause gives a labeled hypothesis; unsupported gives "no supported hypothesis" plus the evidence needed next; a reporter suspicion contradicted by inspected evidence is stated as contradicted, with the evidence. The section never assumes a chart pass follows.
9. Budget: under 300 lines, under 4k tokens (bytes/4 ceiling), and under 20 rules counted by meaning (each new placeholder line that adds a requirement counts as one). If the count cannot land under 20 without losing meaning, stop and return the count and rule list instead of exceeding the cap.
10. Unchanged: compaction header `:6`, routing rules `:12-22`, the `gh issue create` heredoc invocation, one report per run, the failure rule (no blind retry of ambiguous creation), the `Last operation`/`Next: none` footer (reason slot extends to name a printed root line).

## 3. Read-first list

- `skills/seed-issue/SKILL.md` in your worktree (the file you rewrite).
- `/home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence/ponytail-equivalent`: none; keep prose tight, every sentence a rule or data.
- Prior skill count reference: `issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md` (12 directive + 1 dependency) — readable in the leaf worktree at `…/seed-cause-evidence/issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md`? No: the file lives in the registered repo's `issues/`, not the worktree. Read `/home/ivan/Work/infra/akrogon/issues/closed/akrogon-loop/github/seed-issue/verification/seed-issue.md` directly.

## 4. Change list and needed interfaces

One file: `skills/seed-issue/SKILL.md`. Structure to keep: frontmatter → compaction line → title → standalone paragraph → Destination (unchanged) → Report (reworded :26/:28, extended template, then discovery + lookup rules) → Submit and finish (create command unchanged, one report, failure rule, footer with root-line before it).

Literal commands the skill must instruct (gh 2.102.0):

```text
gh issue list -R <repo> --state all --author @me --search "created:>=<YYYY-MM-DD two days back>" --limit <n> --json number,title,state,body
gh issue list -R <repo> --state all --search "<2-3 words>" --limit <small n> --json number,title,state,body
gh issue view <n> -R <repo> --json number,title,state,body   # reporter-supplied links only
gh issue create -R "$repo" --title "$title" --body-file -    # unchanged
```

Exit 0 with `[]` means none found; non-zero means search failed. No prerequisite chunks; you own the whole file.

## 5. Do-not, reasons and exceptions

- Do not touch any file other than `skills/seed-issue/SKILL.md`. Reason: U2 owns docs/guide/create.md; everything else is out of scope.
- Do not add examples, rationale paragraphs, a portability rule sentence, or restatements of the same rule. Reason: rule and token budget.
- Do not weaken or remove routing, the banned-items list, one-report, the failure rule or "Not provided" for missing details. Reason: standing D3 items still bind.
- Do not use harness-specific tools or syntax anywhere; the literal string `/seed-issue` appears only in the printed root-report line.
- Return a mismatch with evidence instead of changing scope or exceeding a cap; the exception is a revised brief from A.
- Restated: one file only; tight prose only; no weakening; no harness specifics; mismatch over scope change.

## 6. Ordered steps

1. Read the current file; rewrite Report section: reword `:26` (six sections, title clause, no "diagnosis"), keep `:28`, extend the template with the five-line `## Suspected cause`.
2. Add the discovery rule (D1) and the lookup rule (D4) in the report flow, ordered: discover → look up → author body → create → root line → footer.
3. Add the root-line rule (D5) and extend the footer's reason slot.
4. Count rules by meaning, list each one; check `wc -l` and bytes/4. If over 19 rules, merge only where meaning stays whole; if still over, return the count and list (acceptance 9).
5. Commit on the detached HEAD: `seed-issue: record suspected cause and related reports` (or similar).

Advisory: 1 file, under 15 turns.

## 7. Commands

```bash
cd /home/ivan/Work/infra/akrogon/issues/worktrees/seed-cause-evidence-u1
AKROGON_BASE=ce4c9813982b690c78f075d1aecbb17ebcb01f9c bun test --changed="$AKROGON_BASE" --timeout=30000
```

Plus mechanical caps: `wc -l skills/seed-issue/SKILL.md` and `wc -c` for the bytes/4 token ceiling.

## 8. Done-when, evidence and report

The skill satisfies all 10 acceptance criteria; the commit lands on the worker worktree HEAD. Report must list each counted rule by number (the C1 list) and paste wc/token output and the test command result.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
