# Merged notes: examples (A, B)

A's facts came from a read-only Explore pass (framework, akrogon records) and its own checks. B's facts: slots/examples-B.md F1–F8.

## Facts
- Visibility 2026-10-23: Tamdoma/akrogon and Tamdoma/varhop are public; private project P1 and private project P2 are private (B F1).
- next-same-work: direct, landed cd333caa on main, issue #109 closed 2026-10-21 (A,B). Its direct/report.md names b92ad6f1 as head while CHART.md names cd333caa; both are on main (A).
- orphan-pane: autopilot charting, then lifecycle with a B review finding, a repair and a landing c5e98748 on main, issue #116 closed 2026-10-22 (A,B). Its local closed records are untracked and not on GitHub, so pages link the issue and the commit, not the folder (B F5, A: git status).
- config-walls: lifecycle, landed 7efe3d67, more complex (A,B).
- varhop overlay-rework: failed predecessor carried forward, dependent leaves, landed 0be8ca4, issue varhop#1 closed. Code landing proven, physical checklist not (B F6).
- P1 autopilot batch: private, merged leaves, local paths and session ids (A,B). Its intake names a client repo (A).
- P2 epics: private, merged leaves (A,B). P2 test epic records hold an email, home paths and session ids (A).
- P1 capture fix: private, its report names a head not reachable from main (A).
- Public akrogon and varhop records also hold home paths, session ids and machine details (A,B).
- varhop overlay-plugin is recorded merged in state.yaml while the chart calls it failed and carried forward; the leaf checks this before telling the story (A).

Rebuttal: slots/examples-rebuttal-B.md (attribution split applied, picks unchanged).

## Picks
- Q1 = a, using orphan-pane: one real small change through the whole factory. Quote only recorded output. Fill gaps with prose, never a made-up transcript (A,B).
- Q2 = a, public first: next-same-work (direct), orphan-pane (autopilot charting into lifecycle), varhop overlay-rework (failure and recovery) (A,B). Watch gets a real case only if a verified watcher record exists, else a how-to with the gap stated (B; A agrees). Private repos inform the writing but are not published (A,B).
- Q3 = a, with a qualifier: date and commit are provenance only. The current-state rule still applies, so no removed commands or settings are quoted (B; A agrees).
- Q4 = a, with a qualifier: keep public project names and public issue/commit links; remove personal paths, other people's names, client names, private repo names, session ids and secrets; one review of text, links and images per page (A,B).

## Pitfalls
- A finished chart claimed as merged code: require state plus main ancestry (A,B).
- "Merged" claimed as "deployed and checked": say exactly what is proven (B).
- Five repeated case histories: each case teaches different concepts and links reference pages (B).
