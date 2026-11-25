# Probe entry: when this shell sits exactly at the marked scope root, move it into tools/t-<pid>-<start>.
__akp() {
  [ -n "${AKROGON_SEAT_CGROUP:-}" ] || return 0
  local cur
  cur=$(sed -n 's/^0:://p' /proc/self/cgroup 2>/dev/null) || return 0
  [ "/sys/fs/cgroup$cur" = "$AKROGON_SEAT_CGROUP" ] || return 0
  local st
  st=$(cat /proc/$$/stat 2>/dev/null) || return 0
  st=${st##*) }
  set -- $st
  local d="$AKROGON_SEAT_CGROUP/tools/t-$$-${20}"
  mkdir -p "$d" 2>/dev/null && echo $$ > "$d/cgroup.procs" 2>/dev/null && export AKROGON_TOOL_CGROUP="$d" && echo "placed $$ $d" >> "${AKROGON_PROBE_LOG:-/dev/null}" 2>/dev/null
  return 0
}
__akp
unset -f __akp
true
