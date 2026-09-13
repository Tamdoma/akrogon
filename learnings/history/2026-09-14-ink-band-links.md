# Links inside ink-band pre blocks render invisible

2026-09-14. Leaf guide-chart-picture: plan D5 named `cheat.html:64` for a chart-line link to `chart.html`, but the line sits inside `<pre><code>` on `.ink-band`, where `style.css` sets `.ink-band a{color:var(--parchment)}` — identical to the code text color, so a link there is invisible.

The implementer left the line unlinked and recorded it under known limitations. Review verdict: acceptable deviation, recorded as a Nit.

Learning: when a guide-edit plan names a line inside a dark `<pre>` block for a link, check the band's link color first. Either restyle `.ink-band pre a` (e.g. underline) or accept the line staying unlinked; do not add an invisible link.
