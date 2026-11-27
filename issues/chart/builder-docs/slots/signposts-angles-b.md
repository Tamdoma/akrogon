# Signposts angles: slot B

Read: INTAKE.md, signposts-draft.md, README.md, docs/README.md, CHART.md. Facts on docs/, src/, tests/ and the beginner-docs forks came from a Haiku reader; I checked the cited lines my points depend on.

## Suggested round (7)
Draft Q1 with option 1c below, then M1 to M6. Drop draft Q2, Q3, Q5 and Q6 (see "Draft questions evidence settles"). Fold draft Q4 into M5.

## Missed angles

**M1. Where does the reader start?** The last recorded reader (beginner-docs reader fork, operator "1a") "can open a terminal and has used one agent CLI". README.md:5 still says "for developers". The intake says product manager and no more.
- a (rec): a PM who already uses one agent CLI in a terminal on Linux and is new to git flow and to Akrogon. One "who this fits" box states the hard needs (Linux, herdr, one agent CLI).
- b: a PM who has never run a terminal agent. The guide teaches terminal, git and the agent CLI first.
- Steers: setup chapter length, which words get explained, depth, what is cut, the README pitch.

**M2. What happens to daily jobs outside the four chapters?** The outline is setup, charting, lifecycle, merging. Today's use pages also cover the watcher, failed work, park/pause/stop, save records, lessons, reports and rollback. Draft 3a deletes any page that fits no chapter. The operator named the w- tab and "fix if something fails".
- a (rec): a fifth chapter, "While you are away and when work fails". The rest moves to the reference shelf.
- b: fold each job into the nearest of the four chapters.
- c: guide holds the four chapters only. Everything else is reference.
- Steers: page list, what is cut, leaf split.

**M3. Where does the depth go?** The intake asks for "everything in detail" and also "do not get bogged down". These collide on every page.
- a (rec): depth follows where the reader decides. Charting gets the most pages and pictures. Lifecycle and merging are short "what happens while you watch" chapters.
- b: even depth across chapters.
- c: every chapter short, all detail in reference.
- Steers: pages per chapter, picture count, leaf sizes and split.

**M4. Which product words may the guide use?** Draft Q1 covers five names. The guide also meets leaf, seat, slot, door, fork, fog, handoff, contract, epic and phase.
- a (rec): a fixed short list of words the reader sees on screen (for example chart, leaf, slot A, slot B, signposts, route, mode), each explained once. Everything else in plain words. The operator approves the list.
- b: keep every product word and link the words page.
- c: plain substitutes everywhere ("task" for leaf), the product word once in brackets.
- Steers: every page, picture labels, what is cut.

**M5. What do the pictures show?** Draft Q4 asks only about motion. The complaint is "not intuitive to follow".
- a (rec): screen pictures. Each shows what the three tabs look like at one step. Plus one map of the whole path. Static, about one per chapter.
- b: flow diagrams as today, redrawn simpler.
- c: real screenshots.
- Note: 4a reverses the operator's 2026-10-23 ask ("We need SVG animations", motion "only where the concept is a sequence or loop"), so motion must be asked, not assumed. 5 of 19 pictures move today.
- Steers: the SVG leaf, picture count, labels, upkeep.

**M6. How is "a PM can follow it" checked, and does one chapter land first?** Two docs charts landed and the operator is still not happy. Tests check links, the command table and a few fixed strings. Nothing checks reading level or pictures.
- a: the charting chapter lands first as the pattern, the operator reads it, the other leaves are blocked-by it.
- b: all chapters in parallel. Each leaf passes a cold-reader agent that answers set questions from the page alone.
- c (rec): both.
- Steers: leaf order, leaf acceptance lines, B's review, leaf split.

**M7 (fork for A, or ask if room). One example carried through every chapter?** a (rec): one real change from a project outside Akrogon, followed through all chapters, private names removed (operator rule 2026-10-23). b: a small example per chapter. c: none in the guide. Steers picture labels, the examples folder, which leaf goes first.

**M8 (fork for A). Does the guide show a concrete seat setup?** a (rec): one named setup (which agent CLI and model sits at the door, slot A and slot B), no prices. b: `<model>` placeholders as today. Steers the setup and lifecycle chapters and how fast pages go stale.

## Draft Q1: add option 1c

1a puts "manual" on two things: the operator's "manual route" (the direct route) and the skill's "manual" mode (no autopilot). 1c (rec): one meaning per word. "Quick fix (direct route)", "lifecycle route", "no / semi / full autopilot", and "manual" is not used. The screen shows `akrogon direct` and `Route: direct` (src/akrogon.ts:131). The CLI never prints "autopilot", so the mode names are free. 1c drops the operator's own word, so it needs their answer.

## Draft questions evidence settles

- **Q3: settled, 3a.** Intake: "You can rewrite the entire documentation architecture." Operator rule 2026-10-23: "Nothing old that doesn't exist anymore shouldn't survive." Limits A must carry: three tests read fixed doc paths (tests/rollback.test.ts:140, tests/watch-timer.test.ts:1370, tests/command-reference.test.ts:8) and tests/docs-links.test.ts needs every link to resolve. src/ and skills/ link only docs/reference-index.md. What is still open is M2.
- **Q6: settled by code.** herdr is required, not recommended: README.md:13, src/direct.ts:54, src/hc.ts:281 (a repo needs a running session with a space named after it). Only the t-/c-/w- tab names are the operator's habit. Document herdr as required and the three tabs as the layout the guide follows.
- **Q5: mostly settled.** Operator rule 2026-10-23 (beginner-docs examples fork): private repo and client names are removed, public names stay. The machine config registers client repos, so 5b is closed. Two things remain. The door checks whether framework (origin Tamdoma/tamdoma-framework) is public before naming it. The door asks one plain question: what "upstream examples like framework" means for the setup picture (a base repo other projects are built from, or just a second registered repo). The repo docs never use "upstream".
- **Q2: settled, 2a.** The guide and reference split already exists (docs/reference/, words.md, where-things-go.md) and a test binds commands.md. The intake says "Do not get bogged down into technical details". The open part is M3.
