# A notes — reader-and-home

Q1 pick (a): terminal user with one agent CLI, plus a clean-machine install path. Reason: the floor is fixed by the tool (Linux with systemd user manager, Herdr, Bun, Git, flock, gh, a harness CLI; docs/guide/install.md prerequisites). Docs can explain every step but cannot remove these. Cost: true non-developers are told on page 1 what they must have first.
Rejected (b): no "prepared machine" product or handoff exists; promising it invents a support path. Rejected (c): the tool runs in a terminal multiplexer and needs approvals in a shell; the docs would promise what the product cannot keep.
Evidence: install.md prerequisites (better-than-training, read 2026-10-23); src/install.ts links skills into four harness homes.
Pitfalls: page 1 hides the floor → reader fails at install. Removed by a "what you need" box at the top of README and the first-run page.
Q2 pick (a): repo Markdown. Reason: no build or deploy, versioned with the code it describes, the same files are the agents' grounding (docs/reference-index.md), skills link docs/guide paths. Cost: no site search or custom nav; GitHub shows a heading outline only.
Rejected (b): a build, a Pages deploy and nav config to keep in sync; agents still read source Markdown. Rejected (c): wiki is a separate git repo, outside leaf branches and review, drifts.
Pitfall: inbound links to docs/guide/*.md from skills and src break on moves → keep paths or update every reference in the same leaf.
Extra question: none.
