# Brief: one free fact check in your own terminal (slot C)

Run exactly this in your own tool shell and write its full output to /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/fg-check-c.md:

```bash
hc get --json $HC_TERMINAL_ID | jq -c '{pid,argv:.argv[0:2],fg:.foreground|{pid,argv:.argv[0:2]}}'; p=$$; while [ "$p" -gt 1 ]; do printf '%s:%s ' $p "$(ps -o comm= -p $p)"; p=$(ps -o ppid= -p $p | tr -d ' '); done; echo
```

Change nothing else. Then run: hc send t126 "done c: /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness/slots/fg-check-c.md"
