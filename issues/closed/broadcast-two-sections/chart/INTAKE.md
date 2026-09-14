# Intake: broadcast-two-sections

## Scope
The completed-issue broadcast keeps its title line and date, drops to two sections (`Before`, `Now`), and every line is readable by a non-developer. `Now` states what is better about the system, not what code changed. One issue, one leaf: skill text, sender script, sender tests, guide page.

## Provenance
- Operator: chart-issues invocation 2026-09-14

## Source: operator 2026-09-14
We need to simplify the broadcast issue scale. First of all, we should remove the now section because it doesn't make any sense. It should just have the before and the next section should be called now. Also, the message has to be idiot-proof. No complex things. Just what was before and what is it now? And inside of that section of what is it now, us t make it a thing. State w what's better now about the system. Also, I'm fully open on you creating the the map and the territory because I just want the skill to display useful information without overwhelming the user The users are generally beginners And they're coming from different departments, mainly marketing and development, but also design, account management, etc. So the messages need to be universally capable of being read, simple but have to communicate how the process improved something from the state before (or when something new was added). I don't want to touch the titles. The titles are good. I mean the title format is good, but the thing after the column can also change except for the date. When I say change, it can be simplified. o in one sentence. Or one title they will know what it's all about. Look at the whole intent and let's see what can happen. That is my destination.

## Agent findings
- Message shape lives in four places: `skills/broadcast-issue/SKILL.md` (prose rules, JSON example), `skills/broadcast-issue/scripts/discord-send.ts` (`messageSchema` requires `summary`, `before`, `now`, `next`; `chunks()` renders `## 🧪 <summary> (MM/DD/YY)` then `**Before**`, `**Now**`, `**Next**`), `scripts/discord-send.test.ts` (fixtures and exact-content assertions on the three sections), `docs/guide/merge.html` lines 65–76 (worked example with three sections).
- `merge-issue/SKILL.md`, `init-issues/SKILL.md`, `README.md`, `docs/guide/{cheat,limits,problems,phases,setup}.html` mention the broadcast but not its section shape. No change needed there.
- `messageSchema` is a strict object, so once `next` leaves the schema an old three-key payload fails validation before any send. No migration path is needed.
- Chunking at section boundaries is section-count agnostic; two sections still split correctly at 2000 characters.
- Current SKILL.md already forbids jargon, internal paths, model names and test statistics. It does not forbid file names, command names, code identifiers or unexplained acronyms, which is where developer-written bullets leak complexity.
- Live env: `~/.config/akrogon/env` defines both configured targets. An earlier claim that the second was missing came from a grep character class that excluded digits; corrected 2026-09-14.
- Root `bun test` is scoped to `tests/` by bunfig, so the sender tests run only through `bun test` inside `skills/broadcast-issue/`.
- No open leaves, no seeds, no chart or closed folder named broadcast-*. No duplicate.
