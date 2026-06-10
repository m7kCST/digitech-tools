# DigiTech Hub - Technical Reference
## For use at start of new sessions

---

## Live URLs

| Resource | URL |
|----------|-----|
| Converter | https://m7kcst.github.io/digitech-tools/ |
| Student Hub | https://m7kcst.github.io/digitech-tools/hub.html |
| Test page | https://m7kcst.github.io/digitech-tools/test.html |
| Homepage | https://m7kcst.github.io/digitech-tools/homepage.html |
| GitHub repo | https://github.com/m7kcst/digitech-tools |

---

## Apps Script

| Item | Value |
|------|-------|
| Live URL | https://script.google.com/macros/s/AKfycbzdhRhNiETzLIZo3xBwr0srS6bdmnFZnHdpO9t8I4BiWa8vk2qbG4yPTn4MKfBjUbVp/exec |
| Write token | Miller-Digitech-2026-woodentigersm7k |
| Anthropic key | Set inside Apps Script only - never in HTML |

### Actions
| Action | Method | Auth | Purpose |
|--------|--------|------|---------|
| ping | GET | None | Health check |
| getRows | GET | None | Fetch Resources tab |
| getSchedule | GET | None | Fetch Schedule tab |
| chat | POST | None | AI companion - prompt built server-side |
| append | POST | Token | Add/update Sheet row |
| update | POST | Token | Update row by id |
| delete | POST | Token | Delete row by id |
| ai | POST | Token | Raw AI proxy (converter only) |

---

## Google Sheet

| Tab | Purpose | Key columns |
|-----|---------|-------------|
| Sheet1 (Resources) | All resource files | id, class, term, week, **module**, type, title, summary, topics, file_format, url, source, print_ready, onenote_path, definitions, success_criteria, tasks, key_concepts, current, locked |
| Schedule | Module timing per class | class, term, year, **module**, start_week, end_week, **active**, ac_codes, notes |

- `module` column is the JOIN KEY between both tabs
- Only ONE row per class has `active=TRUE` at any time
- `locked=TRUE` rows never sent to browser

### To change current module (30 seconds):
1. Open Schedule tab
2. Set old module row `active` = FALSE
3. Set new module row `active` = TRUE
4. Hub updates on next student page load

---

## Hub Architecture

```
Student opens hub.html
  → Fetches Schedule tab (getSchedule)
  → Finds active=TRUE row for their class
  → Gets module name
  → Fetches Resources tab (getRows)
  → Filters resources by module
  → Shows module banner + sorted resource cards

Student sends message
  → POST { action:'chat', class, mode, messages }
  → Apps Script reads Schedule → finds active module
  → Apps Script reads Resources → gets module chunks
  → Apps Script builds system prompt (~450 tokens)
  → Caps history at 8 messages
  → Calls Anthropic API
  → Returns response
  → Hub renders in chunked format
```

### What hub.html sends (nothing sensitive):
```javascript
{ action: 'chat', class: '7', mode: 'explain', messages: [...] }
```

### What stays server-side (never in HTML):
- Anthropic API key
- System prompt logic
- Curriculum context
- Mode instructions
- Write token (not used by hub at all)

---

## Hub Config (hub.html line ~300)

```javascript
const SCRIPT_URL   = 'https://script.google.com/...';  // Apps Script URL
const CURRENT_WEEK = 6;   // update each Monday
```

That's it. No token. No key. No curriculum text.

---

## Classes and Colours

| Class | Colour | Hex | Who |
|-------|--------|-----|-----|
| Year 7 | Blue | #185FA5 | Own class, own sequence |
| Year 8 | Green | #2E7D32 | Own class, continues Y7 band |
| Year 9/10 | Purple | #534AB7 | Mixed Y9+Y10 |
| Inquiry | Teal | #00695C | Y6-10 mixed, free exploration |

---

## AI Modes

