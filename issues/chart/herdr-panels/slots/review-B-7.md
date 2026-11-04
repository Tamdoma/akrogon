# Review B: F9 repair

Verdict: **ready**

Original base: `364de7d0309db7e73c18e6807a3d010e7211cd73`  
Prior reviewed head: `efc018fddc0b2219ad9979a50512e7f1a772ba50`  
Reviewed head: `8d8f4b1f33517cd0122958a15774d34c87a01478`  
Worktree: `/home/ivan/.akrogon/worktrees/herdr-setup/mono-icons`

Reviewed only the repair range and F9. No new defects or Nits found.

**F9 resolved.** Pictures now use white PNGs with internal brightness represented by opacity, preserving their drawing through `image()`. Tint glyphs retain the SVG mask path. Both primary agents and sub-agents use the shared helper. Kiro's ghost and eyes and Crush's facial details remain visible in the supplied `live/mono-sheet.png`. `live/mono-04-crop.png` shows Codex drawing in the live list.

## Verification

- Rebuilt all **120** shipped icons with the real `mono/build` in an isolated temporary directory. Every committed PNG matches the rebuilt decoded pixels. All are 64×64, have white RGB and cap alpha at 191/255. Every currently shipped SVG has a corresponding PNG.
- Checked the actual F9 assets numerically. Kiro's tile, eye and body alpha values are 98, 38 and 191. Crush's background, eye and mouth values are 190, 38 and 44. Their internal contrast survives, unlike the prior flat alpha masks documented in review-B-6.
- Ran the real `herdrapp session link` against a temporary home. All 120 PNGs reach the session home as real files with identical contents. The deleted Codex SVG is absent. Temporary build and session fixtures were removed.
- `bun test`: **51 pass, 0 fail**. `herdr-app check mods/agents-by-tab` and `bash -n mono/build` pass. No test files, expectations or runner configuration changed. **Test-Change trailers: none.**
- Checked the updated AREA paths in one listing. Every concrete path exists, including `mono/build`. Reviewed the installed program/image API contract. The AREA entry describes rebuilding after app updates. No additional documentation correction needed.
- HEAD matches the requested SHA and the worktree remains clean. No deployment, desktop input or paid launch performed.

Retained logs, read back with `akrogon log`:

- `check review-B7-diff: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B7-diff-1793745328640-1927123.log`
- `check review-B7-checks: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B7-checks-1793745347243-1932751.log`
- `check review-B7-assets: 0 /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/check-review-B7-assets-1793745389013-1945965.log`
