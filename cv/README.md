# CV archive

Each CV version lives in its own date-stamped folder, `YY.MM.DD_kinney_cv/`,
containing the LaTeX source (`.tex`) and the compiled PDF. LaTeX build
artifacts (`.aux`, `.log`, `.fls`, etc.) are excluded by the repo `.gitignore`.

`kinney_cv.pdf` in this directory is a copy of the **current** CV. That is the
stable path the website links to (`/cv/kinney_cv.pdf`), via the `CV` column in
`backend/people.csv`.

## Posting a new CV

1. Add the new dated folder, e.g. `cv/27.01.15_kinney_cv/` with its `.tex` and `.pdf`.
2. Copy the new PDF over the stable one:

   ```
   cp cv/27.01.15_kinney_cv/27.01.15_kinney_cv.pdf cv/kinney_cv.pdf
   ```

3. Commit both. No changes to `backend/people.csv` or `script.js` are needed —
   the website link points at `kinney_cv.pdf` and never changes.

Older dated folders stay in place as the archive.
