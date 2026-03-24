# Temporary scripts

## `strip_issue_c_prefix.py`

Rewrites `CRITICAL_ISSUES_READABLE.md`:

- Headings `### C01 —` → `### 1 —` (drops the `C`, no leading zeros).
- All other `C` + digits in the file (index, footnotes) get the same treatment.
- Inserts an **Issue #(s)** column into **Issue count per component**, filled from **Index by component** (parses the index before rewriting).

```bash
cd aria-audits/scripts
python3 strip_issue_c_prefix.py --dry-run   # preview on stdout
python3 strip_issue_c_prefix.py             # write ../CRITICAL_ISSUES_READABLE.md
```

Re-running after the file already has numeric IDs is mostly harmless (no `C` left to replace). The script skips adding a second **Issue #** column if that header already appears above **Suggested fix order**.
