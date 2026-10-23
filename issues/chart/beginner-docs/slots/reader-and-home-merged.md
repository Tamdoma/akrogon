# Merged notes — reader-and-home

Q1
- (a) terminal user who has used one agent CLI, clean-machine install path (A,B). Reason: Linux + systemd user manager, Herdr, Bun, Git, flock, gh, a harness CLI are fixed by the tool (install.md Prerequisites; src/install.ts; src/scope.ts uses systemd-run). Concepts written so anyone understands them; install states the floor up front. Cost: install chapter must start before the checkout (get the repo, write ~/.akrogon/config.yaml, PATH) — src/config.ts readGlobal throws without config (B).
- Prepared-machine readers get a short skip-ahead after a readiness check, same tutorial (B). (A silent, agrees.)
- (b) rejected as the main promise: prepared-machine-only onboarding leaves public readers without a setup path (B); A also claimed no prepared-machine product exists (A, unproven per B rebuttal). (c) rejected: promise the tool cannot keep (A,B).
- Boundary: "clean machine" = a Linux desktop session with systemd running; no OS install, no macOS/WSL workarounds (B; A agrees).
Q2
- (a) repo Markdown, no build (A,B). Reason: versioned and reviewed with code, agents read the same files, grounding index stays. Cost: no site search, small hand-kept nav, link/anchor checks (A,B).
- (b) Pages rejected for now; fine later if search is needed, can reuse the same Markdown (B). (c) wiki rejected: separate .wiki.git repo, so code and docs cannot land in one commit and agents need a second checkout (A,B; "outside review" withdrawn per B rebuttal).
Evidence: install.md, src/install.ts, src/config.ts, src/scope.ts, package.json (no doc toolchain), GitHub Docs Pages and wiki pages read 2026-10-23 (B).
Pitfalls: hidden floor (removed by a "what you need" box on README and first-run page) (A,B); tutorial only works on a configured machine (trace against missing config/checkout/PATH) (B); credentials in examples (placeholders only) (B); moved pages break links — correction: grep finds no docs/guide links in skills/ or src/, inbound links are README and docs/reference-index.md; inventory and update them in the same leaf (A,B).
Differences: none.
