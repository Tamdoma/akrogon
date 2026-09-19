# Learn

Where leftovers go. Reviews produce three kinds of leftovers. Each has exactly one exit, so nothing piles up. I love this part — no drawer of almost-ideas.

Nit. A finding that's not a defect. Stays in the review file. At merge, A decides: a reusable rule becomes a lesson, real work becomes a seed. Not both, not neither. One exit. For export-csv, say B left a nit: CSV quoting should use the standard library, not hand-rolled quotes. Not a defect, tests pass, but worth remembering. That stays in review-B.md until merge, then A turns it into a lesson line about quoting.

Lesson. One line plus a history file. One line in learnings/LESSONS.md naming mechanism, date, and history path, plus a dated file under learnings/history/ with case, evidence, learning. Every plan reads the lines. Plans treat them as observations, not rules — history opened only to verify evidence. Lessons get pruned at chart open when they stop being useful; the chart offers a prune and you say what goes. I prune aggressively. Stale lessons are worse than none, they sound wise and steer wrong.

Seed. A GitHub issue. Filed with seed-issue. It posts to the repo named by issues_repo in a root akrogon.yaml when that file exists, otherwise to the repo own GitHub origin. A project that uses a framework gets that one-line file so its reports land on the framework. If it's about a skill, it goes to the akrogon repo, because skills only change through akrogon leaves. Otherwise it goes to the repo the work is in — for us, widgets.

Concrete use: export-csv review finds CSV is slow on 100k rows. Not a defect — done criteria did not mention speed — so it's a nit. At merge, A decides it's real work: files a seed streaming-export for later. That seed gets pulled, charted, becomes a leaf. Full loop. Nothing lost, nothing fixed without a plan.

Why agents don't fix nits as they see them? Then every review becomes a small implementation with no plan and no second reviewer. Nits become seeds, seeds become leaves, leaves get the full loop. Slow? A bit. Safer? Much. I've watched drive-by fixes break more than they fixed. Let the loop do it.

Previous: [Problems](problems.md) · Next: [Cheat sheet](cheat.md) · [Home](../../README.md)
