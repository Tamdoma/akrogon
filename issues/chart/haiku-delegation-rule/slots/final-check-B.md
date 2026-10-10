# Final check B

Frontmatter: no defect. `name`, `description`, `model: haiku`, `tools` as a comma-separated string are all valid; only `name` and `description` are required; a user agent named `Explore` overrides the built-in. Evidence: better-than-training, https://code.claude.com/docs/en/sub-agents, read 2026-10-10.

Two contradictions inside final-haiku.md:

1. "Narrow lookups: one query, number, or fact; specific questions over given documents" in the Send-to-Haiku list contradicts Route rule 1, "if one search or read answers the question, do it yourself", and the taken search-routing 2a (one search inline). A one-query lookup is the inline case. Fix: drop "one query, number, or fact" and keep "Narrow lookups: specific questions over documents you have not opened". Evidence: forks/search-routing.md, Taken 2a, read 2026-10-10.

2. Hand-offs last line, "Skip delegation only if the task needs back-and-forth with me", contradicts Route rule 1, which names four other inline cases (one answering call, file you edit next, exact text in context, single page). "Only" makes the Route list a violation of the Hand-offs line, and the memory doc says contradicting instructions get picked arbitrarily. Fix: "Beyond the inline cases in Route rule 1, skip delegation only if the task needs back-and-forth with me." Evidence: better-than-training, https://code.claude.com/docs/en/memory, read 2026-10-10.

No taken answer missed, no loop reopened, no defect in final-Explore.md.
