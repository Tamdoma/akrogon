# Cap simulation C

Same dependency graph and measured child spans as map-C, with satellite-build corrected so unit 4 waits on units 2 and 3 (`satellite-build/implementation/brief-4.md:20`).

Wall-clock minutes per leaf (serial, cap 2, cap 3, cap 4):

| Leaf | Serial | Cap 2 | Cap 3 | Cap 4 |
|---|---|---|---|---|
| content-batch | 392 | 200 | 151 | 139 |
| plan-script | 368 | 238 | 201 | 182 |
| satellite-build | 299 | 255 | 255 | 255 |

Cap 3 buys 37-49 more minutes over cap 2 on the two leaves whose plans state no execution ordering (`content-batch/plan.md:129`, `plan-script/plan.md:293`). On satellite-build the 1-2-3-4 chain (20+82+70+83 minutes) is the floor, so no cap helps past 2.

Graph used:
- content-batch: 4 after 2,3; 5,6,7 after 2; 13 after 4,5,6; 9 after 1,7,8; 10 after 1,8; 11 after 4; 12 after 4,13.
- plan-script: 2,7,8 after 1; 9 after 4,5,6,7; 10 after 9; 11 after 3,8,9.
- satellite-build: 2 after 1; 3 after 2; 4 after 1,2,3; 5 after 1.
