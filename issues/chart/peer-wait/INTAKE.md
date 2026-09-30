# Intake: peer-wait

## Scope
Destination akrogon. One leaf changing the peer wait rule in `skills/chart-issues/assets/questions.md:44`, the only surface stating it.

## Provenance
- GitHub: Tamdoma/akrogon#44

## Source: Tamdoma/akrogon#44
# chart-issues peer wait returns before the peer answers or outlasts the harness command limit

Source: Tamdoma/akrogon#44
URL: https://github.com/Tamdoma/akrogon/issues/44

Unverified intake.

## Observation
On 2026-09-30, in chart `realistic-fix-bar`, slot A (Claude Code) consulted a codex slot B in herdr pane `w8:pE8` following the peer exchange in `skills/chart-issues/assets/questions.md:44`: prompt the peer, then run `herdr agent wait` without a timeout and read the named return file.

Two failures were seen:
1. Right after `herdr agent prompt`, the peer still reported idle, so `herdr agent wait` returned immediately and the return file did not exist yet (first fix-bar rebuttal attempt).
2. After slot B's model changed, one B pass took about 6 minutes. Claude Code's Bash tool caps a foreground command at 600000 ms, and the blocking waits were moved to the background and surfaced as failures (exit 144) even though B had written its return file.

## Location
akrogon: `skills/chart-issues/assets/questions.md:44` (blind peer exchange), used by the chart-issues door with a herdr peer pane. No other akrogon file uses `herdr agent wait` this way.

## Reproduction
1. Open chart-issues with a named slot B pane in herdr.
2. Send B a fork or rebuttal prompt with `herdr agent prompt <pane> ...`.
3. Immediately run `herdr agent wait <pane>` and read the return file.

Seen repeatedly on 2026-09-30, whenever B was still idle at wait start or took longer than the harness command limit.

## Expected behavior
Slot A reliably reads the peer's return file once the peer has finished writing it, regardless of how long the peer takes and without the wait being cut off by the harness command timeout.

## Urgency
Slows every peer exchange and makes a working peer look broken. Workaround used: a background loop `until test -s <return file> && herdr agent get <pane> | grep -q '"agent_status":"idle"'; do sleep 10; done`.

## Agent findings
- The rule lives only in `skills/chart-issues/assets/questions.md:44`. No guide page, README line or test states it (grep 2026-09-30).
- `herdr agent prompt --help` (herdr 0.9.1): `--wait` waits for the first matching state observed after submission and requires an observed working or blocked state within 5000 ms, else `agent_prompt_stalled`. Plain `herdr agent wait` has no such guard, so an idle peer matches at once. This is failure 1.
- The command already guards the same race: `src/next.ts:466-476` prompts with `--wait --until working --timeout 5000`.
- `herdr agent wait <pane> --timeout 1500` on a working pane returned exit 1 with `{"error":{"code":"timeout",...}}` (probe 2026-09-30, own pane w8:pCT, read-only).
- Claude Code's Bash tool defaults to 120000 ms and caps at 600000 ms. A wait with no herdr timeout outlives either. This is failure 2.
