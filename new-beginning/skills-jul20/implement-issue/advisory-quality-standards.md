# Advisory Quality Standards

This reference defines the objective advisory quality pass used by `implement-issue` and `check-issue`.

## Contents

- Purpose and precedence
- Applicability
- Tier 1: Cross-language standards
- Tier 2: Surface-specific bands
- Severity calibration
- Measurement rules
- Evidence and report format
- Optional analyzers
- Sources and caveats

## Purpose And Precedence

Use these standards to give the operator measured quality information without changing issue lifecycle composition. A skipped or fabricated required pass is a workflow-compliance defect; a measured threshold exceedance is advisory; an item becomes a normal required fix only after the operator explicitly promotes its `AQ-` ID.

The blocking contract takes precedence when the same evidence proves a regression, a missed plan requirement, or unjustified net complexity growth. Never downgrade a blocking finding merely because this reference also measures it.

## Applicability

Select the Tier-2 band from each changed file's language or artifact type before measuring it. Apply Tier 1 only to new or modified surfaces and directly created clone or dependency relationships. Treat unchanged pre-existing debt as context unless the change worsens it, newly couples to it, or creates a clone from it.

Inventory the assessed files and symbols. For a dimension that cannot apply to the diff, record `not applicable to this diff` with a one-line basis. Do not manufacture a value for an unmeasured dimension.

## Tier 1: Cross-Language Standards

| Dimension | Objective measure | Advisory threshold | Source |
|---|---|---|---|
| Complexity | Cyclomatic complexity per changed function | At most 10; 11-15 requires written justification; above 15 is flagged | McCabe (1976); NIST SP 500-235 section 2.5 |
| Readability | Sonar cognitive complexity per changed function | At most 15; C, C++, and Objective-C use 25 | SonarSource Cognitive Complexity; `eslint-plugin-sonarjs` |
| Nesting | Maximum block nesting depth | At most 4; 3 or less is aspirational | ESLint `max-depth`; Linux kernel coding style |
| Function size | Physical lines in a function body | At most 50 | ESLint `max-lines-per-function`; Clean Code; Sandi Metz rules |
| Signature width | Declared parameters per function | At most 3; more requires special justification | ESLint `max-params`; Clean Code |
| DRY | Duplicate-line density on changed/new lines and each clone family | Less than 3%; report every family of at least 100 tokens and at least 10 lines; zero re-inlined single-source constants | SonarQube metrics and Sonar way new-code gate |
| Maintainability | Visual Studio rebased Maintainability Index, 0-100 | 0-9 red, 10-19 yellow, 20-100 green; flag red or a band drop from the pre-change sibling | Microsoft Visual Studio code metrics |
| Dead code | New unused exports, files, dependencies, and dead representable states | Zero unused exports; every dead representable state gets a keep-or-drop decision ask | Knip; ts-prune convention |
| Churn and clones | Copied versus moved lines, re-edits within two weeks, single-call-site abstractions, information-free comments | Duplication growth does not exceed refactor movement; no single-use abstraction without a named future consumer; no information-free comments | GitClear 2024/2025 research; Nagappan and Ball |
| Elegance | Beck simple-design rules and Ousterhout red-flag scan | Pass tests, reveal intent, no duplication, fewest elements; zero red flags | Fowler's community-standard ordering of Beck's rules; Ousterhout |
| Execution speed | Wall time versus a declared budget and qualitative hot-loop scan | Meet the declared budget; no unbounded nested-loop recomputation of pure functions; hoist loop invariants | Host timing-gate precedent; loop-invariant code motion |

## Tier 2: Surface-Specific Bands

### Python

| Measure | Advisory threshold | Source |
|---|---|---|
| Code and comment line length | 79 and 72; a team may choose 99; Ruff formatter defaults to 88 | PEP 8; Ruff |
| `flake8 --max-complexity` | Disabled by default; 10 is the recommended McCabe setting, not a shipped flake8 default | flake8; mccabe |
| Radon cyclomatic rank | A 1-5, B 6-10, C 11-20, D 21-30, E 31-40, F 41+; flag C or worse | Radon |
| Radon maintainability rank | A 20-100, B 10-19, C 0-9; flag B or C | Radon |

### CSS

