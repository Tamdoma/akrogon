# Native frames must show the claimed result

Date: 2026-11-03. Case: tasks-mod, slot B re-check of head `44482211fff2190ac8fed39fa14a49fce40b9ab7`.

The implementation report said timer and FIFO scan screenshots had been inspected and showed advancing times and distinct scan rows. Inspection found an error banner and welcome overlay instead. The timer pair had identical decoded PNG bytes, as did the three scan frames and their later timer frame. The hand-built inputs omitted the producer's required `repo.parked` array, which reached `repo.parked.length` in the renderer.

Evidence: `issues/open/tasks-board/tasks-mod/implementation/evidence/tasks-a-{mount,time-b,fifo-s1,fifo-s2,fifo-s3,time2}.png`; `check-recheck-b-c6-evidence-1793726553909-4168102.log`; `check-recheck-b-producer-contract-1793726554010-4168172.log` beside those inputs. The current code's configured suite was green with 1,296 passing tests, but that did not establish the separately required native outcome.

Learning: a screenshot command succeeding and creating a new filename proves capture, not the state claimed in the report. Inspect the saved frame against the exact claimed user-visible outcome and pair it with kept observations for behavior a still image cannot show. Invalid proof inputs can leave a stale or error description while capture still succeeds. Correct the proof inputs rather than adding production guards against states the producer cannot emit.

This is a judgment lesson about assessing evidence, not an exact wording or image-pattern check. No intake issue is filed.
