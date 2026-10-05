# Brief: seed-cause-evidence

## What
Change `skills/seed-issue/SKILL.md` and the seed-issue section of `docs/guide/create.md` so a filing from any consumer repo:
- reads the files the failure names, one hop further, file reads only, before writing;
- adds a last `## Suspected cause` section holding a labeled, unverified hypothesis or the evidence gap, with files read and installed or vendored copies flagged;
- runs two read-only GitHub lookups on the routed repo and links related reports, open or closed, each with a reason;
- prints one ready `/seed-issue` root-report line above the footer when an unfiled shared cause qualifies;
- keeps titles to what was seen.

It still creates exactly one issue per run with `gh` as the only added dependency.

## Why
Tamdoma/akrogon#56: in one consumer session, seed-issue filed four symptom reports (Tamdoma/tamdoma-framework#124-#127) for one design gap. The shared cause came out only when the reporter asked and filed #128 by hand, because the skill forbade diagnosis and never looked for related reports. The chart door already verifies and groups seeds by cause (chart-issues consolidation), but it can only group what the seeds carry.

## Done-criteria
1. A filing with a supported cause posts all five original sections filled as before, plus a last `## Suspected cause` section. That section holds the conditions (main and contributing, no wider than the evidence), whose view it is, each file read, what was not inspected or would disprove it, and the related-reports line. Installed or vendored copies are flagged from inspected provenance, and the section says when the link to destination source is unverified. (A; unverified-link clause C) Observation holds only what was seen. A replay of #124's input puts the checkManifestRule reasoning in Suspected cause, not Observation.
2. A filing without a supported cause still posts. Suspected cause states "no supported hypothesis" plus the evidence needed next, never a bare "Not provided", and never assumes a chart pass follows. (A; chart-pass clause C) "Not provided" stays legal in the five original sections.
3. A reporter suspicion contradicted by inspected evidence is stated as contradicted, with the evidence.
4. Discovery during a filing reads files only. It runs no project command, install or edit, and stops at a supported hypothesis or a named evidence gap after one hop past the files the failure names.
5. The related line lists linked reports as `owner/repo#n` with a reason each, or "none found", or "search failed" with command and error after one retry with a visible warning. In every case it records the repo, query, states and limit searched. Candidates are judged by their body, not title alone. (B,C) A closed precedent is linked as evidence. An unrelated keyword match is not linked. Unrelated symptoms from one session are not linked to each other. In a fresh-session replay where the earlier same-day reports belong to the authenticated filing account and fall within the limit, the filing lists them, and the line states the account, date window, query and limit covered rather than claiming the whole session was found. (B) A failed lookup, an empty lookup and a failed creation give three distinguishable outcomes.
6. A filing whose lookup fails still creates its one report and states the failure in the body and the final outcome.
7. No filing comments on, labels, or changes the state of a linked issue.
8. Exactly one issue is created per run. The root-report line prints only when all five trigger conditions hold. It names the suspected condition, the report identities and the evidence limit, never a fix, and the footer stays `Next: none` with its reason naming the printed line. In a replay of #124-#127 without #128, the line prints after #125 or, at the latest, after #127, and never after #124 or #126. (C) A filing after #128 exists links #128 and prints no line. An unsupported cause, a failed lookup, a cause-statement report and a failed creation print no line.
9. A replay of #126's input gives a title without the parser diagnosis. A title names a cause only when the reporter's statement is itself a cause, and marks it suspected.
10. Related links appear as plain `owner/repo#n` text in the body passed to `gh issue create`. (C)
11. The skill stays under 300 lines and 4k tokens. The implementer counts rules by the design's method, lists each counted rule in the implementation report and lands under 20, and the reviewer confirms the list. If it cannot fit without losing meaning, the attempt ends with the count and rule list in the implementation report instead of exceeding the cap. (C) The skill uses no harness-specific tool or syntax apart from the printed `/seed-issue` prefix, its only added dependency is authenticated `gh`, and harnesses not exercised are named as unproven. (C)
12. `docs/guide/create.md`'s seed-issue section describes the Suspected cause section, related links and the root-report line. It describes the bounded discovery attempt and its evidence limits, while retaining that missing details and unsupported causes are not invented. (B)
