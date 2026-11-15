# hc keys cannot carry free text; a pasted slash command runs on claude

## Case

Chart door-name-after-reset (2026-11-14) needed the reset helper to rename a claude session to an arbitrary name.

## Evidence

- `hc keys <t> / r e n a m e space c - P r o b e _ 2 ...` failed with `unknown key "_"` and typed nothing; `hc keys <t> A` typed `a`.
- `env -u HC_TERMINAL_ID hc send --json <t> "/rename c-Probe_2 x"` on claude 2.1.325 ran `/rename` as the command, kept the name exact, made no model reply and counted as one hc turn.
- Record: issues/chart/door-name-after-reset/slots/map-A.md, probes P3, P4, P6.

## Learning

Use `hc keys` only for fixed key names and lowercase command words. Text with capitals, `_` or other punctuation goes through `hc send` without the sender's `HC_TERMINAL_ID`, and the turn it starts must end before the next keys.
