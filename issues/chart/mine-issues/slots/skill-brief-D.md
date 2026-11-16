# Skill draft: post materials from a work session (slot D)

You are slot D (most creative consultant; your design choices carry extra weight). Draft only. Do not edit any repo.

## Goal
The operator wants one akrogon skill they invoke at the end of a day or session. It reads what was actually done and returns "post materials": raw facts, how we did each thing, and why. A separate writing agent turns the materials into posts. The skill never writes posts. The materials must be new, specific, checkable, and not the generic AI content seen everywhere online.

Consumer: the writer persona in writer-persona.md (same folder). Calibrate the materials to it: business stakes first, real numbers and real phrases, what broke and how it was locked down, a practical rule per story, a "closed engine" line per story (what the writer must not reveal), and client anonymity (no client, company, URL, staff or town names that expose the client).

## Reference example of the wanted output
example-materials.md (same folder) is the hand-made version from today's session. Beat it, or keep its shape if it is already right.

## Where it lives and how it ships
- akrogon repo /home/ivan/Work/infra/akrogon, skills/<name>/SKILL.md. Read 2-3 existing skills there (e.g. skills/seed-issue/SKILL.md, skills/watch-issues/SKILL.md, skills/broadcast-issue/SKILL.md) and skills/AREA.md, lifecycle-rules.md for conventions (frontmatter, tone, size).
- src/install.ts links every skills/* folder into .claude/skills, .agents/skills, .codex/skills and .pi/agent/skills, so it must work on every harness. Check install.ts for anything a new skill folder needs.
- Standing rule: every technical part must fit the framework and not invent new mechanisms. Prefer pure SKILL.md text. A script only if text cannot do the job, and say why.

## Decide and justify (short)
1. Name (akrogon style, verb-noun like seed-issue), description line, operator-invoked only or not.
2. Sources it reads and in what order: the current session transcript(s) (~/.claude/projects, ~/.codex/sessions, ~/.pi/agent/sessions), charts and forks, leaf briefs/reports/reviews, readiness grants and proofs, git log of the day, run meta/cost files. How it scopes "today / this session".
3. Story selection: what makes an item post-worthy (a surprise, a failure caught, a number, a rejected obvious approach), and what to drop.
4. Per-story fields (e.g. hook fact, business stake, before/after with numbers, how, why, rejected options and why, practical rule a reader can apply, closed-engine line, source refs, confidence/unverified flags, sanitization notes).
5. Truth rules: every number cites its source path or transcript line; claims not yet true are marked; operator words quoted only verbatim.
6. Output: where the file is written (consumer repo path or scratchpad), format, and what the skill prints at the end.
7. Anything better than this plan; you may change the shape if it serves the operator's intent.

## Deliver
- skill-draft/SKILL.md (full proposed skill text) and skill-draft/notes-D.md (decisions with one-line reasons, open questions for the operator, risks), both in this folder.
- Then: hc send t1xr "done D: skill-draft"
