# Skill draft notes: slot D

2026-11-16. Draft only, no repo edited. Read: `skills/{seed-issue,broadcast-issue,watch-issues}/SKILL.md`, `skills/AREA.md`, `src/install.ts`, `writer-persona.md`, `example-materials.md`. `A` = `/home/ivan/Work/infra/akrogon`.

## Operator answers applied (v2, operator-answers.md)
- N1 Name is `mine-issues`. The `harvest-issues` rename is reverted.
- N2 Output stays in the akrogon state home.
- N3 Sanitizing is client identity only: client, company and brand names, URLs, staff names, addresses, phones, and folder names that hold the client's name. Towns, vendors, phrases, numbers and mechanisms stay. The `keep "<name>"` option is removed, since nothing it allowed is stripped now.
- N4 Bias to completeness. No cap on stories, whole lists not samples, new fields `How`, `Why` and `Cost`, and a sixth kind of story, a method. `Closed engine` now marks the part the operator would sell, and the writer decides how much to show. The materials no longer hide it.
- N5 Window: default is since the last full extraction. Any words after the command set the window or scope.
- N6 Q5 keeps the default. The skill does not read the persona.

## Decisions
- D1 Name `mine-issues` (N1). Verb plus `-issues`, like the others. "Mine" says raw material comes out, not finished text.
- D2 Operator-invoked only. It reads the operator's own transcripts, and no lifecycle step needs it.
- D3 Pure `SKILL.md`, no script. Every step is reading, searching and writing two files, which each harness already does. A new skill folder needs nothing else: `install.ts` links every directory under `skills/` (`A/src/install.ts:28-40`), and no test or list names skills one by one. `A/skills/AREA.md` Key files gets one line.
- D4 Written records first, transcripts last. Forks, slot files, leaf reports and readiness files are already checked and cited, and they are small. One of today's transcripts is too large to load. Transcripts are searched for operator-typed messages only.
- D5 Two files. The materials hold the data and the mechanism in full. The source list holds every path, line and the keep-out list. Paths stay out of the materials because they often hold the client's name and teach a reader nothing.
- D6 Fact ids (`S2.4`) join the two files, so every number is checkable.
- D7 File name is the window plus topics: `<start>_to_<end>_<topic>_<topic>_<topic>.md`, local time, fixed width. Reasons, one per part:
  - Start first, so a plain `ls` sorts by time.
  - Both ends in the name, so the next default window reads its start from a file name and opens no file.
  - `_to_` and not `..`, because some tools refuse `..` in a path and shells glob it badly.
  - Up to three topic words from the strongest stories, so a person or an agent finds a subject with `ls` or a name search. Every story label is found with a search for `^## S` across the folder.
  - No index file. The names are the index, so nothing can drift from it.
- D8 A part run (one topic, chart or leaf) carries `part` in its name and is ignored by the default window. Otherwise a narrow run today would make tomorrow's default skip everything else in that span.
- D9 Source lists sit in a `sources/` subfolder under the same name. The top folder then holds only files that may go to the writer.
- D10 A story needs a turn or a method, plus two tests: only here, and checkable. "Only here" is what keeps out generic AI content. The stake test no longer drops items (N4). `Stake` is still the first field.
- D11 The skill writes fragments, never a hook line or a headline. `Hook fact` is a fact. Polished lines in the materials would put the skill's voice into every post.
- D12 Truth rules reuse akrogon's own: operator words only from the operator's transcript, as approvals are checked, and "an expected benefit is not a measured saving" from `broadcast-issue`.
- D13 The keep-out search after writing is the only mechanical check. It checks function (no client identity in the file). Story quality stays a judgment.
- D14 No questions during the run. Anything the operator must settle goes in `Operator checks` in the file and the footer. An invocation that can be read two ways takes the wider window and says so.
- D15 An empty window returns no stories.

## Better than the plan
- B1 The plan read transcripts first. D4 reverses it.
- B2 The plan had one output. D5 splits it, so every fact has a source and no path reaches the writer.
- B3 "New" also means not told before. Earlier files in the folder give that check for free.
- B4 Conflicts stay visible. Today's files disagree: the persona says "$0.28 core research", the example says "about $0.27". The skill gives both with sources and does not pick.

## Open questions for the operator
- Q1 Topic words in the file name make names long (about 80 characters). Keep three, or one?
- Q2 Should a part run ever move the default window? The draft says never.

## Risks
- R1 Transcript layouts differ per harness and change with versions. The text names folders, not formats. A harness whose layout moved yields fewer operator quotes, and the source list says which were skipped.
- R2 The keep-out list is built by the agent. A client name that appears in no record it read is not on the list.
- R3 Town plus trade plus size can point to one company in a small market. The operator chose to keep towns (N3). The writer persona still bans exposing town names, so the writer is the second filter.
- R4 Status drift: a `decided, not built` fact becomes true later, and the old file still says otherwise. The writer should use the newest file.
- R5 Size: with no cap and whole lists, a busy day gives a long file. On a harness with subagents the reading may be handed out. The draft does not require that.
- R6 "This session" depends on the harness exposing the conversation's start. Where it does not, the agent uses the first message it can see and prints the window it used.