- Report duplicate selectors, properties, custom properties, imports, or keyframes; stylelint's recommended rules disallow them.
- Report descending specificity. Inspect the Specificity Graph for spikes instead of inventing a numeric ceiling; avoiding IDs and an optional `selector-max-specificity` value such as `0,3,0` are project choices.

### HTML And Accessibility

| Measure | Advisory threshold | Source |
|---|---|---|
| Image alternatives | WCAG 2.2 success criterion 1.1.1, Level A | W3C; axe `image-alt` |
| Input labels | WCAG 4.1.2, Level A | W3C; axe `label` |
| Document title and root language | WCAG 2.4.2 and 3.1.1, Level A | W3C; axe `document-title`, `html-has-lang` |
| Color contrast | WCAG 1.4.3, Level AA: 4.5:1 normal text; 3:1 large text at least 18 pt or 14 pt bold | W3C; axe `color-contrast` |
| Single H1 and landmarks | axe best practice, not WCAG A/AA conformance | axe-core |

### Web Performance

Measure field results at the 75th percentile.

| Measure | Good / advisory threshold | Poor threshold | Source |
|---|---|---|---|
| LCP | At most 2.5 s | Above 4.0 s | web.dev Core Web Vitals |
| INP | At most 200 ms | Above 500 ms | web.dev Core Web Vitals |
| CLS | At most 0.1 | Above 0.25 | web.dev Core Web Vitals |
| Critical path | About 170 KB total compressed on slow 3G, including a 100 KB JavaScript slice; TTI 5 s | Declared budget exceeded | web.dev performance budgets |
| Lighthouse performance | At least 85/100 | Below 85 | web.dev |

### Agent Markdown

- Keep always-loaded context files under 200 lines and skill bodies under 500 lines. A reference longer than about 100 lines needs a short table of contents.
- Use one H1, never skip heading levels, never use bold as a heading, and keep examples consistent with their governing rules (markdownlint MD001, MD025, and MD036).
- Report cross-file duplication and contradictions. Prefer one authoritative detail reference; apply the deletion test to prose that does not prevent a likely mistake.
- Preserve machine-parsed text, test assertions, locked templates, identifiers, paths, and lifecycle semantics byte-for-byte unless the contract explicitly changes them.

## Severity Calibration

Severity orders advisory attention only and never maps to `C-fix` or gates `D-merge`.

- High: a hard-threshold breach without justification, such as cyclomatic complexity above 15, MI red, an unused export, or a full-file clone.
- Medium: a soft-to-hard band, such as cyclomatic complexity 11-15, cognitive complexity 16-25, nesting depth 5, or a single-call-site abstraction.
- Low: an aspirational miss, such as a 51-80-line function, an information-free comment, or no declared timing budget.

Use the dimension's evidence, not severity, to decide whether a separate blocking contract finding exists.

## Measurement Rules

### Cyclomatic Complexity

Start each function at 1. Add 1 for each `if` or `else if`, loop (`for`, `for...in`, `for...of`, `while`, or `do...while`), `catch`, executable `case`, control-flow conditional expression, and short-circuit `&&` or `||` condition. Do not count `else`, `default`, the `switch` wrapper, comments, strings, type syntax, nullish coalescing, or ternaries that are not control flow in the target language. State the counted constructs so another reviewer can reproduce the total.

The 10/15 guidance is corroborated from McCabe and NIST transcriptions; the primary PDFs were not byte-fetched during the seed pass.

### Cognitive Complexity

Use SonarSource's published Cognitive Complexity algorithm, including structural increments, nesting increments, sequence treatment, and language-specific rules. Prefer a compatible analyzer. If that exact algorithm was not completed, report `not measured`; never substitute cyclomatic complexity or intuition. The default 15 comes from the `eslint-plugin-sonarjs` rule documentation, not the whitepaper landing page.

### Nesting, Function Size, And Parameters

Count maximum lexical control-flow blocks inside the function. Count physical lines from the function body's opening delimiter through its closing delimiter, including comments and blank lines. Count declared parameters, including destructured or defaulted parameters as one each; do not expand object fields.

### Duplication

Normalize only formatting and identifiers whose role-equivalence is being tested; do not normalize away behavior. Report changed-surface duplicate-line density as duplicated changed/new lines divided by total changed/new lines, and separately list every clone family meeting both 100 tokens and 10 lines. A passing density never suppresses a qualifying family. Report a re-inlined single-source constant even when it is smaller than the block threshold.

