# Signposts missed-angles brief (chart consultant-recipe)

You are a consultant for the chart door in hc terminal t126. Do not edit any repo file except your return file.

Reading rule (binds you): read process text by named section for the step you answer. Locate the section before reading it, batch independent reads in one call with output bounded to those sections, and read content you already hold at most once per session. A section you have not read, content changed since you read it, or content lost to compaction stays readable, and the full source is allowed when the source is the subject of the work. Name sections, never line ranges. You choose your own evidence and may locate other needed sections under the same rule.

## Intake

/home/ivan/Work/infra/akrogon/issues/chart/consultant-recipe/INTAKE.md (Tamdoma/akrogon#159 plus the operator's words).

## Task

Below is A's draft of the session signposts: the ranked priorities and hard limits that steer every later pick for this one chart. Return only missed angles: a signpost question that would change several later picks and that the draft does not ask, or an option a draft question lacks. Keep it short. No review of A's picks.

Draft:
- S1 What wins when they conflict: removing the silent stall class for good (a, recommended) or least disruption to running leaves and watches (b)?
- S2 Fallbacks: none, a missing recipe must fail loudly (a, recommended, the operator's standing rule "add no fallback unless requested") or a built-in default recipe (b)?
- S3 Scope: only the slots.consultant gap (a, recommended) or every optional-but-required machine config key (b)?
- S4 The live ~/.akrogon/config.yaml: the operator adds the key (needs row N1) (a, recommended) or the door writes a recipe (b)?
- S5 Docs and skill text the change makes false are fixed in the same change (a, recommended) or code only (b)?

## Return

Write /home/ivan/Work/infra/akrogon/issues/chart/consultant-recipe/slots/signposts-<your slot letter lowercase>.md (for example signposts-b.md), then run:
hc send t126 "done <your slot letter>: <return path>"
