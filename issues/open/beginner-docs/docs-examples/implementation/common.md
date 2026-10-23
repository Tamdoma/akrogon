# Shared rules for every docs-examples story brief

This file and every brief sit under the public `issues/` tree. They never hold private project names, paths or commit ids.

## Privacy (brief criterion 2, plan D5)
- The private source map is `/home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/scratch/provenance.md`. Read it for repo roots and commit ids. Never copy its identifying contents into the page, a commit message or your report.
- The page never contains: a private project or repo name, a client name, any person's name, a home path or `~/` path, a session id, a secret, a private commit id, or any date or year. Describe private projects by what they are ("a web framework project", "a company website project").
- varhop is public. Name it and link https://github.com/Tamdoma/varhop/issues/1 and public commits as `https://github.com/Tamdoma/varhop/commit/<sha>`.
- A website-speed intake names a client repo. Never quote any intake or source report.

## Telling (criterion 3, plan D6, D7, D9)
- Past-tense narration of what the operator and the two seats did. Plain, short sentences for a beginner. Not instructions: no "you should", no numbered steps for the reader, no exercises.
- Each step names today's command or skill and links its current page under `docs/use/` and `docs/reference/` (relative links from `docs/examples/`, e.g. `../use/quick-fix.md`, `../reference/commands.md#run-work`). Link the skill file for agent procedure, e.g. `../../skills/chart-issues/SKILL.md`.
- Check every command, flag, phase and file name against `src/` (start at `src/akrogon.ts`) and `skills/`. Where a record shows an old name that no longer exists, use today's name or leave it out. No "was removed" or history notes.
- Quote recorded output only if the same command prints that shape today. Otherwise prose.
- Never link `docs/guide/`, `docs/start/` or a docs home. Links go only to existing `docs/use/`, `docs/reference/`, `docs/pictures/` files, skills and source files.
- End the page with one short next-step link.
- Copy the style of `docs/use/quick-fix.md` (one `#` title, short intro, a few `##` sections).

## Proof commands (run in your worktree)
1. Generic scrub, must exit 0:
   `akrogon run-check --name examples-scrub -- sh -c '! grep -rnE "/home/|~/|[0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}|\b(19|20)[0-9]{2}\b" docs/examples'`
2. Private-name scrub: write a word list to `$TMPDIR/private-words.txt` (repo names, org names other than Tamdoma for varhop, client names, people's names, private commit prefixes, found in provenance.md and the records you read). Run `grep -rniF -f "$TMPDIR/private-words.txt" docs/examples; echo exit=$?` and expect exit=1. Report only "no match". Delete the list after.
3. Links and retired terms: first `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'`, then `akrogon run-check --name test -- bun test tests/docs-links.test.ts tests/hold-retired.test.ts tests/run-permit.test.ts`, must exit 0.

## Do-not
- Edit nothing outside your owned page. No test edits, no file under `issues/`. Reason: one owner per path, issue artifacts live only in the registered checkout. Exception: a revised brief from A.
- If a record contradicts the brief (story did not land, facts differ), return a mismatch with evidence instead of writing around it.

## Report (end of your reply)
Commit your page as one commit with a `docs(examples): ...` message (no private names, no co-author line). Return the commit id and:
Changed files and reasons: <paths and why>
Tests run: <commands, exit and cited check lines>
Known limitations: <or none known>
Unverified criteria: <or none>
