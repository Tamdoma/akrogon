# Brief: fewer-repeat-calls

## What

Remove repeated reads inside one akrogon run and make the test fakes cheaper per call:

- herdr: a value read once in a step is passed down instead of read again. A pane's shell is read from herdr once per scope check and boxing as a (pid, start) identity; the adoption poll reads only /proc and refuses a changed start (A,B). A repeated `pane list`, `tab list` or `workspace list` read is removed where an earlier read in the same step already holds the answer with no herdr write, prompt or wait between. Reads right before an action and polls that expect outside change stay fresh.
- git: each registered root's common directory and remote url are read once per run, keeping only a successful answer. A second branch-tip read is removed only where one decision reads it twice with no git write between. Fetch sites stay as they are.
- test fakes: tests/fake-proc.ts hashes with Bun's built-in sha256 instead of loading `node:crypto`, in both `shellPid` and `expectedSlice` (A,B,C), and the fake busctl runs as a per-worker prebuilt bundle like the fake herdr.

## Why

With two full test runs at once, "a leaf re-entering merge queues behind the two leaves stamped earlier" still runs out of its 15 s limit about 1 copy in 4 on a busy host. Its 14 akrogon runs spend 4.2 s, 2.2 s of it in fake herdr calls. In tests/next.test.ts, 33% of herdr calls and 19% of akrogon's git calls repeat an earlier answer in the same run. Each fake herdr call costs 9.9 ms, 3.5 ms of it loading `node:crypto` for hashing. Per-test timeout raises, retries, serial tests and test removal are refused, so the time must come out of the calls.

## Done-criteria

1. In one scope check or boxing of a pane, akrogon asks herdr for that pane's shell pid once, and the adoption poll reads only /proc. A shell whose start time changed after it was read is refused with an error naming the pane, and a pane still outside its scope after adoption fails with the same error as on the base (A,B,C).
2. Each removed `pane list`, `tab list` or `workspace list` read takes its answer from a read earlier in the same step, with no herdr write, prompt or wait between them. The pane check right before a prompt and every read after a herdr write still go to herdr, including after `agent start` and `agent prompt` sent through `run(herdrArgv(...))` (A,B,C).
3. In one akrogon run, `git rev-parse --git-common-dir` and `git remote get-url` run at most once per registered root, and a failed lookup is retried on the next call. `rev-parse HEAD`, `rev-parse --verify` and fetch run on every decision that reads them, and only a second read inside one decision with no git write between is removed (A,B).
4. For the same pane ids and slugs, the fakes give the same shell pids and slice names as on the base, compared on both commits and recorded. The fake herdr no longer loads `node:crypto`, and one fake herdr call and one fake busctl call each take less time than on the base, measured on the same host with before and after recorded (A,B,C).
5. Two copies of the `test` check started together stay green. In one session, 10 pairs on the head alternate with 10 pairs on the base. Every head copy passes, and the re-entering test's slowest head time is below its slowest base time. Each pair's start load is recorded. No smaller test proves this, because the property is the whole suite's run time under a second suite's load.
6. The `test` check uses less CPU than the base. Over three alternating solo runs each on head and base, the head's median user plus system time is below the base's, with the spread recorded.
