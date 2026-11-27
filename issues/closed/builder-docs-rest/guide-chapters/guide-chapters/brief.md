# Brief: guide-chapters

## What

Write the rest of the human guide in the tone and depth of docs/guide/04 to 08, which the operator approved as the model ("This is perfect. Tone and explanations"). Pages in docs/guide/:
- 01-install.md, 02-set-up-a-repo.md, 03-your-three-tabs.md: a check list of what the machine needs (Bun, herdr-core, herdr-app, one agent CLI), each with what a ready machine prints, then numbered steps from cloning Akrogon to `akrogon status` showing client-portal. Each step gives its command and what the reader should see. 01 includes cloning Akrogon and a full copyable machine config. 02 shows one Akrogon install serving a made-up upstream repo, acme-core, and two product repos built on it, client-portal and one more, plus `/init-akrogon` and grounding (the index file agents read first). 03 covers the herdr space named after the repo, which is required, and the t-, c- and w- tabs.
- 09-lifecycle.md: slot A (plans and builds in its own worktree) and slot B (reviews, repairs or sends back), how handed-off work starts (`akrogon next`, why a ready task may wait, the start order), what starts agent sessions, and watching from t-.
- 10-merging.md: one merge turn per repo, checks on the merged result, red going back to repair, an issue or epic completing, announcements.
- 11-while-you-are-away.md: the watcher in w-, keeping the heading `## What each check does`.
- 12-when-work-stops.md: failed work, park, pause and stop, ending with a link to the lookup shelf for other tools.

Pages 09 to 12 follow client-portal's `csv-export` and `scheduled-email` from page 08 through build, review, merge, the night and one failure. README.md becomes a short front door (what Akrogon is, who it fits, at most two sentences of soft selling, the chapter list) and carries no picture until setup-pictures adds the hero. docs/README.md becomes the chapter index, a short "Other tools" table linking shelf pages, and the shelf. Page 04's tab section shrinks to a link to 03, and 04's and 08's previous/next lines name 03 and 09. docs/reference/ pages switch to the approved words, and docs/reference/words.md maps each guide word to its shelf word. docs/start, docs/use and docs/examples are removed by a move map, with every inbound link fixed. The guard test gains the retired phrases.

## Why

The operator's working pattern is set up, three tabs, charting, lifecycle, merging, the watcher overnight. "Same thing with installation and setup process. It needs to be easy to follow." Rest shape R1 to R4 and R10 set this page plan.

## Done-criteria

1. Pages 01 to 03 and 09 to 12 exist with the content in What. 01 to 03 are numbered steps, each with its command and the expected result. 01 holds a full copyable machine config that works with one agent CLI, with real slot and harness values and no `<...>` placeholders, plus an optional block adding the other harnesses (agy included), and ends by checking `akrogon config`. 02 walks `/init-akrogon` on client-portal, shows what it writes, and ends by checking `akrogon status`.
2. Pages 09 to 12 carry the csv-export and scheduled-email example from page 08.
3. README.md and docs/README.md match What. Every guide page's previous/next line names its neighbours. Every link in README.md and docs/ resolves.
4. docs/start, docs/use and docs/examples no longer exist. The report holds a move map from every retired page to the page that now holds its facts, and slot B checks each row.
5. docs/reference/words.md defines the approved words and maps guide words to shelf words. docs/reference/where-things-go.md describes the new folders and keeps the picture-style lines unchanged.
6. Tests that read moved docs read the new paths and still check the same content: tests/rollback.test.ts reads docs/reference/roll-back-a-release.md, tests/watch-timer.test.ts reads docs/guide/11-while-you-are-away.md, and the run-permit and hold-retired sweeps pass.
7. The guard test from charting-fixes also fails when "manual mode", "manual route", "quick fix" or "autopilot signposts" appears, case-insensitive, in README.md or docs/**/*.md read from disk, or in tracked skills/**/*.md (`git ls-files`, as tests/docs-links.test.ts does, so vendored node_modules never count), on a line not starting with `Old record words:`. The report shows one deliberate break turning it red.
8. No em dash and no partial consultant example appears on any page this leaf writes (the dash guard covers the dash).
9. Slot B gives a fresh subagent inside its review session only README.md and docs/guide/01 to 12, and asks the questions in the design's `## Cold-reader questions`. Every answer matches and quotes its line. A wrong or unsupported answer is a Fix.
10. Every command, path, number and always/never/only rule on the new pages matches src/, skills/ or the machine config shape (harness launch lines match the live /home/ivan/.akrogon/config.yaml, the only source for them); the report lists each with its supporting path. Tone (no marketing jargon, no unexplained developer jargon) is slot B's reading, recorded with its reason.
11. The destination's `checks` pass.
