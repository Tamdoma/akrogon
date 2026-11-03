# Slot B rebuttal

Evidence checked 2026-11-03. “Installed” means better-than-training evidence. Recommendations below are inference from that evidence.

- **F1. Needs-you is overstated as settled.** Include pending questions from done/idle agents, not every done agent. `done` only means unseen completion and becomes idle on viewing. B did not endorse status alone as proof of a question. “Question text only from hc read” also overclaims: that API returns a possibly incomplete screen/history excerpt, not an identified question. Keep the pending-question source unresolved until harness probes or a producer establish it. Installed: `/home/ivan/.config/herdr-app/herdr.d.ts:164`, `:209`; `hc schema` → Status/ReadResult; B map **D8. A5 Needs-you source and reply transport**.

- **F2. B's structured A6 source should win.** A trailing coded block or strict grammar cannot establish assistant authorship, current-question identity, or whether text is quoted. The terminal schema exposes status/turn, not messages or choices. Require an identified decision record for reliable detection. Without it, obtain agreement to best-effort draft suggestions. Installed: `/home/ivan/.config/herdr-app/herdr.d.ts:209`; `hc schema` → Terminal/ReadResult. Inference: prose formatting cannot supply missing identity.

- **F3. B's reply transport should win over always-force.** `--force` explicitly types through blocked dialogs. An explicit Send does not make ordinary text the correct input for permission/auth menus. Use `--if idle` for idle prose and open native approval controls unless a dedicated interaction is proven. Installed: `hc send --help`; B map **D8. A5 Needs-you source and reply transport**.

- **F4. Reusing akrogon's slow judgment cannot implement phase redness.** Its baseline measures completed merge verification runs, excludes reused/blocked commands, and requires five eligible samples. That is neither current phase age nor a baseline for plan/implement/check. B's defined-baseline requirement should win over inferred fallback thresholds. Installed: `src/verify.ts:171`, `:177`, `:367`.

- **F5. Cwd matching cannot satisfy leaf-to-seat navigation.** A/B can share one worktree, and a recovered shell can retain that cwd. B's identity contract should win: repo/leaf/seat plus core/session and live agent validation. Cwd can locate a checkout, but cannot prove the intended seat. Installed: `/home/ivan/.config/herdr-app/herdr.d.ts:209`; `hc schema` → Terminal.address/labels/foreground. Inference: shared cwd does not uniquely identify a seat.
