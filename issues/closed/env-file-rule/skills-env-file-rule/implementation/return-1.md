# Return 1: env-file rule in five skill files

Changed files and reasons:
- skills/plan-issue/SKILL.md: rule sentence after 29 stop; 57 rewrite to by-name bun --env-file check printing present/absent per name.
- skills/implement-issue/SKILL.md: rule sentence after 31 stop; 41 unchanged.
- skills/check-issue/SKILL.md: rule sentence after 25 stop.
- skills/merge-issue/SKILL.md: rule sentence after 25 stop.
- skills/AREA.md: one Non-obvious patterns bullet naming env-file rule as invariant.

Tests run:
- grep -rn .env skills/: 10 lines, 7 owned compliant, 3 excluded untouched. No owned sentence tells a seat to cat, read, open, edit or append to .env.
- bun test --changed with AKROGON_BASE 92eb1cf4c2ba293f87234facc2643ddf8d79e090: 0 pass, 0 fail, no test files affected.
- bun test: 244 pass, 0 fail.
- bun run format: exit 0, unchanged.
- bun run typecheck: exit 0.

Known limitations: none known.

Unverified criteria: none.

Grep output:
skills/AREA.md:23:- Env-file rule is an invariant of every phase skill: `.env` and `.env.*` are never opened, printed, or written by a tool, and presence is checked by name with `bun --env-file=<file>` printing `present`/`absent`.
skills/broadcast-issue/scripts/discord-send.test.ts:94:      env: { ...process.env, PRIMARY: secondary },
skills/chart-issues/SKILL.md:47:Warn as soon as a genuinely human-only prerequisite appears, name its owner and record completion before opening a leaf; the distinct operator choice `hand_built` cannot replace completing known prerequisites. Credentials are not such a prerequisite but are anticipated, never discovered by a blocked seat: every brief lists the keys, logins and env values its leaf needs by variable name, what each is and where the operator obtains it, and the handoff batch names the ones absent from the consumer repo's gitignored `.env` so the operator fills them before dispatch.
skills/chart-issues/assets/standing-design.md:11:- Every secret including production lives in the consumer repo's gitignored .env. The operator explicitly accepts that agents can read it. No secret vault, broker, or off-machine credential pile exists.
skills/check-issue/SKILL.md:27:Each review seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.
skills/implement-issue/SKILL.md:33:B never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.
skills/implement-issue/SKILL.md:43:A credential still absent from `.env` at implement is never requested as a pasted value: B records the missing variable in `<leaf>/implementation/report.md` as a human-only blocker with the `add <VAR> to .env` action, what the value is, and where the operator obtains it, then runs `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see implementation/report.md>" --slot B` and ends the pass.
skills/merge-issue/SKILL.md:27:The merge seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.
skills/plan-issue/SKILL.md:31:This seat never opens, prints, appends to, or writes `.env` or `.env.*` with any tool, instead running any script that needs values as `bun --env-file=<file> <script>` to print only results, never values, and checking presence by name with such a script printing `present`/`absent` per name, ending the pass with the stop above when a required value is absent.
skills/plan-issue/SKILL.md:59:Every credential the design names by variable name is checked by name with `bun --env-file=.env -e 'console.log(["VAR_A","VAR_B"].map(k => k + " : " + (process.env[k] === undefined ? "absent" : "present")).join("\n"))'` with the design names in the list, printing `present`/`absent` per name; each one absent there and unobtainable by this seat is a human-only blocker recorded in `plan.md` with the `add <VAR> to .env` action, what the value is, and where the operator obtains it, then the seat runs `akrogon phase <slug> failed --reason "<missing <VAR> blocks <criterion>; see plan.md>" --slot B` and ends the pass instead of finishing with `implement`.

Changed-test output:
bun test v1.4.2 (744846f84)
--changed: 5 changed files, but no test files are affected

 0 pass
 0 fail
Ran 0 tests across 0 files. [6.00ms]

Full suite: 244 pass, 0 fail. Format exit 0 unchanged. Typecheck exit 0.
