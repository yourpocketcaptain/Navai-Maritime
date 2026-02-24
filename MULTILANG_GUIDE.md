# Multi-language Blog Publication Guide

To maintain 100% language coverage for the NavAI blog, please follow these steps for every new article:

## 1. Directory Structure
- English articles: `src/content/blog/[slug].md`
- Spanish articles: `src/content/blog/es/[slug].md`

> [!IMPORTANT]
> The filename (slug) must be **identical** in both folders for the dynamic language switching to work correctly on the blog post pages.

## 2. Meta Data (Frontmatter)
Both files must contain the YAML frontmatter. Ensure the `category` and `author` match or are appropriately localized.

```yaml
---
title: "Article Title"
date: "YYYY-MM-DD"
description: "Brief summary..."
category: "Tutorial"
image: "/images/blog/image.png"
author: "NavAI Team"
---
```

## 3. Localization Checklist
- [ ] Translate the `title` and `description` in the MDX frontmatter.
- [ ] Localize all headers and body text.
- [ ] Update internal links (e.g., Change `[Read more](/blog/post-slug)` to `[Leer más](/blog/es/post-slug)` in Spanish).
- [ ] Ensure the publication `date` remains the same for consistent sorting.

## 4. Verification
After publishing, switch the language on the Home page and visit `/blog` to verify the article appears in the correct list and renders correctly when clicked.
