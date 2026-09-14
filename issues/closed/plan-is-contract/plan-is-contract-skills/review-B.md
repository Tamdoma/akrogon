# Review B: plan-is-contract-skills

Base: `26a7bc2613af4a2c9d579351bc66e87cd1af1427`
Reviewed head: `76c04115427c351bc280c8cf64a12186f65eb298` (confirmed ahead of base; `git status --porcelain` empty at review time)

## Verification evidence

Re-ran every done-criterion command against the worktree:

1. `grep -rn "implementation/brief.md" skills/ docs/guide/` → exactly one line, `skills/implement-issue/SKILL.md:55`, the standalone sentence. Pass.
2. `grep -ln "implementation/report.md" <five files>` → all five listed. Pass.
3. `grep -c "^## [1-8]\. " skills/implement-issue/brief-template.md` → 8; fill-in lines present at lines 51–54 unchanged. Pass.
4. Implement section order confirmed by reading lines 31–43: conditional dated `## Implementation notes` append with never-change-a-lock → one sub-brief per unit delegated, one unit included → inline writes nothing → `report.md` with five contents after commit, before handoff. Pass.
5. check-issue:14 names `plan.md` including implementation notes, `design.md`, `implementation/report.md`, ponytail; :27 names the design's exclusions; no whole-leaf brief named in check-issue or the implement-issue description. Pass.
6. No sentence asks B to restate plan content in a whole-leaf brief; the only remaining "brief" mentions are sub-briefs, the template file, and the standalone sentence. Pass.
7. Standalone section, worker protocol, peer-question rule, footer rules, lesson rules, and the 1,500-word/20-rule limit are untouched; the diff is exactly 14 changed lines across the seven owned files. Pass.
8. `bun test` 223 pass / 0 fail; `bun run typecheck` clean; `bun run format` exit 0 (reported by B, consistent with a prose-only diff; not rerun — no code change since). Pass.
9. Artifact log exists at `/tmp/akrogon-plan-is-contract-skills-grep.log`, exit 0, output satisfies criteria 1–2, path recorded in `implementation/report.md`. Pass.

Dangling-reference sweep (core-skills lesson): `grep -rn "implementation/brief" skills/ docs/ src/ tests/ plugin/` hits only the two owned files; `worker-protocol.md` "the brief" mentions refer to sub-briefs and remain correct.

## Findings

Nit 1: `docs/guide/in-practice.html:86` and `docs/guide/problems.html:61` say "fix the brief if the brief was the problem" for a failed leaf. Under the new contract the natural referent is the intake `brief.md`, which still exists, so the sentence is not wrong — but a reader could also map it to the removed whole-leaf implementation brief. Both files are in the design's exclusions, so this is recorded as a Nit, not a scope expansion.

## Verdict

ready — all nine done-criteria verified with pasted evidence; no Fix findings; one Nit.