### Maintainability Index

Use the Visual Studio rebased formula `max(0, (171 - 5.2 × ln(Halstead Volume) - 0.23 × cyclomatic complexity - 16.2 × ln(lines of code)) × 100 / 171)`. Record Halstead Volume, cyclomatic complexity, and lines of code. If those inputs were not computed, report `not measured`; a line-count proxy is not MI. Do not conflate this 0-100 scale with the unbounded original SEI/Oman-Hagemeister index.

### Dead Code, Churn, And Elegance

Search references for every new export, file, dependency, schema value, and union member. Distinguish public contract intent from actual consumers and ask keep-or-drop for representable states no path produces. Compare copied and moved lines where history exists; identify abstractions with one call site and comments whose deletion loses no information. Apply Fowler's community-standard reordering of Beck's rules and note that Beck's original ordering placed no duplication before reveals intent.

GitClear's definitions and trend direction are usable; do not quote gated per-year churn percentages without verification. Treat elegance red flags as qualitative-by-kind evidence, not invented counts.

### Execution Speed

Run the declared timing fixture or benchmark and record workload, command, wall time, and budget. Independently scan nested loops for repeated parsing, allocation, I/O, or pure computation that could be hoisted. When no timing budget exists, report a low-severity `no declared timing budget` item and the qualitative hot-loop result; do not fabricate a performance verdict.

## Evidence And Report Format

Every numeric advisory item includes the method or command, measured value, threshold, source, affected surface, and smallest remedy. If a numeric result was not produced, write `not measured`, the reason, and the smallest optional analyzer that would produce it. Qualitative-by-kind dimensions name the observed kind and evidence.

Assign artifact-local IDs as `AQ-<DIMENSION>-<NN>`, for example `AQ-COMPLEXITY-01`. IDs are scoped to the active Quality Self-Check block or review subsection; there is no cross-issue registry. A persistent item retains its ID when the block is refreshed. Assign a new number only to a genuinely new item.

Order one-line prose bullets by severity. Use one bullet per dimension and surface; aggregate repeated violations and clone-family members. Advisory output is prose only: never use task-list or checkbox syntax.

Example item:

```text
- AQ-COMPLEXITY-01 — high — Complexity — `routeRequest` measured 18 by manual decision-point count versus the 15 hard band (McCabe/NIST); extract the validation branch.
```

When no threshold is exceeded, state that in prose and retain required `not measured`, non-applicable, and no-timing-budget disclosures. A reproduced exceedance remains advisory unless the operator explicitly promotes its ID.

## Optional Analyzers

Optional analyzers accelerate evidence collection but are never prerequisites: ESLint `complexity`, `max-depth`, `max-lines-per-function`, and `max-params`; `eslint-plugin-sonarjs`; `jscpd`; Knip; ts-prune; stylelint; axe-core; Ruff; Radon; Lighthouse. Use the host project's installed tools when available. Do not install a dependency merely to complete the advisory pass.

## Sources And Caveats

- McCabe, *A Complexity Measure* (1976); NIST SP 500-235 section 2.5; SonarSource Cognitive Complexity and `eslint-plugin-sonarjs` rule documentation.
- ESLint `max-depth`, `max-lines-per-function`, and `max-params`; SonarQube metric definitions and Sonar way new-code gate.
- Microsoft Visual Studio Maintainability Index range and formula; Knip and ts-prune documentation.
- GitClear 2024/2025 AI code-quality research; Nagappan and Ball relative-churn research; Fowler's *BeckDesignRules*; Ousterhout's *A Philosophy of Software Design*.
- PEP 8; Ruff, flake8, mccabe, and Radon documentation; stylelint rules; CSS Wizardry Specificity Graph.
- W3C WCAG 2.2; axe-core rule descriptions; web.dev Core Web Vitals and performance-budget guidance.
- `.claude/docs/quality-standards.md` Part II and Part III for agent Markdown and behavior-preserving edits.

Thresholds are advisory baselines, not claims that a tool's default configuration or a best-practice rule is a conformance requirement. Preserve the exact caveats above when applying or updating them.
