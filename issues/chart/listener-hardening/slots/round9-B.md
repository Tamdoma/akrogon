Reviewed `f9a3c605a03aa7a618d73eef84f989d9797774b1`. Paths are relative to the named herdr-setup worktree.

## F1 — P2: A complete URL is replaced with the next sentence appended

`mods/link-hints/links.js:24-26` treats proximity to the terminal width as proof of wrapping. A normal hard newline after a complete URL can satisfy the same condition. Reproduced with an 80-column row ending in `https://example.com/a`, followed by `Next step`: `candidates(screen, 80).filter(isUrl)` returns only `https://example.com/aNext`. The real URL disappears, and choosing its hint opens a different URL. Row length alone cannot justify replacing the original URL. Cover a complete URL followed by a hard newline near the right edge.

## F2 — P2: Paths spanning three rows are never recovered

`mods/link-hints/links.js:22` joins only one row with its immediate successor. The joined result never participates in another join. I split the existing absolute path to this worktree's `mods/link-hints/links.js` into 55-character rows with continuation indentation. It occupies three rows. The full path was absent from `candidates`, and applying the implementation's file-existence criterion retained zero candidates. This is a real existing file, not a missing-file case. Long scratchpad/worktree paths in narrow panes therefore disappear from the popup. Add a three-or-more-row path regression and recover the complete continuation.

## F3 — P2: More than 676 links crashes rendering

`mods/link-hints/links.js:33-36` returns at most 26² labels, but `mods/link-hints/main.js:114` assumes every link has a label. Reproduced through the actual `existing()` and `render()` methods with mocked UI builders and real shell execution: 677 distinct URLs fit in 68 rows of at most 169 columns. All survive filtering, `labels(677)` returns 676 entries, and render throws `undefined is not an object (evaluating 'names[i].startsWith')`. Generate enough labels or bound the rendered collection coherently before indexing it.

Validation: existing targeted suite 9 pass, 0 fail. The shell existence check correctly retained a known file and rejected a nonexistent one in the probe. Also sampled t15 with `hc read --json --lines 0` without input, scrolling, or opening the overlay. No live keyboard/focus interaction was performed.

Verdict: changes needed

Re-check: ready

Reviewed amended HEAD `652d412`. All three reproductions now pass: the original URL remains available, the existing three-row path survives filtering, and 677 links receive unique labels and render without the previous exception. Targeted suite: 12 pass, 0 fail. Re-check limited to F1–F3.
