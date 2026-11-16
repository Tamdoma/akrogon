# Fork: skill-shape

Taken 2026-11-16. Drafted by consultant slot D (Fable 5.2, framework door consultant t1y1): [slots/skill-notes-D.md](../slots/skill-notes-D.md), brief [slots/skill-brief-D.md](../slots/skill-brief-D.md).

## Operator answers (verbatim, typed in framework door t1xr)
- Name: picked "mine-issues (Recommended)".
- Output place: picked "Akrogon state home (Recommended)".
- Client identity: "Keep the hard data, just don't mention the client name. The data is what gives the value, as well as how we solved something. The readers need to upgrade their mental model. So give everything important. The writer will cut it and edit it."
- Window and names: "Since the last file, but I can tell it whatever in the prompt. The default is to extract knowledge since the last extraction. Also, the files need to be named something like a ranged date or something (consult with D) to make it easy for me and the agents to find what we're looking for."

## Taken
- K1 Name `mine-issues`, operator-invoked only, every harness.
- K2 Pure SKILL.md, no script. Every step is reading, searching and writing two files, which each harness does. The operator expected "a couple of scripts". None is needed: install.ts links every `skills/*` folder (src/install.ts:27-30), and the only mechanical check (no client identity left in the file) is a search the agent already runs.
- K3 Sources: git log, issues records, charts, leaves, cited run and cost files, then transcripts searched for operator-typed messages only. `.env` files never opened.
- K4 Stories need a turn or a method, plus "only here" and "checkable". No cap, whole lists, bias to completeness. Empty window gives no stories.
- K5 Story record of plain fragments with fact ids; Stake, Default, How, Why, Insight and Rule required; Closed engine marks what the operator would sell. Default and Insight added 2026-11-16 after the operator asked: "So, why was something done instead of left as default? We also need some wisdom inside so that the essence is picked up as real useful knowledge for people."
- K6 Truth: every id resolves in the source list with path and line; disagreements keep both values; operator words only verbatim from the operator's own transcript; a final reopen of every cited line.
- K7 Only client identity removed (names, brands, domains, staff, addresses, phones, folder names holding them). Towns, vendors, phrases, numbers and mechanisms stay.
- K8 Files under `<state home>/materials/<repository>/`, named `<YYYY-MM-DD>_<HHMM>_to_<YYYY-MM-DD>_<HHMM>_<topics>.md`; source lists in `sources/` beside them; `part` runs never move the default window.
- K9 Default window: since the end of the last full extraction; the operator's words override it.

## Held
- slot D Q1: three topic words make names about 80 characters. Kept at three.
