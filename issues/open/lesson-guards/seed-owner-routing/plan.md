# Plan: seed-owner-routing

Synthesis is direct (`debate: no`); the locked design and live surfaces are the input. HEAD == origin/main at planning; `akrogon status` shows no `Missing:` lines and readiness.yaml already proves `gh` create/read/delete as the seat identity.

## Acceptance criteria (restated for implementation)

1. From framework (`issues_repo: Tamdoma/tamdoma-framework`), a report naming `skills/check-issue/SKILL.md` or `~/.claude/skills/check-issue/SKILL.md` targets Tamdoma/akrogon; reports naming a framework test or framework's `package.json` target Tamdoma/tamdoma-framework.
2. With akrogon not installed, a report the owner test would route to akrogon stops visibly naming the path and reason before posting; a consumer-code report posts as today (never reaches the akrogon step).
3. Both duplicate lookups run against the routed repo; a found report covering the same failure ends the pass with its URL and no new issue; a related but different report still posts with the related line.
4. The posted body names the originating repo, and the lesson history path when one triggered it.
5. A fresh agent that did not write the change, given only the shipped seed-issue text and the files it references, decides six cases without posting; a report records its verdicts, reasons and the subagent used; each matches the expected outcome (six cases under Verification).
6. Every `docs/` line describing seed routing or always-create behavior states the new rules; a sweep by meaning finds no contradicting line; every relative link in the edited skill and guide pages resolves.

## Decisions

