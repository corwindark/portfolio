# Content Guide: Adding and Managing Portfolio Content

This guide explains how to add new projects, blog posts, and special content like GIFs, embedded apps, and code snippets to your portfolio website.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Adding a New Project](#adding-a-new-project)
3. [Adding a Blog Post](#adding-a-blog-post)
4. [Special Features](#special-features)
5. [Building and Deploying](#building-and-deploying)
6. [File Structure Reference](#file-structure-reference)

---

## Quick Start

To add new content:

1. Create a Markdown file in the appropriate directory
2. Add metadata to the relevant JSON file
3. Run `npm run build` to generate the site
4. Preview locally with `npm run serve`
5. Commit and push to deploy via GitHub Pages

---

## Adding a New Project

### Step 1: Create the Markdown File

Create a new file in `src/content/projects/` with a URL-friendly name:

```
src/content/projects/my-new-project.md
```

### Step 2: Add Frontmatter

Every project file needs YAML frontmatter at the top:

```yaml
---
title: "My Project Title"
date: 2025-01-15
labels: [Python, Machine Learning, Data Visualization]
image: my-project-preview.jpg
description: "A brief description that appears on the project card (1-2 sentences)."
---
```

**Frontmatter fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The project title |
| `date` | Yes | Publication date (YYYY-MM-DD) |
| `labels` | Yes | Array of technology/topic tags |
| `image` | Yes | Preview image filename (in `src/assets/images/`) |
| `description` | Yes | Short description for the card |

### Step 3: Write the Content

Below the frontmatter, write your project content in Markdown:

```markdown
---
title: "My Project"
date: 2025-01-15
labels: [Python]
image: preview.jpg
description: "Short description."
---

# Project Title

## Overview

Introduce your project here...

## Technical Approach

Explain your methodology...

## Results

Share your findings...
```

### Step 4: Add to Projects List

Open `src/data/projects.json` and add an entry:

```json
{
  "id": "my-new-project",
  "title": "My Project Title",
  "date": "2025-01-15",
  "labels": ["Python", "Machine Learning", "Data Visualization"],
  "image": "my-project-preview.jpg",
  "description": "A brief description...",
  "featured": false
}
```

**JSON fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Must match the markdown filename (without .md) |
| `title` | Yes | Project title |
| `date` | Yes | Date string (YYYY-MM-DD) or "Ongoing" |
| `labels` | Yes | Array of tags for filtering |
| `image` | Yes | Image filename |
| `description` | Yes | Card description |
| `featured` | No | Set `true` to highlight with a star |
| `customPage` | No | Link to external HTML (like the D3 visualization) |
| `isBlogLink` | No | Set `true` if this links to the blog section |

### Step 5: Add Preview Image

Place your preview image in `src/assets/images/`:

```
src/assets/images/my-project-preview.jpg
```

**Image recommendations:**

- **Dimensions:** 400x300px or similar 4:3 aspect ratio
- **Format:** JPG for photos, PNG for graphics, GIF for animations
- **File size:** Keep under 500KB for fast loading

---

## Adding a Blog Post

Blog posts work similarly to projects but are stored in `src/content/blog/`.

### Create Blog Post File

```
src/content/blog/tokenization-deep-dive.md
```

### Blog Post Frontmatter

```yaml
---
title: "Tokenization: A Deep Dive"
date: 2025-02-01
labels: [NLP, Python, Transformers]
image: tokenization.jpg
description: "Understanding BPE, WordPiece, and SentencePiece tokenizers."
series: "Building a Foundation LLM"
part: 2
---
```

**Additional blog fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `series` | No | Name of the blog series |
| `part` | No | Part number in the series |

---

## Special Features

### Expandable Code Blocks

Use the `:::code` syntax to create collapsible code sections:

```markdown
:::code{title="Python: My Function" collapsed}
```python
def my_function():
    return "Hello, World!"
```
:::
```

This renders as a collapsed block that visitors can expand. The `title` appears in the header.

### Embedded Iframes

Embed Streamlit apps, Jupyter notebooks, or other interactive content:

```markdown
:::iframe{src="https://myapp.streamlit.app" height="600"}
```

**Tips for embedding:**

- **Streamlit:** Deploy to Streamlit Community Cloud and use the public URL
- **Observable:** Use the embed URL from Observable notebooks
- **Google Colab:** Use the "embed" sharing option
- **YouTube:** Use the standard embed URL

### GIFs and Animated Content

Add GIFs just like regular images:

```markdown
![Demo Animation](assets/gifs/my-demo.gif)
```

Or in the frontmatter as the preview image:

```yaml
image: my-animation.gif
```

**GIF best practices:**

- Keep file size reasonable (<5MB)
- Use tools like `gifsicle` to optimize
- Consider using short clips (3-10 seconds)

### Images in Content

Reference images from the assets folder:

```markdown
![Chart showing results](assets/images/results-chart.png)
```

### Mathematical Notation

The site supports LaTeX-style math (if you need it, we can add KaTeX):

```markdown
The loss function is $L = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$
```

### Tables

Standard Markdown tables work:

```markdown
| Model | Accuracy | F1 Score |
|-------|----------|----------|
| XGBoost | 0.85 | 0.82 |
| Random Forest | 0.83 | 0.80 |
```

---

## Building and Deploying

### Install Dependencies (First Time)

```bash
npm install
```

### Build the Site

```bash
npm run build
```

This generates all HTML files in the `docs/` folder.

### Preview Locally

```bash
npm run serve
```

Then open http://localhost:3000 in your browser.

### Watch Mode (Auto-Rebuild)

```bash
npm run watch
```

Automatically rebuilds when you save changes.

### Deploy to GitHub Pages

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add new project: My Project"
   ```

2. Push to GitHub:
   ```bash
   git push origin main
   ```

3. GitHub Pages will automatically deploy from the `docs/` folder.

---

## File Structure Reference

```
portfolio/
├── src/
│   ├── content/
│   │   ├── projects/           # Project markdown files
│   │   │   ├── ab-test.md
│   │   │   ├── reddit-comments.md
│   │   │   └── ...
│   │   └── blog/               # Blog post markdown files
│   │       ├── intro.md
│   │       └── ...
│   ├── templates/
│   │   ├── base.html           # Main page template
│   │   ├── project.html        # Individual project template
│   │   └── blog-post.html      # Blog post template
│   ├── data/
│   │   ├── projects.json         # Project metadata
│   │   ├── sidebar-timeline.json # Timeline sidebar config (logos, dates, titles)
│   │   └── resume.pdf            # Your resume PDF
│   └── assets/
│       └── images/
│           └── logos/            # Company/school logo images for timeline
│       ├── images/             # Static images
│       └── gifs/               # Animated GIFs
├── docs/                       # Generated site (don't edit directly!)
├── build.js                    # Build script
├── package.json                # Node.js dependencies
└── CONTENT_GUIDE.md           # This file
```

---

## Configuring the Sidebar Timeline

The sidebar displays a vertical timeline with logos/icons for each era of your career or education. As users scroll through projects, the corresponding timeline entry is highlighted.

### Timeline Configuration File

Edit `src/data/sidebar-timeline.json`:

```json
[
  {
    "id": "current",
    "year": "2024-Present",
    "logo": "logos/company-logo.png",
    "title": "Company Name",
    "description": "Brief role description",
    "startYear": 2024
  },
  {
    "id": "previous",
    "year": "2022-2024",
    "logo": "logos/another-logo.png",
    "title": "Previous Company",
    "description": "What you worked on",
    "startYear": 2022
  }
]
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier for this entry |
| `year` | Yes | Display text for the year/date range (e.g., "2024-Present", "2022-2024", "2019") |
| `logo` | No | Path to logo image relative to `assets/images/` (e.g., "logos/google.png"). Falls back to a dot if missing. |
| `title` | Yes | Company, school, or role name |
| `description` | No | Brief description of your role or focus |
| `startYear` | Yes | Numeric year used to match projects to this timeline entry (e.g., 2024). Projects from this year onwards will highlight this entry. |

### Adding Logo Images

1. Create logo images (recommended: 96x96 pixels, PNG or SVG)
2. Place them in `src/assets/images/logos/`
3. Reference in the timeline config: `"logo": "logos/your-logo.png"`

**Tips for logos:**
- Use transparent backgrounds for best results
- Square images work best (they're displayed in a circle)
- Keep file sizes small (<50KB)
- If no logo is available, omit the `logo` field for a simple dot marker

### Entry Order and Spacing

- **Order:** Entries appear in the order listed in the JSON array (top to bottom)
- **Recommended order:** Most recent first (chronological descending)
- **Spacing:** Each entry gets equal visual weight; use descriptions to add context

### How Project Matching Works

When a user scrolls through projects, the timeline highlights based on `startYear`:

1. Each project has a `date` field (e.g., "2023-06-15")
2. The system finds the timeline entry whose `startYear` is closest to (but not greater than) the project year
3. That timeline entry becomes "active" (highlighted)

**Example:**
- Timeline entry with `startYear: 2022` will match projects from 2022, 2023, etc.
- Timeline entry with `startYear: 2024` will match projects from 2024 onwards

### Clicking Timeline Entries

Users can click any timeline entry to scroll to the first project from that era. This provides quick navigation through your portfolio by time period.

### Example: Full Timeline

```json
[
  {
    "id": "independent",
    "year": "2024-Present",
    "logo": "logos/self.png",
    "title": "Independent Consultant",
    "description": "ML for financial markets",
    "startYear": 2024
  },
  {
    "id": "bigtech",
    "year": "2021-2024",
    "logo": "logos/bigtech.png",
    "title": "Big Tech Company",
    "description": "Data science & analytics",
    "startYear": 2021
  },
  {
    "id": "startup",
    "year": "2019-2021",
    "logo": "logos/startup.png",
    "title": "Cool Startup",
    "description": "Full-stack data engineering",
    "startYear": 2019
  },
  {
    "id": "university",
    "year": "2015-2019",
    "logo": "logos/university.png",
    "title": "State University",
    "description": "BS Computer Science",
    "startYear": 2015
  }
]
```

---

## Updating Your Resume

1. Place your updated PDF at `src/data/resume.pdf`
2. Run `npm run build`
3. The resume page will embed the new PDF

---

## Tips and Best Practices

### Writing Engaging Content

1. **Lead with impact:** Start with the most interesting result or insight
2. **Use visuals:** Charts, diagrams, and GIFs break up text
3. **Show code selectively:** Collapse long code blocks, highlight key functions
4. **Tell a story:** Problem → Approach → Solution → Results

### SEO and Discoverability

- Write descriptive titles and descriptions
- Use relevant labels/tags
- Keep URLs clean (lowercase, hyphens)

### Performance

- Optimize images before uploading
- Use lazy loading (built-in for images)
- Keep GIFs under 5MB

---

## Troubleshooting

### Build Errors

If `npm run build` fails:

1. Check JSON syntax in `projects.json` (missing commas, brackets)
2. Ensure all frontmatter fields are properly quoted
3. Check that referenced images exist

### Images Not Showing

1. Verify the image is in `src/assets/images/`
2. Check the filename matches exactly (case-sensitive)
3. Run `npm run build` to copy assets

### Code Highlighting Not Working

1. Ensure language is specified in code blocks: ` ```python `
2. Check that Prism.js supports the language
3. Clear browser cache

---

## Need Help?

If you encounter issues not covered here, check:

1. The browser console for JavaScript errors
2. The build output for compilation errors
3. That all files are saved before building

