# Implementation evidence

## Link check

Exact invocation from the leaf worktree (temporary fixtures are automatically deleted):

```sh
python - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit, unquote
import sys

class Links(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key == 'href':
                assert value is not None, 'href without a value'
                self.hrefs.append(value)


def check(root: Path) -> tuple[int, int, list[tuple[str, str]]]:
    root = root.resolve()
    pages: list[Path] = sorted(root.glob('*.html'))
    count: int = 0
    failures: list[tuple[str, str]] = []
    for page in pages:
        parser: Links = Links()
        parser.feed(page.read_text())
        for href in parser.hrefs:
            url = urlsplit(href)
            if url.scheme or url.netloc or href.startswith(('#', '/')):
                continue
            count += 1
            target: Path = (page.parent / unquote(url.path)).resolve()
            if not target.is_relative_to(root) or not target.is_file():
                failures.append((page.name, href))
    return len(pages), count, failures

with TemporaryDirectory(prefix='docs-link-fixture-') as temporary:
    root: Path = Path(temporary) / 'docs'
    root.mkdir()
    (Path(temporary) / 'outside.css').write_text('')
    (root / 'asset file.css').write_text('')
    (root / 'index.html').write_text('''<a href="asset%20file.css?x=1#part"></a>
<a href="#top"></a><a href="https://example.com/missing"></a>
<a href="//example.com/missing"></a><a href="/absolute"></a>''')
    assert check(root) == (1, 1, []), check(root)
    print('PASS: existing encoded relative file with query/fragment; fragment and absolute URL exclusions')
    with (root / 'index.html').open('a') as page:
        page.write('<a href="missing.html"></a><a href="../outside.css"></a>')
    assert check(root) == (1, 3, [('index.html', 'missing.html'), ('index.html', '../outside.css')]), check(root)
    print('PASS: missing and outside-docs targets rejected:', check(root)[2])

pages, count, failures = check(Path('docs'))
for page, href in failures:
    print(f'FAIL: {page}: {href}')
print(f'{pages} pages, {count} relative hrefs, {len(failures)} failures')
sys.exit(1 if failures else 0)
PY
```

Exit 0:

```text
PASS: existing encoded relative file with query/fragment; fragment and absolute URL exclusions
PASS: missing and outside-docs targets rejected: [('index.html', 'missing.html'), ('index.html', '../outside.css')]
16 pages, 288 relative hrefs, 0 failures
```

Page-set assertion: exact 16 replacement HTML pages, guide absent, exit 0.

## Final verification

- AC1: exact 16 page-set assertion and guide absence passed.
- AC2: link command above exited 0, checking 288 relative hrefs. Negative and edge fixtures passed and were deleted.
- AC3: `grep -rn "guide.html" src skills plugin docs REFERENCE.md` and `rg -n 'guide\.html' tests/browser` both returned no output, exit 1, with no stderr.
- AC4: `bunx playwright test --config tests/browser/playwright.config.ts`: 4 passed. The same command with docs-concepts.config.ts: 4 passed, docs-operate.config.ts: 4 passed, docs-practice.config.ts: 24 passed. Every process exited 0. Existing configs exercised headless Chromium at desktop/mobile sizes with and without reduced motion, trace on and video off.
- AC5: `bun run format`, `bun test` (43 pass, 0 fail, 487 assertions), `bun run typecheck`, and `git diff --check` exited 0. Worker changed-test command against a2b9e07179546a935f854d5a9ea9ca160c5d3408 exited 0 with no affected unit tests. No application HTML except the deleted guide changed, and no config/dependency/CSS changes were needed.

Fail-first: after deleting the guide, `bunx playwright test --config tests/browser/playwright.config.ts --list` exited 1 with ENOENT at docs-shell.pw.ts:23 for docs/guide.html. Final full browser execution above provides green evidence.

Logs are under the worktree's `.evidence/docs-retire-guide/`: links.log, playwright.log, docs-concepts.log, docs-operate.log, docs-practice.log, format.log, unit.log, typecheck.log.

Browser artifacts are under `.evidence/docs-shell/browser` (4 traces, 8 screenshots), `.evidence/docs-concepts/browser` (4 traces, 16 screenshots), `.evidence/docs-operate/browser` (4 traces, 20 screenshots), and `.evidence/docs-practice/browser` (24 traces, 20 screenshots). Example: `.evidence/docs-shell/browser/docs-shell.pw.ts-complete-file-navigation-and-rendering-desktop/trace.zip` and sibling index.png. Artifact paths are relative to /home/ivan/Work/infra/akrogon/issues/worktrees/docs-retire-guide.

Changed files and reasons: docs/guide.html removed; four browser specs repaired to retain independent checks without the deleted source. As required by implement-issue's applied-lesson instruction, removed the active guide-source-spec lesson line and dated its preserved history. This bookkeeping is the only addition to the plan's implementation file list. No new lesson, feature, or documentation rewrite was introduced.

Known limitations: historical source equivalence ends at retirement. Existing parts/next/day geometry exceptions remain and external font loading remains a browser-test dependency. Local link existence does not prove external availability or every fragment target.

Unverified criteria: none.

Committed as f934e4c (docs: retire monolithic guide and source comparisons). Post-commit worktree status is clean. Commit is ahead of configured base a2b9e07179546a935f854d5a9ea9ca160c5d3408, with no issue artifacts in the branch diff.