- D1 Routing precedence: today's consumer resolution (root `akrogon.yaml` `issues_repo`, else GitHub origin) runs first and unchanged. Only a path the report names as the failure's location that does not exist relative to the consumer root enters the akrogon ownership test. Paths present under the consumer root (shared names like `package.json`, `learnings/LESSONS.md`) never reach it.
- D2 Ownership test, evaluated per named path: a path absent under the consumer root is akrogon-owned when it exists relative to the akrogon root, or resolves under it after `readlink -f` (covers installed skill links such as `~/.claude/skills/check-issue` → `/home/ivan/Work/infra/akrogon/skills/check-issue`). A path absent under both roots is not akrogon-owned; the report routes to the consumer destination as today.
- D3 Akrogon root = `git -C "$(dirname "$(readlink -f "$(command -v akrogon)")")" rev-parse --show-toplevel` (here: `/home/ivan/Work/infra/akrogon` from `/home/ivan/.local/bin/akrogon` → `src/akrogon.ts`). Akrogon repo = that root's `akrogon.yaml` `issues_repo` under today's validation, else that root's GitHub `origin` under today's parsing (akrogon has no root `akrogon.yaml`, so origin gives `Tamdoma/akrogon`).
- D4 Missing akrogon: `command -v akrogon` empty or an unreadable root means the ownership test cannot run. Reached only via D1/D2 (a report naming at least one path absent under the consumer root) it stops visibly with the path and reason before posting. No consumer-routing fallback from a failed owner test: the reason names that the path is not owned by this repo and akrogon's root could not be established.
- D5 Existing-report outcome: when either duplicate lookup surfaces a report covering the same failure (same mechanism or defect, not shared keywords — judge by body), the pass posts nothing; `Last operation` prints the found report's URL. Applies to every run including manual. A related-but-different report stays a `Related reports` line and the run posts. A failed lookup still posts with "search failed" as today.
- D6 Body additions: two lines at the head of the body block — `Origin repo: <owner/repo or repo identity of the current repository>` always, and `Lesson history: <path>` only when a lesson triggered the report. Not new sections; keeps the six-section contract.
- D7 Docs sweep by meaning (per lessons 2026-09-11 stale-rule-in-docs and 2026-09-14 ambiguous-prose-after-rename): lines to edit, with a meaning-sweep over the rest of `docs/` and `README.md`:
  - `docs/guide/learn.md` — extend "A report about an Akrogon skill belongs in Akrogon." with the owner rule (path absent from the current repo and owned under the installed akrogon root → akrogon's issue repo; akrogon missing → visible stop) and the existing-report outcome.
  - `docs/guide/create.md` — the routing paragraph (add owner routing, absent-akrogon stop) and the outcome wording "'none found' ... recorded instead" plus "The result is a report URL": a found report covering the failure is itself the URL outcome with nothing filed.
  - `docs/guide/cheat.md` — the seed-issue table row "One unverified GitHub report." must not promise creation every run (e.g. "one unverified GitHub report, new or already covering it").
  - `README.md` — intake paragraph near `issues_repo`: reports can route to akrogon's repo when the failure's file lives there.
- D8 `tests/docs-links.test.ts` gains `skills/*/SKILL.md` files in the swept list (it already covers README and `docs/guide/*.md`) so criterion 6's link proof is mechanical for skill pages too. No other test file; no vanity tests of skill prose (standing design).
- D9 Fresh-agent proof (criterion 5) runs as its own worker in wave 2 against the committed worktree text, with a prompt that forbids `gh issue create` and any mutation: read-only `gh issue list/view` lookups allowed, everything else decided by inspection. Run record lands at `implementation/fresh-agent-cases.md` in the leaf folder naming the subagent, each case's input, verdict and reason.
- D10 No credentials needed: the design names no `produces`/`grants`/env; `gh` auth is ambient (readiness proof: create/view/delete as `ivanjuras` on Tamdoma/akrogon). Case work and lookups run unauthenticated-capable read-only; nothing posts.

## Read-first

- `skills/seed-issue/SKILL.md` — Destination / Report / Submit and finish sections being edited.
- `docs/guide/learn.md`, `docs/guide/create.md` (`seed-issue` section), `docs/guide/cheat.md`, `README.md` (intake paragraph) — routing and outcome lines.
- `tests/docs-links.test.ts` — file list extension point.
- `learnings/LESSONS.md` + `learnings/history/2026-09-11-stale-rule-in-docs.md`, `2026-09-14-ambiguous-prose-after-rename.md`, `2026-09-27-stale-door-checkout.md` — sweep prose by meaning; cite live lines.
- `skills/AREA.md` — context for `bun test` scope and leaf-artifact placement.

## Interfaces used

- `gh issue create/list/view` against `Tamdoma/akrogon` and `Tamdoma/tamdoma-framework` (probed in readiness.yaml).
- `command -v akrogon`, `readlink -f`, `git rev-parse --show-toplevel` — root resolution.
- `akrogon.yaml` `issues_repo` parsing and `origin` URL parsing — reuse the exact rules already written in the Destination section; the akrogon-root variants state "the same rules as above".

## Checklist

### Wave 1

- W1 Skill + docs + link test (single writer):
  - `skills/seed-issue/SKILL.md`: frontmatter description (name the akrogon-owner route); Destination — append owner routing per D1–D4 after today's consumer resolution; Report — add the two D6 body lines and the covering-report rule per D5 (lookup paragraph already targets the routed repo); Submit and finish — no create on covering report, `Last operation` prints the found URL.
  - `docs/guide/learn.md`, `docs/guide/create.md`, `docs/guide/cheat.md`, `README.md`: D7 line edits.
  - `tests/docs-links.test.ts`: include `skills/*/SKILL.md` in the swept files (D8).
  - Meaning sweep of `docs/` and `README.md` for routing/always-create statements; edit any hit or record it as consistent.
  - Runs `bun run format`, `bun run typecheck`, `bun test` before return.

### Wave 2 (needs W1's shipped text)

- W2 Fresh-agent run record:
  - Spawns one subagent that did not write W1, given only the shipped `skills/seed-issue/SKILL.md` and the files it references, deciding these without posting:
    1. framework report naming `skills/check-issue/SKILL.md` → Tamdoma/akrogon
    2. framework report naming a framework test → Tamdoma/tamdoma-framework
    3. framework report naming `package.json` → Tamdoma/tamdoma-framework
    4. akrogon report naming `src/next.ts` → Tamdoma/akrogon
    5. akrogon-owned report with akrogon missing (PATH without `akrogon`) → visible stop naming the path and reason, no post
    6. a report matching existing Tamdoma/akrogon#73 → no post, prints #73's URL
  - Writes `implementation/fresh-agent-cases.md` under the leaf folder: subagent identity, per-case prompt, verdict, reason, and the observed commands (case 5's PATH manipulation, case 6's read-only `gh` lookups).

## Verification

| Criterion | Proof | Catches | Size | Rerun trigger |
|---|---|---|---|---|
| 1, 2, 3, 4 (decision rules), 5 | W2 run record `implementation/fresh-agent-cases.md`: six verdicts matching the table | Ambiguous skill text: an agent that did not write it decides wrong | minutes | Any later edit to `skills/seed-issue/SKILL.md` routing, body, lookup or finish text |
| 3 (lookup targets routed repo), 4 (body lines) | W1 diff inspection + the six-case run: case inputs exercise both routed repos; body rule read in the shipped text | Lookups run before routing lands (wrong repo searched); missing origin-repo/lesson-history body lines | seconds | Same as above |
| 6 | `bun test` (includes `docs-links.test.ts` over README, guide and `skills/*/SKILL.md`) + recorded meaning sweep of `docs/` | Broken relative link in an edited page; a surviving line promising current-repo routing or always-create | minutes (`bun test` whole suite is the configured check) | Any doc/skill edit after the run |
| Whole leaf | `bun run format`, `bun run typecheck`, `bun test` (configured `checks`) | Format/type drift; link-test regression | minutes | Any diff change |

No `merge_checks` configured; none added. Done-criteria 1–4 are proven through the criterion-5 mechanism (fresh-agent decisions) as the design requires — skill text, no posting.

## Known limitations / notes

- The owner rule keys on paths the report names as the failure's location; a report naming no path routes as today. This is the locked interface, not a gap.
- Case 6 depends on live Tamdoma/akrogon#73 still matching the run's report; if #73 is closed/renamed at run time, the verdict is judged by mechanism (covering report found → no post, prints that URL), not by the number.
- `~/.pi/agent/skills/*` and other harness-installed links resolving under the akrogon root are covered by the same `readlink -f` rule; no per-harness enumeration.

## Implementation notes

- 2026-10-10 IN1: The Report section's file inspection (open the files the failure names, one hop) must run before Destination resolution, because the owner test needs the failure's named path(s). Skill text should state this ordering explicitly; it refines D1/D2, changing no locked decision.
- 2026-10-10 IN2: A report naming several paths evaluates the owner rule per path; the report is akrogon-routed when at least one named path is akrogon-owned under D2. Paths absent under both roots do not reroute.
