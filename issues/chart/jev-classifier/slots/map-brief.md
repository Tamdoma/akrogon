# Opening map brief (chart-issues door, blind)

You are a charting peer. Write your own independent territory map. Do not read other slots' maps.
Return file: /home/ivan/Work/infra/akrogon/issues/chart/jev-classifier/slots/map-<slot>.md (moved from the door temp dir after return)  (B -> map-B.md, C -> map-C.md). Write only that file. Change nothing else in any repo.

## Intake (operator, verbatim, 2026-10-17)
"I want to explore the new classifier model called Jev. Look into it online and see if we can augment akrogon with it. The implementation shouldn't create more complexities, but actually improve what we have and even eliminate unnecessary code or pros if possible, without sacrificing the quality and the speed of the system. 'm pretty happy where we are right now. Think about processes where it can be useful, where we can create the classifications and then get cheap decisions made. For example, whether something should be done by you versus whether it should go into the lifecycle, and whether something should be done on autopilot versus not being done on autopilot, etc. (autopilot mode is being worked on, it's been charted)."

## Live surface
- Repo root: /home/ivan/Work/infra/akrogon (main at f7baddc, equal to origin/main). Read docs/reference-index.md, src/AREA.md, skills/AREA.md, learnings/LESSONS.md.
- Door skill: /home/ivan/.claude/skills/chart-issues/SKILL.md (Direct route section = "done by you vs lifecycle").
- Autopilot chart (handed off 2026-10-17, leaves implementing now): issues/chart/autopilot/CHART.md and forks/*.md; leaves under issues/open/autopilot/.
- Other skills: skills/*/SKILL.md (watch-issues runs on a 20-minute cron).
- akrogon today calls no model API itself; judgment happens inside harness agent turns (claude, codex, pi). No TypeSafe key exists in ~/.config/akrogon/env.

## Jev facts gathered so far (verify and extend online yourself)
- TypeSafe AI, released 2026-09-15 early access. Hosted, proprietary. Returns typed decisions (noul yes/no, choice up to 255 options, score) with probabilities; no text, no reasoning. Docs https://docs.typesafe.ai/primitives ; launch post https://typesafe.ai/blog/introducing-system-one-models-and-jev
- $0.042 per million input tokens, output free; 70-500 ms; up to 64k tokens per request; pinned model jev-1.13.0 or jev-latest.
- Reviews: inovex (calibration poor on new data, weak at counting, dates, multi-step inference, prompt injection, contradictory answers across related questions); akitaonrails benchmark 2026-10-10 (97.6% on its set; "rules belong in code, the model turns free text into structured fact"). OpenAI Decisions API, Microsoft Decision-1, open Kev models exist.

## Existing locks
- Autopilot boundary (issues/chart/autopilot/forks/boundary.md): inside autopilot A answers every question; no direct route in autopilot; approvals wait for operator.
- Off route there: no new timers, daemons or polling (seat-stall-detection lock 2026-09-18).
- Operator principles: simplicity, function over form, removing over adding, speed, price. "Pretty happy where we are."

## Your map must contain
1. Candidate decision points in akrogon (code or skill text, cite path:line) where a cheap typed classifier could replace an LLM turn, a brittle heuristic, or code. For each: current decider, volume per day, what it costs now, what Jev would remove, what it adds (key, network, vendor, failure domain), and whether a rule in code beats both.
2. The two operator examples (direct vs lifecycle, autopilot vs not): is a classifier the right tool, given what decides them today?
3. Material forks and practitioner questions, pitfalls over the work's lifetime, what each option could break or invite later.
4. Your own recommendation, including "do nothing" if that is what the evidence says.
5. Evidence lines with tier (operator, practitioner, better-than-training, model-knowledge), source, date read.
Keep it compact (under 150 lines).
