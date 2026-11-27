# Brief: guide-chapters

## What

Write the rest of the new human guide in the style the operator approved in the charting chapter. This leaf consumes the charting pages from charting-guide, which it links and follows, and the skill words from taxonomy-rename, which the guard test checks.

- README.md becomes a short front door: what Akrogon is, who it fits (a fit check: Linux, herdr, one agent CLI), one or two sentences of soft selling at most, and the chapter list.
- docs/README.md becomes the chapter index plus the lookup shelf.
- New pages in docs/guide/:
  - 01-what-akrogon-is.md
  - 02-install-and-repos.md: one Akrogon install per machine serving many registered repos, with a made-up upstream base repo and two product repos built on it.
  - 03-your-three-tabs.md: the herdr space named after the repo, and the t-, c- and w- tabs with what runs in each.
  - 09-lifecycle.md: slot A, the builder, and slot B, the reviewer, and how they pass work.
  - 10-merging.md
  - 11-while-you-are-away.md: the watcher in the w- tab.
  - 12-when-work-stops.md: failed work, park, pause and stop.
  - 13-other-tools.md: lessons, reporting an observation, saving records, writing issues by hand, rollback and announcements, each with what it does and how to run it.
- docs/reference/ pages switch to the approved words. docs/start, docs/use and docs/examples are removed, with every inbound link fixed.
- Tests that read moved content follow it.
- A guard test bans the retired phrases.

## Why

The operator's working pattern is set up, then three tabs, then charting, then lifecycle, then merging, then leaving the watcher on overnight. The current start/use/examples layout follows none of that and is too technical for the reader (intake, signposts 2 to 4). Minor features are named and explained briefly so the docs stay complete (signposts 3a).

## Done-criteria

1. README.md says what Akrogon is, who it fits, and lists the guide chapters linking docs/README.md. It names no retired phrase.
2. Pages 01 to 03 cover:
   - what a machine needs
   - why one Akrogon install serves every registered repo on the machine, shown with the made-up upstream repo and two product repos
   - setting up a repo with `/init-akrogon`, and grounding (the index file agents read first)
   - the herdr space named after the repo, which is required
   - the t-, c- and w- tabs as the daily layout: `akrogon status` and `akrogon next` in t-, the charting agent in c-, and the watcher in w-
3. Page 09 explains slot A (plans and builds in its own worktree), slot B (reviews blind, repairs or sends back), how a task moves between them, how handed-off work starts (`akrogon next`, why a ready task may wait, and the order tasks start in), and how to watch it from the t- tab. Page 10 explains what happens after review: one merge turn per repo, checks on the merged result, a red result going back to repair, and an issue or epic completing. Page 11 explains what the watcher does every 20 minutes and what still waits for the operator, keeping the heading `## What each check does`. Page 12 explains failed work and park, pause and stop. Page 13 covers each minor tool listed in What with what it does and how. One section names what starts agent sessions (consultants, slot A, slot B, the watcher), without prices.
4. docs/start, docs/use and docs/examples no longer exist. docs/README.md lists every guide page 01 to 13 in order and the reference shelf. docs/reference/words.md defines the approved words. docs/reference/where-things-go.md describes the new folders. Every guide page's previous/next line names its neighbours, including 04 back to 03 and 08 on to 09. Every link in README.md and docs/ resolves.
5. Tests that read moved docs read the new paths and still check the same content:
   - tests/rollback.test.ts reads the rollback steps at docs/reference/roll-back-a-release.md
   - tests/watch-timer.test.ts reads docs/guide/11-while-you-are-away.md
   - the run-permit and hold-retired doc sweeps still pass
   The destination's `checks` pass.
6. A test fails when "manual mode", "manual route", "quick fix" or "autopilot signposts" appears, case-insensitive, in a tracked Markdown file under README.md, docs/ or skills/ on any line not starting with `Old record words:` (the line taxonomy-rename wrote), and passes on the delivered tree. The report shows one deliberate break turning it red.
7. Slot B gives a fresh subagent inside its review session only README.md and docs/guide/01 to 03 and 09 to 13, and asks the questions in the design's `## Cold-reader questions`. Every answer matches and quotes its line, recorded in the review. A wrong or unsupported answer is a Fix.
8. Every behavior claim matches src/, skills/ and the machine config shape. The report lists each claim with its supporting path. Tone (no marketing jargon, no unexplained developer jargon) is slot B's reading, recorded with its reason.
