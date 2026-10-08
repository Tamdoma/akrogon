# Implementation report: direct-setting

Base: f57bb356c149ed6b9d87a5e122a79d1b54de15ad. Head: 17f7a0e. Mode: subagents, one wave with two units.

## Changed files and reasons
- src/config.ts: `direct: z.boolean().default(false)` added to `repoSchema` (D1). Commit 8622ffe, from unit 1 (d1e528d).
- tests/config.test.ts: new test `config prints direct, defaults it to false, and rejects non-boolean values` (D4). No existing expectation changed. The commit carries a `Test-Change:` trailer. Commit 8622ffe.
- docs/guide/setup.md: one `**direct**` bullet after **rebuttal** (D5). Commit 17f7a0e, from unit 2 (6ae5205).

## Criteria to evidence
1. `direct: true` prints `direct: true`, and `akrogon status` exits 0. Proved by the new test.
2. When the key is absent, `direct: false` prints in the repo and from outside it (`repo: none`). Proved by the new test.
3. Raw `direct: yes` and `direct: 1` exit non-zero with `direct` in stderr. Proved by the new test.
4. The setup.md bullet names the default and the offer-only meaning (see diff). `tests/docs-links.test.ts` passes.
- Deliberate break (unit 1 worker): with the schema line removed, the new test went red at `expect(direct.code).toBe(0)` (received 1). The line was then restored.
- Red before green (unit 1 worker): the test failed before the schema line was added and passed after.

## Commands run on the lane (head 17f7a0e)
- `bun run format`: exit 0
- `bun run typecheck`: exit 0
- `bun test tests/config.test.ts tests/docs-links.test.ts --timeout=30000`: 21 pass, 0 fail
- `AKROGON_BASE=f57bb35… bun test --changed=f57bb35… --timeout=30000`: 427 pass, 0 fail (29.5s)
- `bun test --timeout=30000`: 534 pass, 0 fail, 27s wall time

## Known limitations
- `bun run format` (prettier --write) rewrapped the `phaseColor` line in src/status.ts. That drift already exists on base and this leaf did not cause it. I reverted it to keep the diff to owned paths. Follow-up: format src/status.ts on main.
- skills/init-akrogon/SKILL.md lists repo keys for new repos and does not include `direct`. The design does not assign that file to this leaf. Configs still parse because of the default.
- YAML 1.2 accepts `True`/`TRUE` as booleans.
- The break run stopped at criterion 1, so criteria 2-3 were not seen red separately under the break.

## Unverified criteria
None.
