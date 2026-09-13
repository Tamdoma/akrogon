# Bootstrap

Chart skill version: 4

Status: resolved
Type: grilling

## Question

How is this chart implemented before the thing it describes exists? The deliverable is the `akrogon` command, the herdr plugin and the seven skills, and the issue lifecycle that would normally build a leaf is that same deliverable. The old repo is deleted when charting ends, so the July 28 lifecycle is not a fallback. Which leaves are built by hand-driven sessions from the handoff briefs, and from which leaf onward does the new command run its own remaining leaves?

Opened 2026-09-08 from the # Distribution challenge answer. Operator question, verbatim: "how is this very chart going to be implemented?"

## Findings

Slot A (Claude, blind): four questions, hand-built first leaf from the briefs with slot A coordinating over herdr; tool runs itself from the next leaf; tool repo is its own first consumer; reference folders deleted at the end. Evidence: intake line 9 (July by hand 185 issues, August automated 37, tier 1 first hand).

Slot B (Codex, blind): six questions: complete path for one real leaf before automation (Rajasekaran, Anthropic harness, 2026-03-24, tier 1); who coordinates panes by hand (Carlini 2026-02-05, tier 1); installer run from source once then installed path (Bun docs, tier 2); takeover proof = one hands-off merge plus one repair exercise; automation starts on a fresh leaf (Young 2025-11-26, tier 1); broken dispatcher repaired in a direct session and recorded as failed automation.

Merged 2026-09-08 into seven questions, tagged (A), (B), (both). Rebuttal, slot B: Q1 the path is not complete without plan-issue and broadcast; Q4 cleanup must not depend on init landing later; Q7 delete reference folders only when nothing in the handoff or archived chart points into them. Accepted into the wording: first automated leaves are elected without debate, init is part of the first hand-built leaf, Q7 condition kept.

Operator answers 2026-09-09: 1-A, 2-B ("would it be better for me to do one pass manually while you two are guiding me ... for my mental model. If you don't disagree, then option B"; slot A did not disagree), 3-A, 4-A, 5-A, 6-A ("you and Codex will be guiding me on that, in the first round at least"), 7-A. Challenge confirmed.

Operator explanation recorded for handoff. A hand-built leaf runs like this: the operator opens two herdr panes, Claude as slot A and Codex as slot B, gives slot A the leaf brief; slot A writes the plan, slot B implements, slot A reviews, slot B repairs, slot A rebases and pushes fast-forward to origin main. No `akrogon phase` exists yet, so every prompt that `akrogon next` would send is typed by the operator, with both slots telling the operator at each step which pane to prompt and what to say. When the hand-built leaves are merged, the operator runs the installer once from source, then `akrogon init` on this repo, and the next fresh leaf runs by itself.

## Taken

The hand-built path: the `akrogon` command (install, init, config, phase, next, status), the herdr plugin, and the implement, check and merge skills, as one or two leaves in the handoff marked hand-built. The operator drives those leaves in two herdr panes, typing every pass prompt with both slots guiding, so the loop is seen once by hand before it is automated. Everything else (plan, chart, seed, broadcast skills, status view, intake work) is built by the tool on this repo, which is its own first consumer; the old-shaped issues/config.yaml and issues/.scripts are removed in the first hand-built leaf and rewritten by `akrogon init`. After the hand-built leaves merge: installer run once from source with bun, then every step through the installed command and skill symlinks. Hand-built leaves finish by hand; the first automated leaf is fresh and elected without debate; takeover is proven by one hands-off merge plus one deliberate check.fix exercise on a real failing check, then parallel leaves. If the command cannot dispatch its own repair during bootstrap, it is repaired in a direct session with the operator guided by both slots and the run is recorded as failed automation. new-beginning/ and reference/ are deleted in the last leaf once nothing in the handoff or archived chart points into them. Why: the operator's July numbers show hand-driving lands work, and one hand-driven pass is the operator's model of what the command automates. Forecloses: reviving the July 28 lifecycle, a temporary driver script, a second state store, transferring a half-done hand leaf into automation.

From # Lessons 2026-09-09: the last bootstrap leaf moves reference/lessons into learnings/history/ unchanged, fixing relative links, deriving no active line.

From # Command Tests 2026-09-09: the bootstrap leaves that build the command each add its test file under a small test tree run by `checks.test`; the takeover leaf is the live proof and no automated test drives real herdr or GitHub.

Handoff 2026-09-09 (operator 1-A, 2-A): plan-issue and broadcast-issue join the hand-built skills leaf, five skills by hand, so the first automated leaf runs the complete loop; `status` is the takeover leaf, not part of the hand-built command; `pull` and the startup `pull --all` belong to the github leaf; the command leaf writes the new config before deleting the old files.
