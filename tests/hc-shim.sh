#!/bin/sh
# Recording hc in front of the real one. Logs each call's argv (one JSON-ish line, args joined by
# a tab) to $HC_SHIM_LOG, then runs the real hc ($HC_SHIM_REAL). When the file $HC_SHIM_UNAVAILABLE
# exists, the next `send` removes it and answers hc's "still starting" refusal instead, the one
# reply a stand-in cannot produce on demand (forks/proofs.md P1); every other call reaches the core.
[ -n "$HC_SHIM_LOG" ] && (IFS='	'; printf '%s\n' "$*") >> "$HC_SHIM_LOG"
if [ "$1" = send ] && [ -n "$HC_SHIM_UNAVAILABLE" ] && [ -e "$HC_SHIM_UNAVAILABLE" ]; then
	rm -f "$HC_SHIM_UNAVAILABLE"
	printf '%s\n' '{"error":{"kind":"unavailable","message":"still starting: its output has not settled"}}' >&2
	exit 1
fi
exec "${HC_SHIM_REAL:?}" "$@"
