# What happens to a seat that stays working forever?

## Question
Is a permanently busy agent warned about or automatically failed?

### Carries
`tests/next.test.ts:94-114` expects blocked agents to wait without consuming attempts. No progress timestamp exists in state or herdr.

## Findings
(both) `dispatchSlot` :221 returns on busy with no limit. (B) elapsed time is duration, not a demonstrated stall; a mid-rebase merger could be killed. (A) originally proposed auto-fail with an attempt consumed; withdrawn after B's rebuttal.

## Taken
Operator 2026-09-11: `4a`, asked "how will I be warned?". Answer given: a herdr desktop notification once the seat has been busy longer than 60 minutes, and a line in `akrogon status` showing busy duration. Ownership is kept; nothing is interrupted. State records when the seat was first seen busy and clears it when the seat is seen idle. The window is a constant, not a config key. Foreclosed: automatic failure or attempt consumption on a timer.
