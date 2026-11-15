# Leaf contract review B

Draft root: `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/9841db4d-1040-4cc0-8aaf-9a1544445bfe/scratchpad/leaves/failure-identity/`.

## F1. Failed verification still records receipts

Files and sentences:

- `failure-names/brief.md`, done-criterion 4: “judges `fail` and gives no receipt”.
- `stored-failure-names/brief.md`, done-criterion 4: “judges `fail` and gives no receipt”.

The outcome should be no qualifying receipt, not no recorded receipt. `src/verify.ts / runOnce` appends a receipt before checkout and retains command results on failure. `verify` invokes passes before returning the known-red result. Neither leaf owns removing failed receipts or changing that recording contract.

Replace “gives no receipt” with “does not satisfy the receipt gate” or equivalent, while explicitly preserving recorded failed runs. Otherwise an implementer must guess which meaning to fulfill.

## F2. A missing old base log does not force the known-red CLI to fail

File and sentence: `stored-failure-names/brief.md`, done-criterion 4: “`akrogon verify --known-red` judges `fail` … when the head log or the base log is gone, although both rows store equal `failures`.”

For the base-log case, this initial state does not imply that CLI outcome. `src/verify.ts / verify` calls `passOnce` for the merge-base whenever its tree has no whole-green receipt. `passOnce` launches a fresh pass when no matching live pass exists; `runOnce` writes a new log and linked receipt. A missing earlier base log can therefore be replaced by a fresh readable base run, and known-red may correctly pass. The leaf explicitly leaves run scheduling unchanged.

State the required result at the existing receipt gate: a completed linked pair with either real log missing cannot qualify using stored names. `src/verify.ts / requireGreenReceipt` and the existing linked-pair refusal matrix in `tests/verify.test.ts` already exercise that boundary without rerunning the base. Keep any CLI proof precise about which logs remain missing at comparison time, rather than implying that deletion of an old base log prohibits a fresh comparison.

No other disagreement. The proposed dependency resolves, the reader and storage ownership match, and the recorded fork dissents are not findings.
