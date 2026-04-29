Start a local web server for this site and report the URL.

1. Check whether a server is already listening on port 8000 (use `lsof -nP -iTCP:8000 -sTCP:LISTEN`). If one is already running, skip to step 3.
2. Start the server in the background from the repo root: `python3 -m http.server 8000`
3. Confirm the server is up by curling http://localhost:8000/ and checking for a 200 response.
4. Report the URL to the user: http://localhost:8000/
