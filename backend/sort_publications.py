"""Sort backend/all_publications.csv globally.

Usage:
    uv run --no-project backend/sort_publications.py

Within each year (the year is the first 4 chars of the `date` column), sort by:
    1. led_by_kinney=TRUE before led_by_kinney=FALSE
    2. Preprints (row has a `preprint` URL but no `paper` URL) before published papers
    3. Most recent first by `date` (full YYYY-MM-DD beats YYYY-MM beats YYYY).
       Rows with missing month/day go to the end of their subgroup.
    4. Within full ties, preserve existing CSV order (stable sort).

Year-level ordering in the CSV is preserved (the publications page sorts years
descending automatically, so CSV year order is cosmetic).
"""
import csv
import sys
from collections import OrderedDict
from pathlib import Path

CSV_PATH = Path(__file__).resolve().parent / "all_publications.csv"


def parse_date(s):
    """Return (year, month, day) with 0 placeholders for missing parts."""
    s = (s or "").strip()
    parts = s.split("-")
    y = int(parts[0]) if len(parts) >= 1 and parts[0].isdigit() else 0
    m = int(parts[1]) if len(parts) >= 2 and parts[1].isdigit() else 0
    d = int(parts[2]) if len(parts) >= 3 and parts[2].isdigit() else 0
    return y, m, d


def is_preprint(row):
    return bool((row.get("preprint") or "").strip()) and not (row.get("paper") or "").strip()


def is_led(row):
    return (row.get("led_by_kinney") or "").strip().upper() == "TRUE"


def main():
    with CSV_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if "date" not in (fieldnames or []):
        sys.exit("`date` column missing from CSV — has the migration run?")

    # Tag with original index for stable fallback
    for i, r in enumerate(rows):
        r["_orig"] = i

    # Group by year while preserving the order years first appear in the CSV
    by_year = OrderedDict()
    for r in rows:
        y = (r.get("date") or "").strip()[:4] or "Unknown"
        by_year.setdefault(y, []).append(r)

    out_rows = []
    changes = []
    for year, group in by_year.items():
        def keyfn(r):
            led_key = 0 if is_led(r) else 1
            pre_key = 0 if is_preprint(r) else 1
            y, m, d = parse_date(r.get("date", ""))
            # Within a sub-group rows with full date come before partial.
            # Sort primarily by recency (descending), so negate.
            # Rows missing month or day will have 0s, which sort after positive values
            # in descending order: e.g. (-2026, -4, -6) < (-2026, -4, 0) < (-2026, 0, 0).
            date_key = (-y, -m, -d)
            return (led_key, pre_key, date_key, r["_orig"])

        sorted_group = sorted(group, key=keyfn)
        if [r["_orig"] for r in sorted_group] != [r["_orig"] for r in group]:
            changes.append((year, [r["pub_id"] for r in group], [r["pub_id"] for r in sorted_group]))
        out_rows.extend(sorted_group)

    for r in out_rows:
        r.pop("_orig", None)

    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for r in out_rows:
            writer.writerow(r)

    print(f"Wrote {len(out_rows)} rows. Years that changed: {len(changes)}")
    for year, before, after in changes:
        print(f"\n--- {year} ---")
        print("BEFORE:")
        for pid in before:
            print(f"  {pid}")
        print("AFTER:")
        for pid in after:
            print(f"  {pid}")


if __name__ == "__main__":
    main()
