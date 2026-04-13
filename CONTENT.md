# Content Placeholders

Every item below is marked with `[BRACKETS]` in the source code. Search for the bracket text to find the exact location in the codebase.

## Home Page (`src/app/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[ABOUT_TEASER_PARAGRAPH_1]` | 2-3 sentences about Clayton's background, connection to SC-01, and why he is running |

## About Page (`src/app/about/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[BIO_PARAGRAPH_1]` | Personal background: where he grew up, what shaped him, what brought him to SC |
| `[BIO_PARAGRAPH_2]` | Professional background: work experience, skills he brings |
| `[BIO_PARAGRAPH_3]` | Why he is running: the personal moment or realization |
| `[SC01_CONNECTION_1]` | Personal ties to Charleston/Lowcountry: when he moved here, what he loves |
| `[SC01_CONNECTION_2]` | Local issues that motivated him: insurance, housing, personal experience |
| `[BOOK_STATUS]` | Publication date, purchase link, or pre-order info for America Reimagined |

## Write-In Page (`src/app/write-in/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[EARLY_VOTING_DATES]` | SC early voting schedule (check scvotes.gov when announced) |
| `[WALLET_CARD_PDF]` | Filename of the printable wallet card PDF (add to public/images/) |

## Get Involved Page (`src/app/get-involved/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[FORMSPREE_ENDPOINT]` | Formspree form URL, e.g. `https://formspree.io/f/xyzabc` |

## Donate Page (`src/app/donate/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[FORMSPREE_DONATE_NOTIFY_ENDPOINT]` | Formspree form URL for donation notification signups |

## Press Page (`src/app/press/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[PRESS_EMAIL]` | Press contact email, e.g. press@writeincuteri.com |
| `[PRESS_SOURCE_1]`, `[PRESS_SOURCE_2]`, `[PRESS_SOURCE_3]` | Publication names |
| `[PRESS_HEADLINE_1]`, `[PRESS_HEADLINE_2]`, `[PRESS_HEADLINE_3]` | Article titles |
| `[PRESS_EXCERPT_1]`, `[PRESS_EXCERPT_2]`, `[PRESS_EXCERPT_3]` | Brief excerpts |
| `[PRESS_LINK_1]`, `[PRESS_LINK_2]`, `[PRESS_LINK_3]` | Article URLs |

## Privacy Page (`src/app/privacy/page.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[PRIVACY_LAST_UPDATED_DATE]` | Date the privacy policy was last updated |

## Footer (`src/components/Footer.tsx`)

| Placeholder | What to Replace With |
|---|---|
| `[CAMPAIGN_EMAIL]` | Campaign contact email |

## Privacy + Accessibility Pages

| Placeholder | What to Replace With |
|---|---|
| `[CAMPAIGN_EMAIL]` | Campaign contact email (same as footer) |

## Future Integration

| Item | Details |
|---|---|
| ConvertKit | Replace Formspree email signups with ConvertKit integration (email, name, zip fields). Use validation pattern from Traveling To Consciousness repo. |
| Anedot | Add donation widget to /donate page once FEC registration, EIN, and bank account are set up. |
| Wallet Card PDF | Create and upload a printable write-in reminder card. |
