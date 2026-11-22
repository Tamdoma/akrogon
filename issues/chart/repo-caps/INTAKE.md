# Intake: per-repo leaf caps

## Operator words (2026-11-22, verbatim)

"we can also chart the Akrogon capability to limit the number of active leaves on a per repo basis inside of the repo. So we will have one global option, which we already have, which is right now set to nine, but then we can also limit it on a per repo basis. For example, inside of the framework repo, we can set up somewhere in the existing confq file inside of the issues how many leaves can be active at the same time. So, all of the local limits always are precedented, and then they can never go above everyone in total above the max allowed on the PC"

"The oldest one waiting the leaf. Also, you gave me a good idea. Maybe we set a priority list, which would be another property in the config file inside of the repo. Something similar to the WordPress system, where the lower the number, the bigger the priority. Is that feasible? You can consult with consultants to give you a better option and challenge me if possible."

"If this is not the best option, you can ask them to give you a more elegant, less mentally straining, and less cold option."

"Yes, build it yourself and use slot E (sol 6.2) as your reviewer."

## Context

The global cap is `max_active` in ~/.akrogon/config.yaml (9 now; src/config.ts:25, enforced in `activeCount`/`allocate`, src/next.ts:369-415). Motivation: host overload makes lands and suites fail (Tamdoma/akrogon#147, chart land-reds).

## Taken (operator, 2026-11-22)

Q1 yes, "ok, go with your recommendation": per-repo `max_active` in issues/config.yaml under the machine `max_active`; no priority key (B, C: cross-repo numbers, static urgency, starvation); a freed slot auto-starts the longest-waiting leaf refused for capacity that fits both caps, never a leaf that was not refused. Built by A on the direct route, slot E (codex gpt-6.2-sol high) reviews.

## Taken (operator, 2026-11-22): Q3

"o1, go": a refused `akrogon seat` only fails and never joins the refill; only `next` pass refusals wait on capacity. This narrows the Q1 rule above.
- Q4 O1 (operator, "o1, go"): the refill's own timing reads drop to one per repo per pass before landing (A's proposal as put: "read the file once per repo per wake and reuse it", about 1.2 s added instead of 2.4 s on three repos). The reads main already does per dispatch (visit check, recordWait) stay for Tamdoma/akrogon#149 P9, which the operator chose as the place to fix all timing reads (Q4 O2 text).
