# Intake: builder-docs

## Scope

Destination: akrogon (registered root /home/ivan/Work/infra/akrogon). Rewrite the human, public-facing documentation (README.md, docs/ pages and docs/pictures SVGs) so a semi-technical, mid-market product manager who wants to build their own things with the software factory can follow it. The structure follows the operator's own working pattern: three tabs, charting first (routes, modes, signposts), then the lifecycle (slot A, slot B), then merging. Agent-facing files (AREA.md files, docs/reference-index.md as the agent code map, skills/) are out of scope. Grouping is proposed at the map.

## Provenance

- Operator: door message 2026-11-27 (c-akrogon, t126)

## Source: operator 2026-11-27

I'm still not happy with the documentation that is public facing on GitHub. It's still too technical, and the charts and SVGs are not intuitive to follow for semi-technical mid-market product manager people who actually want to build their own things with the software factory. So, in order to combat this, we're going to redo the structure To make sure that the documentation follows my own working patterns, and then you can add up. You can also confirm or deny that by looking at my open workspaces and the way we've been working on things for the past two weeks.

1. I always start with three tabs open in the single Herdr space: t-[repo_name], c-[repo_name], w-[repo_name]. The first one is the terminal where I run commands like Akrogon status and Akrogon next. This is basically like a terminal dashboard where you can see what's going on all the time. The second one is the charting tab where I have the main agent that I talk to where the charting process is happening. The third one is the Watcher tab. I turn the watcher on when I'm not on my computer. Especially overnight, so it can handle all the leaves and issues and fix if something fails.

2. I start with the charting process. So you need to explain the charting process in an easy to understand way to the target audience. Explain everything in detail, but make it very easy to understand. Explain the difference between routes and modes. This is very important. I want to emphasize how Akrogon is capable of doing quick fixes itself through the manual route As well as create more complex work through the lifecycle route. Also emphasize the difference between full autopilot mode, semi-autopilot mode, and no autopilot mode during the charting process and what type of work belongs to what mode. Emphasize the signposts as well. Separate these however you want to. Cover everything else that is important for day-to-day work. Do not get bogged down into technical details too much.

3. Then everything moves over to the lifecycle process. Explain slot A, slot B, and how they function and work together.

4. Then explain the merging process as well.

---

- You can rewrite the entire documentation architecture. We are only talking about human, public-facing, not the one that is meant for agents. Do this on autopilot mode, but I will do the signposts.
- Charting consultants: claude code fable 5.2 high effort, agy neon xhigh
- For actual writing of the content, you will use AGY Neon High as harness and model.
- For drawing SVGs, you will use Claude Code Opus 5.5 high Effort.

## Source: operator 2026-11-27 (second message)

Also, cover the installation, of course, and also show the relationship between the repos on the computer and how we need one akrogon installed on the machine, and how it ties into other repos. Also cover the upstream examples like framework. All of that goes into the first chapter that's all about installation and setup (or whatever you decide).

## Agent findings

- Current human docs: README.md (29 lines), docs/README.md (home), docs/start/ (5 pages), docs/use/ (14 pages), docs/reference/ (10 pages), docs/examples/ (4 pages), docs/pictures/ (19 SVGs); about 2282 lines of Markdown under docs/*/.
- docs/reference-index.md is the grounding index (`issues/config.yaml` `grounding.index`) and the agent code map, so it stays out of scope.
- Earlier charts on the same docs: beginner-docs (handed off 2026-10-23, 8 leaves, claude opus medium as slot A) and signposts-docs (handed off 2026-11-04). This chart replaces their structure.
- "manual route" in the operator's words reads as the direct route (the door builds one small settled change itself); the skill calls it `direct`. The door's reading, A's under autopilot, to be named in the docs vocabulary fork.
- "semi-autopilot" reads as the skill's `autopilot` mode (operator answers signposts, A answers forks); "full autopilot" is "autopilot signposts"; "no autopilot" is manual.
- Picture style source (signposts 5): tamdoma.ai is built from /home/ivan/Work/infra/tamdoma/website. Tokens in website/src/layouts/Layout.astro `:root` (read 2026-11-27): parchment #F4F1E6 page, ink #0F0F0F, sage #90A985 (scale #E7EDE2 to #5E7355), beige #E0DCCF/#C4C0B3, fonts Bricolage Grotesque (display), Schibsted Grotesk (body), Spline Sans Mono. Logo files: website/public/logos/tamdoma-logo-{light,dark}-bg.svg and tamdoma-logotype-{light,dark}-bg.svg. Diagram components to study: website/src/components/Station.astro, SystemIcon.astro, OnePager.astro. WebFetch could not read styles (returns markdown only).
