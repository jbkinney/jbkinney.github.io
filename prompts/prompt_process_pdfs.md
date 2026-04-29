Process PDF files that have been placed in `publications/files_to_process/`.

For each PDF:

1. Read the first page to identify the publication (title, authors, journal/preprint server).
2. Determine whether it is a main paper PDF or supplementary information (SI).
3. Match it to a row in `backend/all_publications.csv` using the title and authors.
3a. **Check whether this is the published version of an existing preprint row.** A preprint row has a `preprint` URL but no `paper` URL. If the new PDF is the journal-published version of such a row (same title and authors, now appearing in a journal), treat it as a *preprint-to-published replacement*:
    - Confirm the replacement with the user before proceeding.
    - Assign a new `pub_id` reflecting the publication year and an updated short description (the old preprint's `pub_id` becomes obsolete). Example: `Petti2025_gaussian` → `Petti2026_gaugefixing`.
    - Create `publications/files/{new_pub_id}/` and move the new PDF there as `{new_pub_id}_main.pdf`.
    - For posterity, move the old preprint PDF from `publications/files/{old_pub_id}/{old_pub_id}_main.pdf` to `publications/files/{new_pub_id}/{new_pub_id}_preprint.pdf` (and any `_si.pdf` similarly to `{new_pub_id}_preprint_si.pdf`).
    - Delete the now-empty `publications/files/{old_pub_id}/` directory.
    - Replace the old preprint row in the CSV with a new row for the published version. Update: `date` (publication date — `YYYY-MM-DD` if known, else `YYYY-MM` or `YYYY`), `short_cite` (the year in parens must match the publication year, e.g., `Petti et al. (2026)`), `venue`, `paper` (journal URL), `pub_id`, `doi`. Preserve the original arXiv/bioRxiv URL in the `preprint` column. **Keep `led_by_kinney` unchanged from the preprint row** — do not re-evaluate it based on changes in author order between preprint and published version.
    - Because the publication year (and so `date`) and `short_cite` change, the new row will move out of the preprint's year-section into the publication year's year-section. The final sort step at the end of this prompt handles row placement automatically.
    - Drop the old preprint row entirely (do not keep it as a separate "superseded" entry).
    - Skip steps 4–7 below for this PDF (they are subsumed by this replacement workflow); then continue to step 8.
4. If the matched row does not yet have a `pub_id`, assign one using the convention below and add it to the CSV.
5. Create the directory `publications/files/{pub_id}/` if it does not exist.
6. Move the file there as `{pub_id}_main.pdf` or `{pub_id}_si.pdf` (do not copy — remove from `files_to_process/`).
7. Update the CSV: set `has_pdf` or `has_si` to `TRUE` for that row. If you are creating a new row, also populate the `date` column with the most precise date available (`YYYY-MM-DD`, else `YYYY-MM`, else `YYYY`). The `date` column is the source of truth for both year and within-year ordering — there is no separate `year` column.
8. Delete any duplicate files (e.g., `file (1).pdf`) from `files_to_process/`.
8b. If a publication now has both `{pub_id}_main.pdf` and `{pub_id}_si.pdf`, combine them into `{pub_id}_all.pdf` using `pdfunite` (available at `/usr/local/bin/pdfunite`).

After all PDFs have been processed:

9. For each newly processed PDF where `led_by_kinney` is TRUE, read the full text (or at least the first and last pages, data availability section, and any code/software section) to look for:
   - **GitHub links** (e.g., github.com/...) — add to the `github` column if not already populated.
   - **ReadTheDocs links** (e.g., *.readthedocs.io) — add to the `readthedocs` column if not already populated.
   - **PyPI package names** that might imply a ReadTheDocs site — flag these for the user.
   - Only populate `github` and `readthedocs` for `led_by_kinney=TRUE` publications.
10. **Re-sort the CSV globally by running `uv run --no-project backend/sort_publications.py`.** This is the final step on the CSV — do not hand-sort rows. The script sorts within each year by: (1) `led_by_kinney=TRUE` first, (2) preprints (row has a `preprint` URL but no `paper` URL) before published, (3) most recent `date` first, with rows missing month/day falling to the end of their subgroup. Year-level ordering on the website is automatic; the CSV's year-section ordering is preserved by the script.
11. Report to the user what was processed, what links were found, and any issues.

Notes:
- PDFs and SI should be stored for ALL publications AND preprints (both led_by_kinney=TRUE and FALSE).
- GitHub and ReadTheDocs links should only be populated for `led_by_kinney=TRUE` entries.

Reference files:
- CSV: `backend/all_publications.csv`
- File storage: `publications/files/{pub_id}/{pub_id}_main.pdf` and `{pub_id}_si.pdf`
- pub_id convention: `FirstauthorYEAR_shortdesc` (e.g., `Kinney2010_sortseq`)
