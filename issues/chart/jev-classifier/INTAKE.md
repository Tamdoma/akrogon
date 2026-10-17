# Intake: jev-classifier

## Scope
Decide whether akrogon should use Jev (TypeSafe's hosted classifier) or a similar decision API for cheap typed decisions, such as direct vs lifecycle and autopilot vs attended, without adding complexity or losing quality or speed. Destination: akrogon.

## Provenance
- Operator: /chart-issues argument, 2026-10-17

## Source: operator 2026-10-17
I want to explore the new classifier model called Jev. Look into it online and see if we can augment akrogon with it. The implementation shouldn't create more complexities, but actually improve what we have and even eliminate unnecessary code or pros if possible, without sacrificing the quality and the speed of the system. 'm pretty happy where we are right now. Think about processes where it can be useful, where we can create the classifications and then get cheap decisions made. For example, whether something should be done by you versus whether it should go into the lifecycle, and whether something should be done on autopilot versus not being done on autopilot, etc. (autopilot mode is being worked on, it's been charted). Consult with slot B and slot c in this tab, they're already active.

## Agent findings
- akrogon makes no model API call. Fuzzy decisions happen inside harness agent turns that must run anyway to produce reasons, reviews, plans or code (slots/map-merged.md).
- Volume, issues/log.jsonl 2026-09-11 to 2026-10-17: about 29 phase transitions, 5 merges, 7 reviews and 0.5 failures per day. watch-issues runs up to 72 ticks per day while on (slots/map-C.md).
- No TypeSafe key exists in ~/.config/akrogon/env.
