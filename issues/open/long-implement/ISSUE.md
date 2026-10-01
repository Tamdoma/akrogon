# Issue: long-implement

- [wave-table](wave-table/brief.md): the plan groups units into waves and A runs each wave whole, so independent workers stop running one at a time
- [proof-order](proof-order/brief.md): A runs cheap proof before slow runs, overlaps independent repairs with a slow run, and waits on a slow command's real exit
