#!/bin/bash
# probe helper: wait for the agent's turn to end, kill it, restart a fresh claude in the same pane
[ -z "$HANDOVER_DETACHED" ] && { HANDOVER_DETACHED=1 setsid -f "$0" "$@"; exit 0; }
P=$1; NAME=$2; LOG=$3; PROMPT=$4
exec >>"$LOG" 2>&1
echo "helper start $(date -u +%T.%3N) pid $$ sid $(ps -o sid= -p $$)"
herdr agent wait "$P" --timeout 120000 | jq -c '.result.agent | {agent_status, session: .agent_session.value}'
PG=$(herdr pane process-info --pane "$P" | jq -r '.result.process_info.foreground_process_group_id')
herdr pane process-info --pane "$P" | jq -c '[.result.process_info.foreground_processes[] | {pid, argv: .argv[0:3]}]'
echo "killing group $PG at $(date -u +%T.%3N)"
kill -TERM -- "-$PG"
for i in $(seq 1 30); do
  sleep 0.5
  FG=$(herdr pane process-info --pane "$P" | jq -r '.result.process_info.foreground_processes[0].argv[0] // "none"')
  case "$FG" in *bash|*zsh|*fish|*sh) break;; esac
done
echo "shell back after ${i} polls: $FG at $(date -u +%T.%3N)"
herdr agent start "$NAME" --kind claude --pane "$P" -- "$PROMPT" | jq -c '.result.agent // . | {name, agent_status, session: .agent_session.value}'
echo "start exit ${PIPESTATUS[0]} at $(date -u +%T.%3N)"
