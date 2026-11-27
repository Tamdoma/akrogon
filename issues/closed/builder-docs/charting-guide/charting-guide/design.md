# Design: charting-guide

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

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md (installed path). Interpretation for this leaf:
- No new test.
- Links are proven by the existing tests/docs-links.test.ts inside `checks`.
- Understanding and tone are model choices. Slot B decides them by reading, using the cold-reader subagent's answers as evidence, and records them in its review.
- No count, reading-level score or word list stands in for that reading.
- The cold-reader subagent runs inside slot B's own session, so it is not a separate paid launch and needs no grant.

## Guide plan (fixed here so later leaves agree)

docs/guide/ file names in reading order:
- 01-what-akrogon-is.md, 02-install-and-repos.md, 03-your-three-tabs.md (chapter 1, guide-chapters)
- 04-a-charting-session.md, 05-signposts.md, 06-charting-mode.md, 07-build-route.md, 08-hand-off.md (chapter 2, this leaf)
- 09-lifecycle.md (chapter 3), 10-merging.md (chapter 4)
- 11-while-you-are-away.md, 12-when-work-stops.md, 13-other-tools.md (chapter 5)

Pages 01 to 03 and 09 to 13 belong to guide-chapters. This leaf must not link them, because they do not exist when it lands. Each page ends with a previous/next line naming only pages that exist at landing.

## Leaf architecture

Owned surfaces: docs/guide/04 to 08 (new) and a Charting section in docs/README.md.

Sources of truth to read before writing:
- skills/chart-issues/SKILL.md (`## Open`, `## Drain`, `## Take`, `## Handoff`, `## Direct route`, `## Autopilot`)
- assets/questions.md (the signposts paragraph)
- assets/autopilot.md
- the approved names in forks/signposts.md

taxonomy-rename may land before or after this leaf. The docs use the approved names either way, and slot B judges claims by behavior, not by the skill's old words.

Running example: a made-up agency job, such as "add a weekly client report export to our reporting app". It must be believable for the reader. It names no real client, and none from the operator's machine config.

Pictures: none in this leaf. charting-pictures adds the Charting mode against Build route picture and the charting session picture to these pages. The writer leaves no placeholder link.

Exclusions:
- docs/start, docs/use, docs/examples, README.md and docs/reference (guide-chapters)
- pictures (charting-pictures)
- skills (taxonomy-rename)

## Cold-reader questions

Each question has one right answer:
1. "What is the difference between Charting mode and Build route?" Charting mode decides who answers the questions while the work is charted. Build route decides who builds it once every question is answered.
2. "I want a small, clear new export button built fast today. Which Charting mode and Build route fit?" No autopilot with Direct. Direct is offered only under No autopilot.
3. "I'm going to bed and want three reports charted and handed off. Which two Charting modes fit, and what do you still answer in each?" Semi-autopilot: you answer the signposts and the charting agent answers the rest. Full autopilot: the agent also answers the signposts.
4. "What are signposts and when are they asked?" Ranked priorities, hard limits and the order of the session's charts, asked once per session before any map.
5. "Can Semi-autopilot use the Direct route?" No, only Lifecycle.
6. "What does the charting agent hand off at the end of a Lifecycle chart, and does it start the work?" Written task contracts for a fresh slot A and slot B. It does not start them.
7. "What do consultants do during charting?" They map and answer independently, and the charting agent merges their views.
