## How to Update Your Website (No Coding)

You only change a few simple text files (JSON) and drop PDFs into folders. Follow the steps below exactly and you won’t break anything.

### Quick start (do this in order)

1. Open the folder `data` in your file explorer.
2. Pick the file you need to change (see list below) and open it with a basic text editor (Notepad works).
3. Copy an example, change the text (titles, dates, links).
4. Save the file.
5. If you mentioned a PDF, put that PDF in the matching `files/...` folder.
6. Refresh the website page in your browser to see the change.

### Files you edit

- `data/news.json` — News items.
- `data/teaching.json` — Courses and their PDFs.
- `data/publications.json` — Papers (preprints + peer-reviewed).
- `data/presentations.json` — Talks and slides.
- `data/research.json` — Research summary and topics (so you don’t edit HTML).
- `files/CV.pdf` — Your CV (navbar link).

### Where PDFs go

- Courses: `files/teaching/<course>/...`
- Papers/BibTeX: `files/publications/`
- Talks: `files/presentations/`
- CV: `files/CV.pdf`
  Use simple, lowercase filenames with dashes (example: `lecture-01.pdf`).

### EXACT examples to copy

**News (`data/news.json`)**

```json
[
  {
    "date": "2025-03-01",
    "title": "Invited talk on computational magnetism",
    "summary": "Seminar at BITS Pilani Dubai on emergent magnetic phases.",
    "link": "presentations.html"
  }
]
```

**Teaching (`data/teaching.json`)**

```json
[
  {
    "course": "PHYS 501 – Advanced Condensed Matter",
    "term": "Spring 2026",
    "description": "Electronic structure, magnetism, and topological materials.",
    "resources": [
      { "label": "Syllabus", "file": "files/teaching/phys501/syllabus.pdf" },
      {
        "label": "Lecture 1 Slides",
        "file": "files/teaching/phys501/lecture-01.pdf"
      }
    ]
  }
]
```

**Publications (`data/publications.json`)**

```json
{
  "preprints": [
    {
      "title": "Paper title",
      "authors": "Author list",
      "venue": "In communication (Journal/Conf)",
      "year": 2025,
      "link": "https://..." // optional
    }
  ],
  "peerReviewed": [
    {
      "title": "Published paper title",
      "authors": "Author list",
      "venue": "Journal/Conf, volume, pages",
      "year": 2025,
      "pdf": "files/publications/paper.pdf", // optional
      "link": "https://doi.org/...", // optional
      "bibtex": "files/publications/paper.bib" // optional
    }
  ]
}
```

**Presentations (`data/presentations.json`)**

```json
[
  {
    "title": "Talk title",
    "event": "Conference / Seminar",
    "date": "Mar 2025",
    "file": "files/presentations/talk.pdf"
  }
]
```

**Research (`data/research.json`)**

```json
{
  "lead": "One-sentence overview of your research.",
  "topics": [
    { "title": "Area 1", "summary": "One or two sentences." },
    { "title": "Area 2", "summary": "One or two sentences." }
  ]
}
```

### If something doesn’t show up

- Check that your commas and quotes in the JSON are correct.
- Make sure the PDF path matches exactly (example: `files/teaching/phys501/syllabus.pdf`).
- Reload the page in your browser.

### Useful notes

- Publications page has a “Sort by” dropdown (newest/oldest/title).
- Internal menu links stay in the same tab; outside links open in a new tab automatically.
- Light/dark mode toggle remembers your choice.

That’s it: edit the JSON, drop PDFs in the right folder, refresh. No coding.**_ End Patch_** End Patch
