# Report: paid-red-stop

Serial-solo run (one unit, one wave per plan.md). One file changed, one commit.

## Changed files

- `skills/lifecycle-rules.md` — appended one paragraph at the end of `## Grant reuse and count lines` (plan D2 text): one paid launch runs before the operation's other paid launches; after a paid red, no further paid launch until a free reproduction passes after repair or a live-only diagnostic names a new observation; a diagnostic repeating the known failure without it ends further paid launches under the seat's operator-blocker stop; explicit "changes no count line or repeat-bound rule".
- Commit: `44562186` "skills: stop paid relaunches of an operation after a paid red".

## Base and head

- Base (AKROGON_BASE): `842db38b6f54b733d6a3d6cf97119c37f69e7cb4`. Refresh: fetched `origin/main`, branch already up to date, no rebase needed.
- Head: `445621864f30424d7ac4a46ebc70a2b7852bf8e4`.

## Commands run and results

- `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts` on `44562186` → green, 13 pass / 0 fail. Kept log: `check docs-links: 0 implementation/check-docs-links-1795199615738-451820.log`.
- `git --no-pager diff 842db38b...HEAD -- skills/lifecycle-rules.md` → 2 insertions, 0 removed lines (criterion 1's mechanical part: no count line or repeat-bound text touched).
- `akrogon verify` on `44562186` → `verify leaf 44562186…: green`; all three `checks` commands (format, test, typecheck) green; test run 1233 pass / 0 fail, receipt log `implementation/check-test-1795199683408-452233.log`. Wall time ~60 s.

## Criteria proof status

- **Criterion 1** — mechanical part proven: diff adds lines only inside `## Grant reuse and count lines`; the four `##` sections and every skill intro line unchanged. Reading part left to the review seat as designed (leaf-review-b F9): the paragraph sits inside the named section.
- **Criterion 2** — reading proof by the review seat: the paragraph's third sentence ends further paid launches of the operation under the seat's operator-blocker stop when the diagnostic repeats the known failure without its named observation; the stop is the per-seat `failed` stop each skill's intro already names.
- **Criterion 3** — reading proof by the review seat: the rule is unqualified over seats, and merge's rerun `akrogon verify --attempt <id>` is a launch of the same operation under the same bound, so merge-stage paid relaunches follow the same stop; merge-issue's red-retry paragraph needs no change and none was made.

## Grants and credentials

`grants[]` empty; no covered launch ran, no count line written, no `.env` touched.

## Known limitations

- The rule's runtime obedience by future seats is unproven by construction (design: criteria proven by review reading; no text check can hold it).
- Docs: only `skills/lifecycle-rules.md` affected; `skills/AREA.md` already describes the shared file's four rules and stays true — no doc checklist item needed.
