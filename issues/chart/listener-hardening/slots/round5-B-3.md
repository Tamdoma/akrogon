Re-check: ready

Reviewed amended HEAD `fdd2069f7399adb7b0d89986120c22ef31de6e20`. F2 is fixed: ready machines process their own tabs while loading/unavailable machines retain their known IDs. F1's loading-to-ready behavior remains covered.

Targeted tab suite: 10 pass, 0 fail. Also reproduced the ready-local/unavailable-remote case with the helper: the local leaf receives its tail move and the remote list stays intact.
