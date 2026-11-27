# Design: guide-chapters

## Binding decisions, verbatim

## Binding decisions, verbatim

### Signposts (forks/signposts.md), operator 2026-11-27, verbatim excerpts

Operator 2026-11-27, verbatim:

1 - Whatever is currently the standard, you tell me what the best words are, and I'll tell you this is okay or not. | 2 - I'm giving you my ideal target audience based on the Crossing the Chasm book. Look it up, what it means, and see what the target audience I give you. This is the target we are waiting for:

#### Target Audience Profile

##### The Core Buyer (Crossing the Chasm)
As an **Innovator** and backend architect, you target **Early Adopters (Visionaries)** already past Step 1 with AI.

Picture one sharp, tech-adjacent operator who knows what an API, CRM, and prompt are, hates hype, and is too busy to write production code. They are not ignoring AI. They are already running agentic workflows, prompts, or Zapier/n8n chains and hitting the wall. Their setups keep breaking, leaking API spend, or requiring constant babysitting because they lack real engineering depth and reliable processes underneath.

##### Two Buyer Segments
1. **Agency Owners & Implementation Partners (Primary / Highest Leverage):** Founders of 5–40 person SEO, paid media, web, or marketing ops agencies managing 15–50 client accounts. They know manual retainers are dying and need a serious backend architect while they handle client rollout.
2. **AI-Forward Mid-Market Leaders (Secondary / Direct High-Ticket):** Founders, COOs, VPs of Marketing, and Heads of Growth at $3M–$50M companies tired of flashy demos that break in production or hurt brand trust.

##### Who You Ignore
* **Innovator Tinkerers & Indie Devs:** Love code trivia, copy ideas on Saturday, and rarely buy.
* **Pragmatic Local SMB Owners (dentists, roofers, med spas):** Want finished outcomes via partners, never AI systems.

| 3a - Those non-important parts, just mention them, what they do and how everything is done. So the documentation is complete, but focus on the ones that I told you about | 4a | 5 - Look at the Tamdoma branding. First look at https://tamdoma.ai, then create the same type of SVGs. Don't brand it with Tamdoma, just put the small attribution and logo in the bottom corners  (created by Tamdoma ("Tamdoma" = Tamdoma logo) | 6 - That was just an example. You can use any example of an upstream system. You can make it up. I'm probably thinking about open-sourcing the framework anyways. | 7a |


##### Correction 2026-11-27 (operator, verbatim)

This is okay, but don't put any marketing jargon inside. We are still writing for people who are somewhat technical, right? We just need them to understand the documentation and what Akrogon is all about by updating their mental model and not overcomplicating with technical jargon. But still, we don't want any marketing jargon in there. That will be a pure guide with examples on how to do something. You can insert a little bit of soft selling inside. | The naming convention. We can't call this quick fix because we're not always fixing. Sometimes we're implementing something really fast. | Also, we need to differentiate two things and make it very clear. The first thing is autopilot versus no autopilot, so we need a category for that. And the second thing is manual versus lifecycle route, so we need a category for that. I was thinking about mode and routes, but you tell me what the best thing is. You can consult with consultants. |

##### Correction 2026-11-27 (operator, verbatim, second)

We also need to internalize it in the skills and inside of the system itself once we come up with categorization names and taxonomy names.

##### Correction 2026-11-27 (operator, verbatim, third)

ok, this is it. Let's stick to it in the docs, as well as the entire codebase where needed

Approved names: category "Charting mode" with values No autopilot, Semi-autopilot, Full autopilot; category "Build route" with values Direct, Lifecycle; "manual" dropped; docs keep slot A (the builder) and slot B (the reviewer); "charting" stays the word for planning. Needs row 3 supplied 2026-11-27.

### Docs shape (forks/docs-shape.md), A's picks under autopilot 2026-11-27, verbatim

Q1: one `docs/guide/` folder with numbered file names in reading order (`01-...md`), charting keeps one page per topic so Charting mode and Build route each get their own page (about 12 guide pages). README is a short front door; docs/README.md is the chapter index; docs/reference/ stays at today's paths as the lookup shelf with words updated; docs/start, docs/use, docs/examples are retired. Chapters: 1 Set up (install, one Akrogon serving many registered repos with a made-up upstream repo, herdr space required and t-/c-/w- tabs as the daily layout), 2 Charting (session start to end, signposts, Charting mode, Build route, decisions and hand-off), 3 Lifecycle (slot A the builder, slot B the reviewer), 4 Merging, 5 While you are away and when work stops (watcher, failed work, park/pause/stop, minor tools named with what they do and how). Reason: signposts correction "differentiate two things and make it very clear" needs separate pages (B rebuttal D6); GitHub lists folders alphabetically, so numbered files keep reading order. Rejected: folder per chapter (wrong order on GitHub, more link churn, C); 8 to 9 pages (merges mode and route, B). Dissent: C preferred 8 to 9 pages.

