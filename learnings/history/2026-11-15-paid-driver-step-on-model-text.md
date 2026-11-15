# A paid capture's driver step that needs a property of model-written text

Date: 2026-11-15. Case: framework leaf rewrite-copy-review (issue #617), slot A implement, rewrite captures 1 to 3.

## Case

The rewrite capture plants a sentence picked by a rule from pelvic-floor, a page the writer model produces in the same run, and the driver runs the plant only after 5 paid sessions. Run 1 picked a short line other pages share, and the reviewer kept it (criterion 4 red, USD 3.82). The operator tightened the rule (O1). Run 2 then found no qualifying sentence and failed after 5 paid sessions. The free preflight passed both times because it ran on the previous recording's pages, not the new model output. Run 3 used a fallback rule (O3) that can only fail when the page has no qualifying sentence at all, and it passed.

## Evidence

- Framework `issues/open/rewrite-sibling-check/rewrite-copy-review/implementation/report.md` (grant count lines G1, G1b, G1c; Blocker 1 and 2).
- Logs: `check-capture-rewrite-1794655000060-180965.log`, `check-capture-rewrite-2-1794690744946-1746240.log` ("no plantable sentence"), `check-capture-rewrite-3-1794705381886-3076503.log`.

## Learning

A free preflight on old recorded output cannot prove a driver rule over text the model writes in the paid run. When a paid capture's driver selects from model output, give the rule a fallback that cannot come up empty on a normal page, or have the driver author the input itself, and make the criterion tolerate the variation the rule allows. Each tightening of such a rule costs a paid slot. Related to the 2026-11-14 paid-recording dry-run lesson, with a different cause (model output, not an unrun free step). Judgment lesson, files nothing.
