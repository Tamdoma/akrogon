# Signposts: builder-docs

Original: this chart (issues/chart/builder-docs). Session handed list: builder-docs only. Consultant angles: slots/signposts-angles-b.md, slots/signposts-angles-c.md.

## Question

1. Which words name the routes and modes? 1a (rec) one meaning per word: "quick fix (direct route)", "lifecycle route", "no / semi / full autopilot"; the word "manual" is not used. 1b your words as you wrote them: "manual route" for quick fixes and "no autopilot" for the mode. 1c the skill's words only. Steers every page and picture label.
2. What can the reader already do? 2a (rec) runs one coding agent in a terminal, new to git and to Akrogon. 2b has never used a terminal agent. Steers setup chapter length and which words get explained.
3. Where does the detail go? 3a (rec) most pages and pictures go to charting, where you decide things; lifecycle and merging are short "what happens while you watch" chapters; exact commands live on a separate lookup shelf. 3b equal depth everywhere. Steers page count per chapter and leaf sizes.
4. What happens to day-to-day jobs outside your four chapters (failed work, pause and stop, lessons, reports, rollback)? 4a (rec) a fifth chapter "While you are away and when work stops"; the rest moves to the lookup shelf. 4b fold each into the nearest chapter. 4c lookup shelf only. Steers the page list and what is cut.
5. What should the pictures look like? 5a (rec) 5 to 7 still pictures that show what you see (the three tabs, one Akrogon serving many repos, routes vs modes, A and B passing work, merge and overnight watch), readable in light and dark GitHub. 5b the same pictures with gentle motion on the arrows. 5c simple box-and-arrow charts. Steers the SVG leaf.
6. framework is private on GitHub. How do the setup docs show it? 6a (rec) by name, as the base repo that website and training are built on, with no links into it and no client names. 6b a made-up name ("your-base-repo"). Steers chapter 1 and its picture.
7. How do we know a product manager can follow it? 7a (rec) the charting chapter lands first, you read it, the rest waits on it; every page also passes a cold-reader agent that answers set questions from the page alone. 7b all chapters at once with the cold-reader check only. Steers leaf order and review.

## Taken

Operator 2026-11-27, verbatim:

1 - Whatever is currently the standard, you tell me what the best words are, and I'll tell you this is okay or not. | 2 - I'm giving you my ideal target audience based on the Crossing the Chasm book. Look it up, what it means, and see what the target audience I give you. This is the target we are waiting for:

# Target Audience Profile

## The Core Buyer (Crossing the Chasm)
As an **Innovator** and backend architect, you target **Early Adopters (Visionaries)** already past Step 1 with AI.

Picture one sharp, tech-adjacent operator who knows what an API, CRM, and prompt are, hates hype, and is too busy to write production code. They are not ignoring AI. They are already running agentic workflows, prompts, or Zapier/n8n chains and hitting the wall. Their setups keep breaking, leaking API spend, or requiring constant babysitting because they lack real engineering depth and reliable processes underneath.

## Two Buyer Segments
1. **Agency Owners & Implementation Partners (Primary / Highest Leverage):** Founders of 5–40 person SEO, paid media, web, or marketing ops agencies managing 15–50 client accounts. They know manual retainers are dying and need a serious backend architect while they handle client rollout.
2. **AI-Forward Mid-Market Leaders (Secondary / Direct High-Ticket):** Founders, COOs, VPs of Marketing, and Heads of Growth at $3M–$50M companies tired of flashy demos that break in production or hurt brand trust.

## Who You Ignore
* **Innovator Tinkerers & Indie Devs:** Love code trivia, copy ideas on Saturday, and rarely buy.
* **Pragmatic Local SMB Owners (dentists, roofers, med spas):** Want finished outcomes via partners, never AI systems.

| 3a - Those non-important parts, just mention them, what they do and how everything is done. So the documentation is complete, but focus on the ones that I told you about | 4a | 5 - Look at the Tamdoma branding. First look at https://tamdoma.ai, then create the same type of SVGs. Don't brand it with Tamdoma, just put the small attribution and logo in the bottom corners  (created by Tamdoma ("Tamdoma" = Tamdoma logo) | 6 - That was just an example. You can use any example of an upstream system. You can make it up. I'm probably thinking about open-sourcing the framework anyways. | 7a |

