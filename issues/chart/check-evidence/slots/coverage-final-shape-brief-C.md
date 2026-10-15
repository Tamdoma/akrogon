# Brief for slot D: log-coverage final-shape check

You are slot D. Read-only; write only your return file.

Read: /home/ivan/Work/infra/akrogon/issues/chart/check-evidence/slots/coverage-final-shape-draft.md and the Taken section it names. Code at /home/ivan/Work/infra/akrogon/src and skills at /home/ivan/Work/infra/akrogon/skills as needed.

Task: one focused check of this final shape before A records it. Report only what is wrong, missing, or breaks a reader or writer, each with file:line or a measurement. Check especially: where run-check's printed line goes (stdout or stderr) without breaking callers that parse its output, and whether any skill step still needs a hand-saved log. Say "no disagreement" if none.

Return: /home/ivan/Work/infra/akrogon/issues/chart/check-evidence/slots/coverage-final-shape-D.md. Write to a temp file in that folder first, then rename to the exact path.
