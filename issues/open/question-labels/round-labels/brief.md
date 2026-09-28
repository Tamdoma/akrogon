# Brief: round-labels

## What
Change the operator round template in `skills/chart-issues/assets/questions.md` so questions are headed `### 1 ·`, `### 2 ·`, options are `**1a (recommended)**`, `**1b**`, and the reply key reads ``Reply `1a 2b`, or a numbered free-text answer.``. Add one sentence to the paragraph after the template: label questions `1`, `2` and options `1a`, `1b`, `2a`, and use no other code scheme in a round. Numbering still restarts at 1 each round.

## Why
The template mixes three schemes (`Q1`, `A`/`B`, `1-A`), and the operator's global reference-code rule (`Q1`, `O1`, codes kept across the conversation) collides with the per-round restart. Agents resolve the collision by inventing labels such as `QQ` and `O1`, so every round looks different.

## Done-criteria
1. The template block in `skills/chart-issues/assets/questions.md` shows questions as `### 1 ·` and `### 2 ·`, options as `**1a (recommended)**` and `**1b**`, and the reply key `1a 2b`. It contains no `Q1`, `Q2`, `1-A`, `2-B`, `**A` or `**B` label.
2. The paragraph after the template states the `1`, `1a` labels, forbids any other code scheme in a round, and keeps the per-round restart at 1.
3. `grep -rnE "\bQ[0-9]\b|\b[0-9]-[A-B]\b" skills/ docs/` returns no hit outside lockfiles.
4. No other file changes.
