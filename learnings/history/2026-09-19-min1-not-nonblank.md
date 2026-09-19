# z.string().min(1) does not refuse whitespace-only input

2026-09-19. Leaf failed-with-cause plan D2 stated "empty or whitespace-only is refused by `z.string().min(1)` at the CLI boundary". The implementation used exactly `z.string().min(1)`, which checks length only, so `akrogon phase <slug> failed --reason ' '` exited 0 and stored `reason: ' '`; `akrogon status` then prints `failed blocked ` with no reason text.

Learning: when a plan or contract says "non-empty" or "refused if blank", verify the validator actually rejects whitespace — `min(1)` does not. Require `.trim().min(1)` or a `\S` check, and probe the boundary with a whitespace-only argument during review, not just an empty one.
