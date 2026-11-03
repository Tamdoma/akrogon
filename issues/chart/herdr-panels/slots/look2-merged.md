# Stage palette and Needs-you shortcut: merged notes (A, B, C, D)

## Agreed

- Colors come only from the theme's ANSI slots, so every Omarchy theme keeps its own saturation (A,B,C,D).
- check = magenta `ansi5` (A,B,C,D); failed / real block = red `ansi1` (A,B,C,D); parked, stopped, paused = neutral grey (A,B,C,D).
- Practitioners agree: red = failed/blocked, green = success/done, grey = inactive; they split on in-progress: blue (Atlassian, GitLab) vs yellow (Primer, Linear) (A,B,C,D).
- Pills are a quiet tint of the stage color (9-15% alpha), radius 4-5, 10.5-11 px text; never solid fills (A,B,C,D).
- Shortcut lives in the prefix (`ctrl-b`, then a key) and toggles like `ctrl-b t`, through the same full-width open/close routine (A,B,C,D).

## Measured facts

- Omarchy sage-terra splits into two saturation tiers: blue, green, magenta, cyan at 19-23%, red and yellow at 57-58% (D, colors.toml).
- In the matte-black theme, the "yellow" slot is dark red #b91c1c, so amber-for-implement would look failed there (D, /usr/share/omarchy/themes/matte-black/colors.toml:19).
- Colored small text on its tint falls under 4.5:1 in several of the 25 installed themes (A: 9-15 themes per color; B: down to 1.89:1 in Rose Pine). Foreground text on a 12% tint stays above 4.5:1 in all 25 (B, min 5.64:1).
- Free prefix letters: a, i, j, l, m, q, u, y (A,B,C,D). `n` = next tab, `o` = jump to the agent that needs you most.

## Where seats differ

1. Stage → color.
   - plan blue, implement cyan, check magenta, merge green (D; B same but merge pending cyan and merged green; A had plan cyan / implement blue).
   - D adds: check.fix and check.repair amber `ansi3`, meaning "rework, attention", the same family as slow merge.
   - CLI as is: plan blue, implement amber, check magenta, merge green (C).
2. Pill text.
   - Theme foreground text; color carried by the tint plus a colored dot (A) or a colored 1 px border (B). Readable in all 25 themes.
   - Colored text (C), using the bright ANSI variant in dark themes (D). More vivid; fails contrast in some themes.
3. Needs-you key.
   - `ctrl-b y`: "needs You", and Y sits right of T on the keyboard, like the Needs-you button right of Tasks (C,D).
   - `ctrl-b i` "inbox" (B). `ctrl-b a` "answer" (A).
