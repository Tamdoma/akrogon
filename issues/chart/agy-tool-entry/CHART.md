# Chart: agy-tool-entry

## Destination

Checked runs from an agy seat do not inherit the seat's tool-entry folder on PATH (Tamdoma/akrogon#164).

Route: direct

## Forks taken

- [fix-place](forks/fix-place.md): O3, constructedEnv strips the entry dir

## Open forks

## Fog


## Off route

- direct `bun test` from a seat shell with the entry dir or BASH_ENV, and realBash baking the host wrapper into scratch homes: seeded as Tamdoma/akrogon#165

## Pending steps

none

## Mode record

- mode 2026-11-27T10:10:59Z t126 /home/ivan/.claude/projects/-home-ivan-Work-infra-akrogon/cbe6ffb3-cf96-4e61-ac35-95fbfe7b9209.jsonl: off (no autopilot; operator answers decisions; builder-docs autopilot ended at its handoff)

## Direct attempt

Leaf check-path-entry, A t126, reviewer D t42t (codex gpt-6.2-sol high). One fix round (review-B.md F1: declared PATH restored the entry dir). Landed 5d425ea8381036e9ae0fa87ef91d7da9d0254a06; Tamdoma/akrogon#164 closed; release 5d425ea8 installed.

Closed 2026-11-27
