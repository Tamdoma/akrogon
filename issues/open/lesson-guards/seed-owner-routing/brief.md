# Brief: seed-owner-routing

## What
`/seed-issue` changes in two ways.
- Owner routing: a report whose failure lives in akrogon's own skills or command posts to akrogon's issue repo, even from a consumer repo whose `akrogon.yaml` names another repo. Ownership is decided by where the named file really lives: a path that exists relative to the current repo's root routes as today (framework and akrogon share names such as `package.json` and `learnings/LESSONS.md`); only a path absent there is tested against the akrogon root, where it is akrogon-owned when it exists relative to that root or resolves (after `readlink -f`) under it, which covers installed skill links such as `~/.claude/skills/check-issue`. The akrogon root is the Git root of `readlink -f "$(command -v akrogon)"`; its repo is that root's `akrogon.yaml` `issues_repo`, else its GitHub `origin` (akrogon has no root `akrogon.yaml` today, so origin gives Tamdoma/akrogon), with today's validation. Every other report routes exactly as today and needs no akrogon install.
- Existing report: when the duplicate lookups find a report covering the same failure, the pass posts nothing and prints that report's URL as its outcome. This applies to every run, manual ones included.

The report body names the originating repo and, when a lesson triggered it, the lesson's history path.

Owned files: `skills/seed-issue/SKILL.md`, the routing lines of `docs/guide/learn.md`, and any other `docs/` line describing seed routing or always-create behavior.

## Why
Tamdoma/akrogon#73. Lessons will file seeds automatically (lesson-write-rule). Today seed-issue posts only to the current repo (`skills/seed-issue/SKILL.md:14-22`), so a framework seat that finds an akrogon skill defect files it where it cannot be fixed, while `docs/guide/learn.md:38` says it belongs in akrogon. Its lookups (`:56`) never stop creation (`:68`), so the lesson rule's no-duplicate promise has no owner today.

## Done-criteria
1. Run from framework (whose `akrogon.yaml` names Tamdoma/tamdoma-framework), a report naming `skills/check-issue/SKILL.md` or `~/.claude/skills/check-issue/SKILL.md` targets Tamdoma/akrogon, and reports naming a framework test or framework's own `package.json` target Tamdoma/tamdoma-framework.
2. With akrogon not installed, a report the owner test would route to akrogon stops visibly with the path and reason before posting; a consumer-code report posts as today.
3. Both duplicate lookups run against the repo the report targets; a found report covering the same failure ends the pass with its URL and no new issue; a related but different report still posts with the related line.
4. The posted body names the originating repo, and the lesson history path when one triggered it.
5. A fresh agent that did not write the change, given only the shipped seed-issue text and the files it references, decides six cases without posting, and the report records its verdicts, reasons and the subagent used; each matches: framework report about `skills/check-issue/SKILL.md` (Tamdoma/akrogon), framework report about a framework test (Tamdoma/tamdoma-framework), framework report about its `package.json` (Tamdoma/tamdoma-framework), akrogon report about `src/next.ts` (Tamdoma/akrogon), akrogon-owned report with akrogon missing (visible stop), a report matching existing #73 (no post, prints #73).
6. Every `docs/` line describing seed routing or always-create behavior states the new rules; a sweep by meaning finds no contradicting line, and every relative link in the edited skill and guide pages resolves.