Door notes on the reply:
- 1: the door proposes the word list (Needs row 3); the operator's okay or change is the answer. Research: no single standard for human-in/on-the-loop (arxiv 2307.03681, boomi.com/blog/agency-ai-autonomy, read 2026-11-27), so loop terms are not used.
- 2: Moore's visionaries (Crossing the Chasm summaries, shortform.com/blog/pt-br/early-technology-adopters, read 2026-11-27) buy a business advantage, start with a pilot, want a whole solution and direct access to expertise. The docs speak to an operator who runs AI workflows that break, not to developers.

Account: the session puts charting first and deepest, written for agency owners and mid-market leaders who already run AI workflows; lifecycle, merging and the fifth "away and when work stops" chapter are shorter; minor features are named with what they do and how, never skipped; pictures follow tamdoma.ai's look with a small "created by Tamdoma" mark; the setup example uses a made-up upstream repo; the charting chapter lands first for the operator's read. It gives up developer-level depth in the guide and today's page structure.

## Needs

1. Leaf seats: writing on agy / neon / high, pictures on claude / claude-opus-5-5 / high (supplied by operator 2026-11-27). Destination: `slots:` block in each ISSUE.md.
2. Operator read of the charting chapter before the other chapters start (7a). Status: pending until that leaf lands.
3. Operator okay on the docs word list (signposts 1). Status: supplied 2026-11-27.
4. Tamdoma logo file for the corner mark (5). Source: /home/ivan/Work/infra/tamdoma/website/website/src/components/logotype.svg (pure paths; public/logos wraps raster). Status: supplied (found locally 2026-11-27).

## Correction 2026-11-27 (operator, verbatim)

This is okay, but don't put any marketing jargon inside. We are still writing for people who are somewhat technical, right? We just need them to understand the documentation and what Akrogon is all about by updating their mental model and not overcomplicating with technical jargon. But still, we don't want any marketing jargon in there. That will be a pure guide with examples on how to do something. You can insert a little bit of soft selling inside. | The naming convention. We can't call this quick fix because we're not always fixing. Sometimes we're implementing something really fast. | Also, we need to differentiate two things and make it very clear. The first thing is autopilot versus no autopilot, so we need a category for that. And the second thing is manual versus lifecycle route, so we need a category for that. I was thinking about mode and routes, but you tell me what the best thing is. You can consult with consultants. |

## Correction 2026-11-27 (operator, verbatim, second)

We also need to internalize it in the skills and inside of the system itself once we come up with categorization names and taxonomy names.

## Correction 2026-11-27 (operator, verbatim, third)

ok, this is it. Let's stick to it in the docs, as well as the entire codebase where needed

Approved names: category "Charting mode" with values No autopilot, Semi-autopilot, Full autopilot; category "Build route" with values Direct, Lifecycle; "manual" dropped; docs keep slot A (the builder) and slot B (the reviewer); "charting" stays the word for planning. Needs row 3 supplied 2026-11-27.


Operator correction after reading the charting chapter, 2026-11-27, verbatim

"1. ![alt text](image.png) <- It needs to use the full example. Which two consultants? Look at what I do. I use slot B, make it something, and slot C, make it something, mentioning the harness and the model and the efforts

2.  Everything else is great, but I would like to have more images to explain every section. The images look really, really good. The only thing is that the logo is not correctly positioned on the vertical axis. Or maybe it is. ![alt text](image-1.png)"

"I want all of the items and the new architecture to look like that. The content is really good. Great job done by the AGY Neon writer. One thing, tell him to remove the m dashes. This is a dead AI giveaway. Everything else is perfect."

"We need to rewrite everything like that. This is perfect. Tone and explanations, just add more images."

Door reading (A): image.png is the example line `/chart-issues Add a weekly client report export to client-portal. Use two consultants.`; every example that starts consultants names each slot with harness, model and effort, for example `Consultants: slot B claude, claude-fable-5-2, high effort; slot C agy, neon, xhigh effort.` image-1.png is charting-session.svg, where the "created by" mark sits slightly off the text line vertically. "Every section" means every `##` section of every guide page gets a picture in the charting-pictures style. Em dashes (—) leave every human doc page, including the already merged pages 04 to 08.

Applied to issues/parked/builder-docs-rest: guide-chapters (tone of 04 to 08, em dashes out everywhere, full consultant examples, guard test), new leaf charting-pictures-more (pictures per section of 04 to 08, logo placement), guide-pictures (picture per section of the rest).

Operator 2026-11-27, verbatim: "Same thing with installation and setup process. It needs to be easy to follow."
Door reading (A): pages 01 to 03 (install, repos, three tabs) get the same tone, depth and pictures as 04 to 08, written as steps a reader can follow in order.
