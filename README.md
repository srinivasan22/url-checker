# URL Checker

A small, dependency-free browser app for validating a URL and checking it against a client-side mock server. It reports whether a recognized URL exists and whether it points to a file or a folder.

## Run the app

No installation or build step is required.

1. Open `index.html` directly in a browser.

Alternatively, serve the project locally with Python:

```sh
python3 -m http.server 4173
```

Then open <http://localhost:4173>. Stop the server with `Ctrl+C`.

## Use

Enter an HTTP or HTTPS URL. The app validates it as you type, then asynchronously checks it against the mock data. Checks are throttled to avoid repeated requests while editing.

The mock recognizes these URLs:

| URL | Result |
| --- | --- |
| `https://example.com/` | Existing folder |
| `https://example.com/docs/` | Existing folder |
| `https://example.com/docs/guide.pdf` | Existing file |
| `https://example.com/assets/logo.svg` | Existing file |

Other valid HTTP or HTTPS URLs are reported as not found. The mock runs entirely in the browser; it does not contact the example domain or any other server.
