# Personal website — Devashish Shah

A plain static site: five HTML pages, one stylesheet, one script. No build step, no
framework, no dependencies. Open `index.html` in a browser and it works.

```
.
├── index.html          About  (hero, bio, skills)
├── research.html       Interests, publications, preprints, earlier projects
├── teaching.html       Lab courses, theory courses, outreach
├── academics.html      Education, coursework, awards
├── hobbies.html        Photo gallery with lightbox
├── .nojekyll           tells GitHub Pages to serve the files as-is
└── assets
    ├── css/style.css   every style, with a token block at the top
    ├── js/main.js      theme toggle, mobile nav, lightbox
    ├── img/            placeholder images — replace these
    └── files/          put CV.pdf and any other downloads here
```

## Putting it on GitHub Pages

**See [PUBLISHING.md](PUBLISHING.md) for the click-by-click version, done entirely in a
browser.** The summary, for a site at `https://<username>.github.io`:

1. Create a repository named exactly `<username>.github.io`.
2. Copy these files into it (the HTML must sit at the repository root, not in a subfolder).
3. `git add . && git commit -m "Initial site" && git push`
4. Repository → **Settings** → **Pages** → Source: *Deploy from a branch*, Branch: `main`, folder `/ (root)`.
5. Give it a minute; the URL appears on that same settings page.

For a project site instead (`https://<username>.github.io/website`), name the repo whatever you
like and do the same. All links here are relative, so both work unchanged.

A custom domain, if you ever want one: add a `CNAME` file containing just the domain, then point a
CNAME DNS record at `<username>.github.io`.

## Editing it

**Text and content** — open the relevant `.html` file. Every place meant to be
replaced is flagged with an `<!-- EDIT: ... -->` comment. Adding an item almost always means
copying the block above it and changing the words.

**The navigation menu** lives in every page's `<header>`, and the five copies are byte-identical.
If you add a page, paste a new `<li>` into all five and copy the header from an existing file into
the new one. `main.js` highlights the current page automatically — you never set an "active" class
by hand.

**Colours, fonts, widths** — the `:root` block at the top of `style.css`. Change `--accent` and the
whole site follows. The `[data-theme="dark"]` block right below it holds the dark palette.

**Photos** — replace the files in `assets/img/`. Keep the same filenames and nothing else needs
touching; otherwise update the `src` attributes. Real photos should be JPG or WebP, roughly
1600 px on the long edge, and under ~300 KB each.

**Your CV** — drop `CV.pdf` into `assets/files/`. The button on the home page already points there.

**Gallery** — each image on the hobbies page is one `<button>` in `.gallery`. Copy a block to add
one. `data-full` on the `<img>` is optional: set it to a larger file and the lightbox loads that
instead of the thumbnail.

## What's built in

- Light/dark theme, following the system setting on first visit and remembering the choice after
  that. Applied before first paint, so no white flash.
- Responsive layout down to phone width, with the nav collapsing to a menu button.
- Gallery lightbox with keyboard control: `←` `→` to move, `Esc` to close.
- Skip link, focus outlines, `aria` labels, and a print stylesheet that strips the chrome.
- Nothing loaded from a third party — no fonts, analytics, or CDN scripts. The site works offline
  and there is nothing to break later.

## Checking changes before you push

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`. (Opening the files directly with `file://` also works.)
