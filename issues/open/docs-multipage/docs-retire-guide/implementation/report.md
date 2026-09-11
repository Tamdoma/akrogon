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
