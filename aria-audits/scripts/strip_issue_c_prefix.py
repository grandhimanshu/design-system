#!/usr/bin/env python3
"""
Temporary helper: rewrite CRITICAL_ISSUES_READABLE.md
  - ### C01 —  ->  ### 1 —
  - C07, C21–C24, C01*  ->  7, 21–24, 1*  (leading zeros dropped)
  - Adds an "Issue #(s)" column to the top "Issue count per component" table
    using the "## Index by component" section (run mapping before stripping C).

Usage:
  python3 strip_issue_c_prefix.py              # in-place, default target
  python3 strip_issue_c_prefix.py --dry-run  # print to stdout only
  python3 strip_issue_c_prefix.py path/to/CRITICAL_ISSUES_READABLE.md

Safe to re-run only on files that still use the C-prefix (second run won't
duplicate the Issue column if the header already contains "Issue #").
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DEFAULT_MD = Path(__file__).resolve().parent.parent / "CRITICAL_ISSUES_READABLE.md"

INDEX_START = "## Index by component"
COUNT_HEADER_RE = re.compile(
    r"^(\|[^\n]*Component[^\n]*\|\s*)(Critical issues\s*\|)\s*$",
    re.IGNORECASE,
)


def c_to_num_token(match: re.Match[str]) -> str:
    return str(int(match.group(1)))


def strip_c_prefixes(text: str) -> str:
    """Replace C01, C34, etc. with 1, 34 (everywhere in file)."""
    return re.sub(r"C(\d+)", c_to_num_token, text)


def parse_index_component_issues(text: str) -> dict[str, str]:
    """
    Parse the index table: Component -> Issues cell (may contain C07, ranges, *).
    """
    if INDEX_START not in text:
        return {}
    start = text.index(INDEX_START)
    rest = text[start:]
    # Table ends at next --- or ## that isn't part of the table
    lines = rest.splitlines()
    mapping: dict[str, str] = {}
    for line in lines[1:]:
        stripped = line.strip()
        if not stripped.startswith("|"):
            if stripped.startswith("---") or stripped.startswith("##"):
                break
            continue
        if re.match(r"^\|\s*-+", stripped):
            continue
        parts = [p.strip() for p in stripped.split("|")]
        parts = [p for p in parts if p]
        if len(parts) < 2:
            continue
        comp, issues = parts[0], parts[1]
        if comp.lower() == "component" or issues.lower().startswith("issue"):
            continue
        mapping[comp] = issues
    return mapping


def inject_issue_count_column(text: str, component_to_issues: dict[str, str]) -> str:
    """Insert Issue #(s) column into the first matching Component | Critical issues header block."""
    if "Issue #" in text.split("## Suggested fix order", 1)[0]:
        # Already has issue-ID column in the top section
        return text

    lines = text.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    injected = False
    while i < len(lines):
        line = lines[i]
        m = COUNT_HEADER_RE.match(line.rstrip("\n"))
        if m and not injected:
            out.append(
                "| Component                 | Issue #(s)    | Critical issues |\n"
                "| ------------------------- | ------------- | --------------: |\n"
            )
            i += 1
            # Skip original header + separator
            if i < len(lines):
                i += 1
            if i < len(lines) and re.match(r"^\|\s*-", lines[i].strip()):
                i += 1
            while i < len(lines):
                row = lines[i]
                rs = row.rstrip("\n")
                if not rs.strip().startswith("|"):
                    break
                if re.match(r"^\|\s*-+", rs.strip()):
                    i += 1
                    continue
                parts = [p.strip() for p in rs.split("|")]
                parts = [p for p in parts if p]
                if len(parts) >= 2:
                    comp, count = parts[0], parts[1]
                    issues = component_to_issues.get(comp, "—")
                    issues = strip_c_prefixes(issues)
                    out.append(f"| {comp:<25} | {issues:<13} | {count:>15} |\n")
                else:
                    out.append(row)
                i += 1
            injected = True
            continue
        out.append(line)
        i += 1
    return "".join(out)


def transform(text: str) -> str:
    mapping = parse_index_component_issues(text)
    text = inject_issue_count_column(text, mapping)
    text = strip_c_prefixes(text)
    return text


def main() -> int:
    p = argparse.ArgumentParser(description="Strip C prefix from issue IDs in readable critical issues MD.")
    p.add_argument(
        "markdown",
        nargs="?",
        type=Path,
        default=DEFAULT_MD,
        help=f"Target markdown (default: {DEFAULT_MD})",
    )
    p.add_argument("--dry-run", action="store_true", help="Print result to stdout; do not write file.")
    args = p.parse_args()
    path: Path = args.markdown
    if not path.is_file():
        print(f"Not a file: {path}", file=sys.stderr)
        return 1
    original = path.read_text(encoding="utf-8")
    updated = transform(original)
    if args.dry_run:
        sys.stdout.write(updated)
        return 0
    path.write_text(updated, encoding="utf-8")
    print(f"Updated: {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