| Mode | Year 7/8 | Year 9/10 | Inquiry |
|------|----------|-----------|---------|
| ELI5 | 4 emoji sections, max 15 words/sentence | Same | Same |
| Explain it | Chunked sections, ask to explain back | Same + code examples | Fun curious tone |
| Quiz me | One Q at a time, never give answer | + code/debug questions | Fun trivia |
| Debate | Devil's advocate, push reasoning | Higher standard | Give me ideas |
| Help | Never write pasteable content | + no full code solutions | Help me build |

---

## Cost Model

| Metric | Value |
|--------|-------|
| Per message | ~$0.003 |
| Full class 25 students, 10 questions | ~$0.75 |
| Per term (100 sessions/week, 10 weeks) | ~$15 |
| Per year | ~$60 |

Cost levers applied:
- System prompt dynamic from Sheet (~450 tokens not ~850)
- History capped at 8 messages server-side
- max_tokens capped at 900

---

## Drive Structure

```
DigiTech Resources 2026/  (ID: 1BMLpQkDrwSZb-3-tSfWYDmkiQPHH2efg)
├── Modules/              (ID: 14uCi07e2jgx3YWaJhIgywFQe5mAmS9Ve)
│   ├── 3D Printing and Design
│   ├── AI and Machine Learning
│   ├── Advanced Cybersecurity
│   ├── Binary Numbers and Data Representation
│   ├── Bit:Bot Automation
│   ├── Capstone Project
│   ├── Creating a Digital Solution
│   ├── Data Compression
│   ├── Data Science with Python
│   ├── Digital Solution Project
│   ├── Digital Systems and Hardware
│   ├── Extension and Enrichment
│   ├── File Journeys and Networks
│   ├── General-purpose Programming
│   ├── Microsoft Office Suite
│   ├── Networks and Cyber Security
│   ├── Object-oriented Programming
│   ├── Open Exploration
│   ├── Privacy and Ethics
│   ├── Python and micro:bit
│   ├── Web Development
│   └── Working with Data
├── Assessments/          (ID: 1QxDC8Nt-THFno25f5KburDNfJgy8uLsU)
│   ├── Year 7
│   ├── Year 8
│   ├── Year 9-10
│   └── Inquiry
└── References and Templates/  (ID: 1AwZfRXMWbSKFdKYhn79qJPogWWO7mlrE)
    ├── Rubric Templates
    ├── Lesson Outline Templates
    ├── AC Code Reference Sheets
    └── Student Handout Templates
```

---

## Resource File Workflow

```
1. Build resource using SEQTA lesson template
2. Upload student-facing files to Drive → Modules/[Module Name]/
3. Copy Drive shareable link
4. Paste after DRIVE-URL: in file footer
5. Re-upload to Drive replacing original
6. Drop file into converter at m7kcst.github.io/digitech-tools
7. Review extracted metadata
8. Click Generate and push to Sheet
9. Students see it in hub on next load
```

### What goes where:
| File type | Where it lives | url column |
|-----------|---------------|------------|
| HTML lesson files | GitHub Pages lessons/ folder | GitHub Pages URL |
| PDF resources | Drive → Modules/[Module]/ | Drive /view link |
| DOCX worksheets | Drive → Modules/[Module]/ | Drive /edit link |
| Assessment rubrics | Drive → Assessments/[Year]/ | Drive link (locked=TRUE) |
| SEQTA lesson plan | Paste into SEQTA HTML editor | - |

### Key rule:
- HTML files → GitHub Pages → always renders in Chrome
- Drive /preview does NOT work for HTML files (Google blocks it)
- PDFs and DOCX → Drive links work fine

---

## File Naming Convention

`CLASS_MODULE-ABBREV_PART_TYPE.html`

Examples:
```
Y7_BinaryImages_P2_LessonPlan.html   ← SEQTA paste
Y7_BinaryImages_P2_Worksheet.html    ← Drive → Modules
Y7_BinaryImages_P2_Reference.html    ← Drive → Modules
Y7_BinaryImages_Assessment1.docx     ← Drive → Assessments
```
