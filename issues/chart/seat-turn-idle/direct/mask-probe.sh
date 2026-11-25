#!/usr/bin/env bash
# Charting probe: claude's 7501 status while a turn-started background shell lives, and after it is killed.
# Budget: 1 claude session (claude-haiku-5-5, effort low), 300 s wall. Tools: only Bash(sleep:*) allowed.
set -u
export XDG_RUNTIME_DIR=/run/user/1000 HC_SESSION=infra
CWD=/home/ivan/Work/infra/akrogon/issues/chart/seat-turn-idle/direct/probe-cwd
get() { hc get --json "$T" | python3 -c "import json,sys;d=json.load(sys.stdin);print(json.dumps({k:d.get(k) for k in ['state','turn','status','records','reported']}))"; }
st() { hc get --json "$T" | python3 -c "import json,sys;d=json.load(sys.stdin);s=d.get('status') or {};print(s.get('state'),'|',s.get('msg') or '')"; }
T=$(cd $CWD && hc run --bg --no-notify -- claude --model claude-haiku-5-5 --effort low --allowedTools 'Bash(sleep:*)' | python3 -c "import json,sys;print(json.load(sys.stdin)['address'])")
echo "terminal $T"
for i in $(seq 1 30); do case "$(st)" in idle*|done*) break;; esac; sleep 2; done
echo "ready: $(get)"
hc send --json $T "Use your Bash tool with run_in_background set to true to run exactly: sleep 600 . Then reply with the single word started and end your turn. Do nothing else."
for i in $(seq 1 45); do sleep 2; case "$(st)" in *shell*) break;; esac; done
sleep 10
echo "masked: $(get)"
hc read $T | tail -6
CPID=$(hc get --json $T | python3 -c "import json,sys;print(json.load(sys.stdin)['pid'])")
echo "children of $CPID:"; ps -o pid,pgid,comm,args --ppid $CPID | cut -c1-120
SH=$(ps -o pid=,comm= --ppid $CPID | awk '$2~/sh$/{print $1;exit}')
PG=$(ps -o pgid= -p $SH | tr -d ' ')
echo "killing process group $PG"; kill -TERM -- -$PG
sleep 8
echo "after-kill: $(get)"
hc kill $T >/dev/null 2>&1; sleep 1; hc rm $T >/dev/null 2>&1
echo "cleanup: $(hc get --json $T >/dev/null 2>&1 && echo still-present || echo removed)"
