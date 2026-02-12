---
name: refresh-updates
description: Guide for updating the website given a project link
---

# Webpage update

## Overview

Update the website so that a new research project is added. This involves pulling BibTeX, adding media, and updating both the publications and updates sections.

---

# Process

## High-Level Workflow

There are three main phases:

### Phase 1: Pull BibTeX details

#### 1.1 Find the paper link
Find the paper link on the project page. For example, `https://arxiv.org/abs/2602.10116`.

#### 1.2 Find the BibTeX
On the arXiv page, there is an `export BibTeX citation` link (e.g. `https://arxiv.org/bibtex/<id>`). Fetch and copy the content.

#### 1.3 Save to bib file
Save the BibTeX to `bib/` with the filename matching the BibTeX citation key. For example, if the key is `xia2026sagescalableagentic3d`, save to `bib/xia2026sagescalableagentic3d.bib`.

---

### Phase 2: Add media asset

#### 2.1 Check for existing media
Check if a video (`.mp4`, `.webm`) or image (`.gif`) already exists in `media/projects/` for this project. The user may have already added it.

#### 2.2 Ask the user
If no media exists, ask the user to provide a video or image file and place it in `media/projects/`. Use a short descriptive name (e.g. `sage.mp4`, `neuralangelo.mp4`).

#### 2.3 Compress the video
Use ffmpeg to compress the media.

---

### Phase 3: Update HTML content

#### 3.1 Update `content/selected-publication.html`
Add a new entry to the `publications` array at the **top** of the list (newest first). Follow this schema:

```javascript
{
    videoSrc: "media/projects/<filename>",
    paperTitle: "<Paper Title>",
    contributors: "<authors with <b>Zhaoshuo Li</b> bolded>",
    conference: "<venue, optional>",       // omit if not yet accepted
    pdfLink: "<arxiv or paper URL>",
    bibtexLink: "bib/<citation_key>.bib",
    projectPageLink: "<project page URL>",
    productPageLink: "<product URL>"       // omit if not applicable
}
```

**Notes:**
- Bold the name `Zhaoshuo Li` in the contributors using `<b>Zhaoshuo Li</b>`.
- If the user is listed as "Core contributor" (e.g. for large team efforts), use that string instead of listing all authors.
- The `conference` field is optional. Omit the key entirely if the paper is not yet accepted.
- The `productPageLink` field is optional. Only include if there is a product demo page.

#### 3.2 Update `content/updates.html`
Add a new entry to the `updates` array at the **top** (newest first). Follow this format:

```javascript
{ date: 'MM.DD.YYYY', message: '<a class="paper" href="<project_url>"><ShortName></a>, <description of the news>'}
```

Use today's date if no specific date is given. Keep the message concise (one sentence).

---

### Phase 4: Verify

#### 4.1 Sanity check
- Confirm the bib file exists and is valid.
- Confirm the media file path in the publication entry matches an actual file.
- Confirm the bibtexLink path matches the saved bib file.

---
