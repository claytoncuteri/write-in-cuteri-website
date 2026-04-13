# Clayton Cuteri for Congress - Campaign Website

Write-in candidate for U.S. House of Representatives, South Carolina District 1.
American Congress Party. November 3, 2026.

Primary URL: **writeincuteri.com**

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
```

This produces a static export in the `out/` directory.

## Deploy on Replit

### Option A: Import from GitHub

1. Push this repo to GitHub
2. In Replit, create a new project and select "Import from GitHub"
3. Once imported, go to Deployments > Static
4. Set the publish directory to `out`
5. Click Deploy

### Option B: Upload Directly

1. Run `npm run build` locally
2. Create a new Replit project (Static Site template)
3. Upload the contents of the `out/` folder
4. Deploy

### Custom Domain (writeincuteri.com)

1. In Replit deployment settings, add your custom domain
2. Replit will provide DNS records (typically a CNAME)
3. Add those records in your domain registrar (Namecheap, etc.)
4. Replit handles HTTPS automatically

Redirect the other two domains (cuteriforamericans.com, cuteriforcongress.com) to writeincuteri.com via your registrar's DNS panel.

## Editing Content

### Page content

Most page content lives directly in the page files at `src/app/*/page.tsx`. Open the file for the page you want to edit and modify the text directly.

### Problems and Policies data

Structured data is in `src/data/`:
- `problems.ts` - The 8 SC-01 voter problems
- `policies.ts` - The 13 policy planks (Plank 13 has sub-solutions)
- `navigation.ts` - Header and footer nav links

### Placeholder content

Search the codebase for text wrapped in `[BRACKETS]` to find all placeholder content that needs to be filled in. See `CONTENT.md` for the full list.

### Images

All images are in `public/images/`. To replace the headshot or logos, drop new files with the same filenames.

## Brand Palette

| Color     | Hex       | Usage                        |
|-----------|-----------|------------------------------|
| Navy      | #1E3D8C   | Headers, primary buttons     |
| Red       | #D72638   | CTAs, accent elements        |
| White     | #FFFFFF   | Page backgrounds             |
| Cream     | #FAF8F2   | Section backgrounds, cards   |
| Charcoal  | #1A1A1A   | Body text                    |

## Typography

- **Body**: Inter (Google Fonts)
- **Headlines**: Source Serif 4 (Google Fonts)

## Writing Rule

**NO EM DASHES.** Never use the character U+2014 anywhere in any content. Use commas, semicolons, parentheses, or split into separate sentences instead. This is non-negotiable.

## Tech Stack

- Next.js 16 with App Router and TypeScript
- Tailwind CSS v4
- Lucide React icons
- Static export (no server required)
- Formspree for form handling

## Project Structure

```
src/
  app/
    page.tsx              Home
    write-in/page.tsx     How to Write Me In (most important page)
    problems/page.tsx     SC-01 Problems (8 issues)
    policies/page.tsx     Policies (13 planks)
    about/page.tsx        About Clayton
    get-involved/page.tsx Volunteer + Email signup
    donate/page.tsx       Donations (Coming Soon)
    press/page.tsx        Press resources
    privacy/page.tsx      Privacy policy
    accessibility/page.tsx Accessibility statement
    not-found.tsx         404 page
    layout.tsx            Root layout (Header, Footer, fonts)
    globals.css           Tailwind theme + global styles
  components/
    Header.tsx            Sticky header with nav
    Footer.tsx            Footer with FEC disclaimer
    CTAButton.tsx         Button component (3 variants)
    Section.tsx           Page section wrapper
    ExpandableCard.tsx    Collapsible card (used on Problems + Policies)
  data/
    problems.ts           8 SC-01 problems
    policies.ts           13 policy planks
    navigation.ts         Nav items
public/
  images/                 Logos + headshot
  robots.txt
  sitemap.xml
```
