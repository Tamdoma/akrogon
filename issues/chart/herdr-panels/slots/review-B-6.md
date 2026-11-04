# Review B: monochrome icons

Verdict: **fix**

Base: `364de7d0309db7e73c18e6807a3d010e7211cd73`  
Reviewed head: `efc018fddc0b2219ad9979a50512e7f1a772ba50`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/mono-icons`

## F9: opaque agent pictures lose their internal shapes

Location: `mods/agents-by-tab/main.js:70–74`, used by the primary row at line 288 and sub-agent row at line 182.

Showing a Kiro or Crush agent uses the shipped `icons/kiro.svg` or `icons/crush.svg`. These are real program icons supplied by the installed app, not hypothetical custom assets. Both now pass through `svg()` because only Codex has a replacement in `MONO`.

Kiro's purple rounded tile, white ghost and black eyes are all opaque. Tinting its alpha mask therefore produces a plain rounded square and erases the ghost. Crush's black eyes and mouth are opaque shapes over its opaque pink heart. They disappear into the same white silhouette. This is the same loss already handled for Codex and violates the operator's requirement that the shapes stay the same.

The retained asset proof renders the actual shipped SVGs with `rsvg-convert`. Kiro's background pixel `(150,150)` and eye pixel `(635,485)` both have alpha 1 despite different colors. Crush's pink background `(10,10)`, eye `(19,18)` and mouth `(25,23)` also all have alpha 1. The host API documents `svg()` as a tinted mask and `image()` as preserving source colors. The changed helper discards those distinctions.

Preserve the internal drawing of these shipped opaque pictures through suitable monochrome assets, as done for Codex, and verify them alongside Codex. No agent launch is needed to exercise the shipped assets.

## Verification

- `bun test`: **51 pass, 0 fail**. Both changed mods pass `herdr-app check`. `bash -n install bin/herdrapp` passes. Existing tests do not exercise icon rendering and do not catch F9.
- An isolated session-home fixture runs the real `herdrapp session link` command. It replaces an old `mono` symlink with a real directory, copies the asset, preserves the main-home source and refreshes the copy on a second invocation. Temporary fixtures were removed.
- Codex's new asset retains the exact tile and logo path geometry from the shipped SVG. Space avatar geometry is unchanged. Inspected `live/mono-01-crop.png`, `mono-02-crop.png` and `mono-03-crop.png`. The last shows Codex drawing after the real copy. These captures do not cover Kiro or Crush.
- Reviewed install/session linking against README, the reference index and the installed image/program API documentation. All concrete paths named by changed `mods/AREA.md` exist. Its `<name>` path is a template. No additional documentation defect found.
- HEAD matches the supplied head and the worktree is clean. No tests or existing expectations changed. **Test-Change trailers: none.** No deployment, desktop input or paid launch performed.

Retained logs, read back with `akrogon log`:

- `check review-B6-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B6-diff-1793744816630-1887998.log`
- `check review-B6-checks: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B6-checks-1793744968527-1901720.log`
- `check review-B6-assets-v2: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B6-assets-v2-1793745035861-1906355.log`
- `check review-B6-area: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B6-area-1793745069527-1907973.log`
