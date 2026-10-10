# Haiku 5.5 for routine work

Haiku is far cheaper and faster than you, weaker at hard reasoning. Because it costs a fraction of you, the usual default to do small reads and lookups yourself does not apply to the work listed below: send it to Haiku. Keep the judgment: planning, hard debugging, design, final review, and talking with me. The reading those need still goes to Haiku. Haiku never plans, designs, reviews or decides, and never runs lifecycle skill work; those skills choose their own agents. If you are Haiku, ignore this file.

## Route each job
1. Inline or hand off: if one search or read answers the question, do it yourself. If it does not, hand the rest to Haiku instead of taking a second call. Also keep inline: a file you will edit next, the exact text already in your context, a single web page, or a task that needs back-and-forth with me.
2. Haiku or you: if the output is facts you can check by opening cited lines, send it to Haiku. If it is an explanation or a judgment you must defend, use your own model: call Explore with `model` set to your model, or do it yourself.
3. Explore runs on Haiku by default. If a Haiku return fails your spot-check, or flags low confidence or needs judgment, rerun it on your model.

## Send to Haiku: the Explore agent, or any subagent with `model: "haiku"`
- Explore: answer questions from files, logs or transcripts you have not opened; search, locate implementations, pull facts across files
- Summarize: articles, reports, transcripts, support threads, documents
- Extract to JSON: names, dates, prices, companies; bulk records
- Classify: tickets, documents, leads, requests
- Compress large tool output, logs, or file sets before they reach you
- Mechanical edits with a clear spec (renames, configs, one component); you review the diff
- Triage bugs: inspect the error, guess the cause, gather files; you fix
- Multi-page web research and repetitive browser work: forms, moving data between apps, scraping into structure
- Narrow lookups: specific questions over documents you have not opened
- Test-verified attempts: run several in parallel, each with a different approach

## In code you write: default to `claude-haiku-5-5` for
- Live support, chat, fast Q&A, latency-sensitive voice turns
- Recurring batch jobs: scheduled reports, spreadsheet processing, eval pipelines, bulk summarize/extract/classify
Use a stronger model only where a step needs real reasoning; say why in a comment.

## Hand-offs
- Subagents don't see this chat: give the goal, the decision the output feeds, known paths, and exact output format.
- Require from Haiku: path:line or source refs per claim; list of inputs read vs skipped; anything surprising, contradictory, or possibly relevant beyond the question, flagged rather than dropped; low-confidence items marked.
- Spot-check only the cited lines your decision depends on. If something expected is missing, follow up with the same subagent instead of redoing the work.
- Keep each task well under 100K tokens (pricing rises above that); split big jobs.
- Pass `effort: "high"` for mechanical edits and bug triage; leave other Haiku tasks at default.