Q2: the rule stays as written (Direct is not offered under semi or full autopilot) and the docs state it. Reason: the signposts corrections authorize names, not behavior; autopilot.md says changes to autopilot's limits wait for the operator (B withdrew, C). The rule-versus-practice gap (13 recorded breaches) is recorded only, for the operator.

Q3: six still SVGs, all with an opaque parchment card (#f4f1e6, border #c4c0b3) in one file that reads on GitHub light and dark; Tamdoma palette and 1.5 px rounded line art with dashed sage connectors; system sans and mono font stacks with text kept as text; small Tamdoma mark drawn as inline paths from /home/ivan/Work/infra/tamdoma/website/website/public/logos/ plus "created by Tamdoma" in a bottom corner, no outside href. Set: (1) the three tabs (README hero and setup), (2) one Akrogon serving many repos, (3) Charting mode against Build route, (4) one charting session, (5) slot A and slot B passing work, (6) merge and the overnight watch, drawn at docs/pictures/watch-loop.svg so tests/watch-timer.test.ts keeps its path. All other old pictures are deleted with their embeds. Reason: no dark palette exists to copy (B,C); one file per picture halves review. Rejected: in-SVG prefers-color-scheme (A's map; tracks OS not GitHub theme, C); `<picture>` pairs (double files). The three-tabs picture was missing from the merged set (B D1).

Q4: new names in skill prose, definitions and record values written from now on; keys stay (`Route:`, `## Mode record`, `## Autopilot`, `akrogon direct`, file names); printed strings and record values stay lower-case (`direct`, `lifecycle`), so src/direct.ts and its three tests are untouched (B D7); one sentence in the skill reads old record words (`manual`, `attended`, `on autopilot`, `continue attended`, `continue autopilot`, `autopilot signposts`) as their new values. A guard test bans the retired phrases ("manual mode", "manual route", "quick fix", "autopilot signposts" as a mode name) in README.md and docs/ and in skills text outside the one compatibility sentence (C); no hype-word test, tone stays with the cold reader and slot B (B,C). Blind replace is forbidden: "manual" and "attended" have about 60 unrelated hits. Reason: function over form; the reader sees one word set.

Q5: each text leaf's brief carries fixed questions with one right answer each, written here at charting. Slot B gives a fresh subagent inside its own review session only that leaf's guide pages and records each answer with the line it came from in its review; a wrong or unsupported answer is a Fix. Tone (no marketing jargon, little soft selling) is slot B's reading under standing-design's model-choice line. Pictures: slot B reads a rendered screenshot of each picture on a light and a dark page and answers "what does this show". No score.

Q6: one epic `builder-docs` with five issues, each holding one leaf, so ISSUE.md `slots:` separates seats. Open now: `taxonomy-rename` (default seats), `charting-guide` (agy/neon/high), `charting-pictures` (claude/claude-opus-5-5/high, blocked-by charting-guide). Written into issues/parked/: `guide-chapters` (agy/neon/high, blocked-by charting-guide and taxonomy-rename) and `guide-pictures` (claude/claude-opus-5-5/high, blocked-by guide-chapters and charting-pictures). The operator reads the charting chapter with its pictures, then runs `akrogon unpark guide-chapters guide-pictures`. Reason: blocked-by alone would dispatch the rest the moment charting merges (C); charting pictures before the read because pictures are half the complaint (B D5). Rejected: one chain with a readiness needs row (prints Missing: noise and exits 1 on next, C); all pictures last (C).

Correction (A, 2026-11-27, at leaf writing): `akrogon park` takes a top-level folder under issues/open (docs/use/park-pause-stop.md), so an issue inside an epic cannot be parked alone. The split becomes two epics: `builder-docs` (taxonomy-rename, charting-guide, charting-pictures; open) and `builder-docs-rest` (guide-chapters, guide-pictures; written to issues/open and parked at once with `akrogon park builder-docs-rest`, safe because both leaves are blocked-by unlanded leaves). The operator unparks with `akrogon unpark builder-docs-rest` after reading the charting chapter.

### Operator correction after reading the charting chapter, 2026-11-27, verbatim

"1. ![alt text](image.png) <- It needs to use the full example. Which two consultants? Look at what I do. I use slot B, make it something, and slot C, make it something, mentioning the harness and the model and the efforts

2.  Everything else is great, but I would like to have more images to explain every section. The images look really, really good. The only thing is that the logo is not correctly positioned on the vertical axis. Or maybe it is. ![alt text](image-1.png)"

"I want all of the items and the new architecture to look like that. The content is really good. Great job done by the AGY Neon writer. One thing, tell him to remove the m dashes. This is a dead AI giveaway. Everything else is perfect."

"We need to rewrite everything like that. This is perfect. Tone and explanations, just add more images."

Door reading (A): image.png is the example line `/chart-issues Add a weekly client report export to client-portal. Use two consultants.`; every example that starts consultants names each slot with harness, model and effort, for example `Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.` image-1.png is charting-session.svg, where the "created by" mark sits slightly off the text line vertically. "Every section" means every `##` section of every guide page gets a picture in the charting-pictures style. Em dashes (—) leave every human doc page, including the already merged pages 04 to 08.

Operator 2026-11-27, verbatim: "Same thing with installation and setup process. It needs to be easy to follow."

Operator 2026-11-27, verbatim: "Yes, consult with both consultants before all the charts are completed and handed off. As I said, if there is a better architecture, we don't have to keep the old one. I was just talking about how good the text is, and this is exactly what I want with the addition of more images. Everything else is really, really good."

### Rest shape (forks/rest-shape.md), A's picks 2026-11-27, verbatim

A's picks, 2026-11-27 (builder-docs runs under autopilot; the operator delegated the architecture in the words above).

- R1 Guide pages: 01-install, 02-set-up-a-repo, 03-your-three-tabs, 04 to 08 unchanged numbers, 09-lifecycle, 10-merging, 11-while-you-are-away, 12-when-work-stops. Removed: 01-what-akrogon-is (README owns it) (B,C), 13-other-tools (minor tools get a short table in docs/README.md linking the shelf; hand-written issues and rollback live on the shelf) (B,C). 09 and 10 stay separate because the operator named merging as its own chapter (B; C would merge them). 04's tab section shrinks to a link to 03 (B,C).
- R2 Setup easy to follow: 01 to 03 are numbered steps from a bare machine to `akrogon status` showing client-portal, each step with its command and what the reader should see, a full copyable machine config, and the clone step (B).
- R3 One running example through 09 to 12: client-portal's `csv-export` and `scheduled-email` from page 08 through build, review, merge, the night and one failure; client-portal is one of page 02's two product repos beside the made-up acme-core upstream (B).
- R4 docs/reference/words.md maps each guide word to its shelf word (task/leaf, slot A/seat A, charting agent/chart door) (B).
- R5 Order: a small charting-fixes leaf first (agy writer): em dashes out of README.md, docs/**/*.md and docs/pictures/*.svg; full consultant examples on 04 to 08 and docs/README.md; one sentence on 04 that consultants sit in slots B, C, D while charting and a Lifecycle task gets a fresh slot B (B G2); a dash guard reading the disk. charting-pictures-more and guide-chapters are blocked by it (A,B,C: removes the 04 to 08 collision).
- R6 Pictures split by chapter: charting-pictures-more (04 to 08 and the mark fix), setup-pictures (README hero, 01 to 03), build-pictures (09, 10), away-pictures (11, 12, old-picture deletion, shelf embeds). Each later picture leaf is blocked by guide-chapters and charting-pictures-more (A,B; C proposed the same size). Merge gets its own picture; watch-loop.svg is the overnight watcher only.
- R7 Logo: only charting-session.svg is off (B,C measured: 4 px high). Fix by one mark group holding the "created by" text and the logo, copied whole into every picture and placed by one translate; where-things-go.md says so (B). Proof: the mark group markup is identical across pictures, plus slot B's screenshot reading (B K1, C).
- R8 Picture per section: a section may share a picture when the report gives a reason slot B accepts; a series drawn from one base drawing is fine; a picture above the first `##` counts for the page opener (B K2, C).
- R9 Renders: one light render per picture, one dark render per leaf (the card is opaque) (B,C).
- R10 Text criteria: behavior-claim proof scoped to commands, paths, numbers and always/never/only rules (B K3, C); a move map from every retired page to its new home, checked by slot B (B K5); the cold reader also re-reads 04 to 08 and gets a setup question; Q2, Q3, Q6 wording fixed (C); README carries no picture until the hero exists (B K7).
- Not taken: C's folds of roll-back-a-release.md into releases-and-updates.md and limits.md into README (no reader gain named; rollback test keeps its page). B G3 (`xhigh` unproven): consultant C has run on agy neon xhigh all day (seats.yaml), so the example stays.

Superseded by rest shape: Q1's page list (01-what-akrogon-is and 13-other-tools are gone), Q3's "six still SVGs" set and its public/logos path (the logotype comes from website/src/components/logotype.svg), Q5's light and dark render per picture (R9), Q6's leaf list, and the door reading's "every `##` section gets a picture" (R8).

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md (installed path). Interpretation for this leaf:
- The guard test is the cheapest proof of a literal contract; it reads files from disk and keeps no hand-copied page list.
- Moved tests keep their expected content and change only the path.
- Understanding and tone are slot B's reading with the cold-reader answers as evidence. No count or score stands in for that reading.

## Leaf architecture

Owned surfaces:
- README.md and docs/README.md
- docs/guide/01 to 03 and 09 to 12 (new)
- docs/guide/04 tab section and the previous/next lines of 04 and 08
- docs/reference/*.md (words; words.md rewritten; where-things-go.md folder lines rewritten, picture-style lines unchanged)
- docs/use/roll-back-a-release.md moved to docs/reference/roll-back-a-release.md
- deletion of docs/start/, docs/use/, docs/examples/
- tests/rollback.test.ts and tests/watch-timer.test.ts (path changes only)
- the guard test charting-fixes added (phrase rule added)

Consumers of the changed state:
- tests/docs-links.test.ts resolves every link in README.md, docs/ and the skill .md files, so a deleted page needs every inbound link fixed in the same diff.
- tests/rollback.test.ts needs "mv -T .next-current current", "release-hold.yaml" and "writeDeploySuccess" in the rollback page. The page moves to docs/reference/roll-back-a-release.md.
- tests/watch-timer.test.ts reads the watcher page (`## What each check does`, the four harness names claude, codex, pi and agy, and no "cron" or "expir") plus docs/reference/skills.md and docs/pictures/watch-loop.svg; the `## What each check does` section must hold no "akrogon status"; the old path appears three times in that test (file list, path list, `path ===` comparison) and all three move.
- tests/docs-links.test.ts also needs "(script)" in docs/reference/checks.md and files.md, and a verify-runs.jsonl row naming timeouts, durations and attempt in files.md.
- tests/run-permit.test.ts forbids /run permit/i in README.md, every docs/**/*.md and src/AREA.md.
- tests/hold-retired.test.ts bans hold-fix, unhold, --red-on-base and held.yaml.
- tests/command-reference.test.ts reads docs/reference/commands.md.
- docs/reference-index.md, which is agent-facing and out of scope, links docs/README.md and docs/reference/where-things-go.md, so both stay.

Pictures: embeds on deleted pages go with them; README's old embed goes; shelf embeds stay until away-pictures replaces them. This leaf adds no embed of a picture that does not exist on main.

Made-up upstream example: acme-core with client-portal and one more product repo built on it, all in one machine config. It names no real or private repo and no client from the operator's machine config.

Facts to read before writing:
- src/config.ts (repos, slots, harnesses)
- src/hc.ts `resolveSpace`. The space named after the repo is required. The t-/c-/w- tab names are the operator's convention, not checked by code.
- skills/watch-issues/SKILL.md (20-minute timer)
- skills/merge-issue/SKILL.md
- skills/check-issue/SKILL.md
- skills/implement-issue/SKILL.md
- the existing docs/use pages being retired (as source material only)

## Cold-reader questions

Each question has one right answer:
1. "Do I install Akrogon once per project?" No. Once per machine, and it serves every registered repo.
2. "List the commands, in order, from a fresh machine to your first `akrogon status`." The ordered commands page 01 and 02 give.
3. "What runs in each of the three tabs?" t-: `akrogon status` and `akrogon next`. c-: the charting agent. w-: the watcher.
4. "What does slot B do in a Lifecycle task?" It reviews slot A's finished work, then repairs it or sends it back.
5. "When does work get merged and what happens if checks fail on the merged result?" After slot B passes it, one merge turn per repo runs the checks. A red result goes back to repair.
6. "I'm leaving overnight. What keeps work moving and what still waits for me?" The watcher in the w- tab checks every 20 minutes. Keys, approvals and decisions only you can give still wait.
7. "A task stopped as failed. Where do I see why, and how does it restart?" The failed reason in `akrogon status`, and the restart the when-work-stops page gives.
8. "Which two Charting modes fit charting three reports overnight, and what do you still answer in each?" Semi-autopilot, where you answer the signposts once, and Full autopilot, where you answer only needs-sheet rows (docs/guide/06-charting-mode.md, docs/guide/05-signposts.md).
