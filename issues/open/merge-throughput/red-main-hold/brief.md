# Brief: red-main-hold

## What
When B judges a red merge run as caused by main (check-issue:61 rule and the test-runs base-red rule), B first records both runs and the cause judgment in the holder's review-B.md, then ends with `akrogon phase <slug> check.fix --slot B --attempt <id> --red-on-base <sha> --command <exact command>`. The command refuses a stale attempt and a sha that is not the current fetched `<remote>/<default_branch>`; otherwise the leaf stays in merge, carried members and the holder are restored to saved heads, the batch record is cleared without changing any batch limit, and a hold is written for the repo in `held.yaml` under `globalHome()` with sha, command, holder slug, attempt id, time and the path of the holder's review-B.md as the evidence (A,B). It appends an attempt line with outcome `held` (merge-attempt-records' append function), prints the hold, shows a herdr notification and `akrogon status` annotates the repo as held. mergeTurn checks the hold after the fetch (src/next.ts:996) and again inside the locked build: when fetched main differs from the held sha outside `issues/` and `learnings/` (src/batch.ts:23-25) the hold clears and the turn proceeds; otherwise no attempt starts. `akrogon unhold` (repo from cwd) clears a hold explicitly; status shows paused and held separately; `akrogon unpause` prints an existing hold. merge-issue's red ending checks base cause first and documents `--red-on-base`.

## Why
A red main makes every holder bounce in turn, spending fix rounds and merge runs on leaves that did nothing wrong (#62 BASE, #64, #67: three holders red on one main sha until a fix landed).

## Done-criteria
1. A `--red-on-base` call with the current fetched main sha leaves the holder in merge with no batch record, members at their saved heads, a hold for the repo naming sha and command, and one attempt line with outcome `held`.
2. A `--red-on-base` call with a stale attempt id, or with a sha that is not the current fetched main, is refused and changes nothing.
3. While held and main unchanged outside `issues/` and `learnings/`, `akrogon next` starts no merge attempt in that repo and prints why.
4. When fetched main changes outside `issues/` and `learnings/`, the next merge turn clears the hold and starts a normal attempt; a change only under `issues/` keeps the hold.
5. `akrogon unhold` clears the hold; on a repo with no hold it fails with a message naming the repo.
6. `akrogon status` shows paused and held independently, and `akrogon unpause` on a held repo prints the hold.
7. A hold triggers one `herdr notification show` call naming the repo and sha (fake herdr records it).
8. `skills/merge-issue/SKILL.md` red ending judges base cause first and names `--red-on-base`; the command reference and docs/guide/merge.md document `--red-on-base` and `unhold`.
9. The blocking `checks` pass.
