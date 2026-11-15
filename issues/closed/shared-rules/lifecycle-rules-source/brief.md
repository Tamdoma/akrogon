# Brief: lifecycle-rules-source

## What

One file, `skills/lifecycle-rules.md`, states once four rule families that plan-issue, implement-issue, check-issue and merge-issue restate today:

- grant reuse and the count lines (the paragraph in each skill's Shared context about reusing `grants[]` for the operations they cover);
- the `.env` rule (the seat never opens, prints, appends to or writes `.env`) with the producer key save (`produces[].save`);
- kept command output through `akrogon run-check`;
- the rule for a red check with no cause in the leaf's diff: one retry, the `akrogon verify --known-red` judgment, the blocked exception and filing a base red through seed-issue's `## Lifecycle filing` section.

Each of the four skills replaces its copy with a link to the shared file and keeps one short line for what is its own: its record file, its slot, merge's `.env.example` exception, check.review launching no covered operation, and its command form such as `--attempt <id>`. Each skill reaches the shared file through a link file `lifecycle-rules.md` inside its own folder. The opening re-read sentence stays at the top of each of the four `SKILL.md`; implement-issue's is reworded so it agrees with that skill's conditional reads. No seat gains or loses a rule.

From `skill-links-in-folder` this leaf consumes the link check that follows an in-folder link file and refuses a link that leaves its skill folder, and the in-folder link-file form itself.

## Why

One rule is edited in several copies. `git log --since=2026-10-01` over the four `SKILL.md`, run 2026-11-10: 18 commits edited three or four of the files together, 8 of them about the red-check rule and 4 about the other three families and the re-read sentence. Since 2026-09-01, 65 of 143 commits touched two or more of the four. The copies today: grant paragraphs 1,074 words in four places, `.env` 281 in four, producer save 123 in two, the red-check rule about 430 words in each of three skills with a pointer in plan. The copies have also drifted in wording, which each later edit must reconcile by hand. implement-issue's opening sentence orders a re-read of its references at every phase prompt while a later sentence makes `brief-template.md` (931 words) and `worker-protocol.md` (1,104 words) conditional; one unneeded read of `worker-protocol.md` is on record (watcher-on-hc, 2026-11-08).

## Done-criteria

1. Each of the four families is stated in one place. `skills/lifecycle-rules.md` holds it, and plan-issue, implement-issue, check-issue and merge-issue hold no second copy: each links the shared file by a path inside its own folder and keeps only what is its own.
2. No rule is lost and no seat is changed. The implementation report holds a table with one row per clause of every old copy (the grant paragraphs of the four skills; the `.env` sentences of the four; the producer save in plan and implement; the command-output paragraphs in implement, check and merge and the shorter one in `plan.synthesis`; the red-check rule in implement's Shared context, in `check.review` and in merge's Shared endings, and plan's pointer to it), giving its old place, its new place and the seats that hold it. The reviewing seat follows the table along the reading path of `plan.synthesis`, `implement`, `check.review`, `check.repair`, `check.fix`, `merge`, and the standalone and direct forms of implement-issue and check-issue, and finds every clause reachable by each seat that held it and no seat holding a duty or permission it lacked.
3. The differences between seats survive, each named in the table: the record file per skill (`plan.md`, `implementation/report.md`, `review-<slot>.md`, `review-B.md`); merge's exception that configured merge checks may read `.env.example`; `check.review` launching no covered operation; the command forms, merge's being `akrogon verify --attempt <id> --known-red`; the producer key save for plan and implement only; fixture cleanup and the absence read for check and merge only; the setup flock where it stands today (check's grant paragraph and implement's Effective settings); "at most a short excerpt" of pasted output for implement, check and merge only, not plan.
4. implement-issue's opening sentence and its conditional reads agree: `ponytail.md` is read before editing, `brief-template.md` when writing a brief, `worker-protocol.md` when delegating or validating a worker return, a repair that delegates included; the fresh read of the skill, `brief.md` and `design.md` at every phase prompt stays.
5. A seat opens the shared file on the installed layout: each of the four skill folders holds the link file, the shared file holds no relative link, and the link check delivered by `skill-links-in-folder` accepts the shared file and the four link files. Proof: that link check inside the existing `test` command. (A,B)
6. A seat still finds the known-red command where it reads the rule: the shared file names `akrogon verify --known-red` and merge-issue names `akrogon verify --attempt <id> --known-red`, held by the existing command-literal test, inside the `test` command, reading the files that now carry them. (A,B)
7. Each family is stated once instead of in up to four copies; the report records `wc -w` before and after for the four `SKILL.md` and the shared file.
8. Every page under `docs/` and `skills/AREA.md` that says where one of the moved rules lives points at its new place; the report lists each match it checked.
