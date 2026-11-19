# Signposts input, slot C

## 1. Missed angles

M1. Must each report be reproduced before its fix forks settle?
- M1a (pick) Yes. Each issue first shows the failure in a free local test or read-only sort. A report that does not reproduce stops for recharting and gets no fix.
- M1b No. Trust the lesson history and cited lines, fix as described.
- Why: all three are unverified intake, and #142 already changed shape on inspection (whitespace folding works, a wrap with no leading whitespace kills the trailer block). Steers proof choice, fork order, and stop rules on all three.

M2. Does the #143 rule wording settle before #141 and #142 state what done means?
- M2a (pick) Yes for wording, no for building. Settle the #143 Transfer and Retire terms first, then build all three side by side.
- M2b No order. All three chart fully side by side, as 1a implies.
- Why: #143 changes the rule that #141 and #142 done claims will use, and #141 and #143 may both touch implement-issue files and lesson-rule copies. Steers fork order, shared-file ownership, merge order, and done wording.

M3. What proves an issue is done, given the real lessons live in the framework repo?
- M3a (pick) An akrogon-side proof plus a read-only recheck against the actual framework lessons named in the intake, showing each one can now retire, transfer, or stays for a stated reason. No framework files change, so 3a still holds.
- M3b Akrogon tests only. Whether the named lessons can leave is for a later framework pass to find out.
- Why: a fix can pass its own tests and still leave the named lessons stuck. Steers done criteria, proof design, and what the completion owner may claim on all three.

## 2. Disagreements

G1. 2a as written. It assumes a code point can refuse the bad action on #141, but no akrogon code runs a worker's `git stash`, and git has no stash hook. The #141 fork must name who refuses and when (for example slot A comparing `refs/stash` at worker launch and return, refusing to integrate a changed stash). If no such point is chosen, #141 lands prose only, the lesson stays, and its done claim must say so. 2a holds for #142.

G2. 1a plus 3a for #143. Together they say #143 closes on its own from akrogon work only. The report's expected behaviour also asks for framework history-file naming in the same pass, which 3a puts in framework work under Tamdoma/tamdoma-framework#650. Pick: keep 1a and 3a, and have #143's completion record that clause as handed to #650, or #143 does not fully close.

## 3. Needs

None. All proofs are free and local under 5a. No key, login, paid launch, or human action is needed for the three reports. M3a needs only read access to the local framework checkout, which the intake already used.
