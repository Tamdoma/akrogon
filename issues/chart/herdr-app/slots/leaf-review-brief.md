# Leaf review: herdr-app handoff drafts

You are slot <X>. This is the mandatory leaf-writing review, asked by the operator before they approve the handoff.

## Read

- Drafts: `issues/chart/herdr-app/slots/handoff/` (akrogon epic `akrogon/herdr-app/`, herdr-setup issue `herdr-setup/herdr-app/`): every `EPIC.md`, `ISSUE.md`, `brief.md`, `design.md`, `readiness.yaml`, `state.yaml`.
- Decisions: `issues/chart/herdr-app/CHART.md`, the fork files under `forks/` (Taken sections are copied verbatim into each design), `forks/proofs.md` (P0-P10), `slots/needs-sheet.md`.
- Rules: the chart-issues skill's `assets/shapes.md` (Leaf files, readiness.yaml, Preflight and validation) and `assets/standing-design.md`.
- Code as needed: akrogon at `/home/ivan/Work/infra/akrogon`, herdr-setup at `/home/ivan/Work/infra/herdr-setup`.

## Review as the implementer of each leaf

For each leaf, answer: could you build it and pass every done-criterion within its ownership and dependencies, without guessing? Check:

1. A done-criterion that cannot pass, rests on something unproven (no `proofs` entry or only a proof's `limits`), names a test file or count, or claims repo health outside the leaf.
2. A binding decision with no home, or contradicted by a brief or architecture line; a missing or wrong exclusion.
3. A cross-leaf promise with no owner that accepts it, or a missing or wrong `blocked-by`.
4. A wrong file, function or consumer in Leaf architecture; an `Open for the plan:` item that is really a decision the plan cannot make.
5. A grant whose bounds, fixtures, cleanup or stop line are wrong or too small or too large for its live criteria.
6. Anything touching `issues/` inside a leaf.

Also judge A's own calls, each agree or disagree with evidence:
- D1: `engine-on-hc` deletes `plugin/` (cutover's removal list names it under the sweep).
- D2: repo prefixes in a top-level `prefixes:` map in `~/.akrogon/config.yaml`, added by the operator right after the engine deploys; dispatch refuses a repo without one.
- D3: notice contract `<app home>/akrogon-notices/<id>.json`, `{"title","body","attention"}`, temp name then rename.
- D4: six akrogon leaves under three issues (`hc-engine`, `hc-doors`, `herdr-removal`), order by `blocked-by` only.
- Paid budgets: engine 8, door 7, watcher 3, herdr-skill 8 sessions, plus 4 for the door's final proof.

## Write

`issues/chart/herdr-app/slots/leaf-review-<X>.md`: disagreements only, each with leaf, file, the line, the problem, evidence (path:line or proof id) and the fix you propose. Then one line each for D1-D4 and budgets: agree or disagree. End with `Verdict: ready` or `Verdict: changes needed`. Do not edit the drafts. Do not run `herdr-app do`, `herdr-app feedback` or any paid call.

Then report: `hc send t15 "done <X>: issues/chart/herdr-app/slots/leaf-review-<X>.md"`.
