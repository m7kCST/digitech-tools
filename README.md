```
██████╗ ██╗ ██████╗ ██╗████████╗███████╗ ██████╗██╗  ██╗
██╔══██╗██║██╔════╝ ██║╚══██╔══╝██╔════╝██╔════╝██║  ██║
██║  ██║██║██║  ███╗██║   ██║   █████╗  ██║     ███████║
██║  ██║██║██║   ██║██║   ██║   ██╔══╝  ██║     ██╔══██║
██████╔╝██║╚██████╔╝██║   ██║   ███████╗╚██████╗██║  ██║
╚═════╝ ╚═╝ ╚═════╝ ╚═╝   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝

██╗  ██╗██╗   ██╗██████╗
██║  ██║██║   ██║██╔══██╗
███████║██║   ██║██████╔╝
██╔══██║██║   ██║██╔══██╗
██║  ██║╚██████╔╝██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═════╝
```
                          /\_____/\
                         /  o   o  \
                        ( ==  ^  == )        DIGITECH HUB v2.0
                         )         (         Emmanuel Christian School
                        (           )        Tasmania, Australia
                       ( (  )   (  ) )
                      (__(__)___(__)__)

              [ Mr Miller :: Digital Technologies :: 2026 ]
```

---

# DigiTech Hub
### Emmanuel Christian School - Mr Miller

A live, teacher-built web app that gives students a curriculum-aware AI companion and a searchable resource library, all driven by a Google Sheet. No framework, no build tools - just HTML, JavaScript, and Google Apps Script.

I built this project as a working example of how real software systems fit together. The code is intentionally readable and commented for student study, particularly for TASC Digital Technology students who read through it as a teaching artefact.

---

## What it does

**For students (hub.html)**
- Pick your class (Year 7, Year 8, Year 9/10, or Inquiry)
- Browse resources filtered to your current module
- Ask the AI companion questions in five modes: ELI5, Explain it, Quiz me, Let's debate, Help me think
- Play a scored quiz that pulls questions from lesson definitions and a custom quiz sheet
- Study definitions with a flashcard mode
- Submit quiz scores to the teacher leaderboard

**For the teacher (index.html)**
- Drop lesson HTML, DOCX, or PDF files into the converter
- AI extracts metadata (title, class, term, week, module, definitions, success criteria, tasks)
- Review and edit extracted data before committing
- Push structured rows directly to the Google Sheet
- Download updated HTML files with page-meta blocks injected for the hub to read

---

## System architecture

```
GitHub Pages (public)          Google Apps Script (server)       Google Sheets
─────────────────────          ───────────────────────────       ─────────────
hub.html                 ───▶  doGet:  getRows            ───▶  Sheet1 (Resources)
  Resource browser              doGet:  getSchedule        ───▶  Schedule tab
  AI companion          ───▶  doPost: chat (public)             Quiz tab
  Flashcards                     builds prompt from Sheet
  Quiz game             ───▶  doPost: emailQuizScore
                                 sends score to teacher
index.html               ───▶  doGet:  getWriteToken      ←──  Session.getActiveUser()
  Resource converter      ───▶  doPost: ai (token-gated)  ───▶  Anthropic API
  Sheet pipeline          ───▶  doPost: append/update/delete ▶  Sheet1 (Resources)
```

The Anthropic API key lives only inside Apps Script - it is never in any HTML file or visible in browser network traffic. The write token is also server-side only; the converter fetches it at runtime after Google session auth checks the caller's email domain.

---

## Files

| File | Who uses it | Purpose |
|------|------------|---------|
| `hub.html` | Students | AI companion, resource browser, quiz, flashcards |
| `index.html` | Teacher | Resource converter and Sheet pipeline |
| `Code.gs` | Apps Script | API router, AI proxy, Sheet CRUD, quiz emailer |
| `README.md` | Everyone | This document |
| `HUB_REFERENCE.md` | Dev sessions | Live URLs, deployed state, quick-start |
| `SESSION_STATE.md` | Dev sessions | Current build state, known issues, decisions |
| `LESSON_TEMPLATE_REFERENCE.md` | Teacher | How to write page-meta blocks in lesson HTML |
| `HTML_EXPLAINER_CONVERSION_GUIDE.md` | Teacher | How to prep external HTML files for the converter |
| `digitech_curriculum_map.md` | Reference | AC codes and module sequence |
| `digitech_10week_programs.md` | Reference | 10-week program outlines per class |
| `drive_folder_ids.md` | Reference | Google Drive folder IDs for the pipeline |

---

## The Google Sheet

Three tabs drive everything:

**Sheet1 (Resources)** - one row per file, 20 columns:

| Column | Purpose |
|--------|---------|
| `id` | Unique kebab-case identifier derived from filename |
| `class` | `Year 7`, `Year 8`, `Year 9/10`, or `Inquiry` |
| `term` | `1`-`4` |
| `week` | Week number within the term |
| `module` | **Join key** - must exactly match the Schedule tab |
| `type` | `Lesson Outline`, `Worksheet`, `Assessment`, `Rubric`, `Guide`, `Interactive`, `Video` |
| `title` | Display title |
| `summary` | 1-2 sentence description |
| `topics` | AC codes, comma-separated |
| `file_format` | `html`, `pdf`, `docx`, `onenote`, `video` |
| `url` | Public URL (GitHub Pages for HTML, Drive for PDF/DOCX) |
| `source` | Always `Drive` for teacher-created resources |
| `print_ready` | `TRUE`/`FALSE` - shows Print button on card |
| `onenote_path` | Path in the class notebook e.g. `Digitech7a > Classwork > Part 2` |
| `definitions` | Pipe-separated `Term: Definition` pairs |
| `success_criteria` | Pipe-separated `I can...` statements |
| `tasks` | Pipe-separated task names |
| `key_concepts` | Comma-separated concepts |
| `current` | `TRUE`/`FALSE` - used by hub for current week highlighting |
| `locked` | `TRUE` = never sent to browser (answer keys, rubrics) |

**Schedule tab** - controls which module is active for each class:

| Column | Purpose |
|--------|---------|
| `class` | `Year 7`, `Year 8`, `Year 9/10`, `Inquiry` |
| `module` | Must exactly match a `module` value in Sheet1 |
| `active` | `TRUE`/`FALSE` - only one TRUE per class at any time |
| `term` | Term number |
| `start_week` | First week of this module |
| `end_week` | Last week of this module |
| `ac_codes` | AC codes for this module - injected into AI system prompt |

**Quiz tab** - optional general-knowledge questions:

| Column | Purpose |
|--------|---------|
| `question` | Question text |
| `correct` | Correct answer |
| `wrong1-3` | Distractor answers |
| `class` | Filter to a class, or leave blank for all classes |
| `module` | Optional - for future module filtering |

### Changing the current module (30 seconds)
1. Open the Schedule tab
2. Set the old module row `active` = `FALSE`
3. Set the new module row `active` = `TRUE`
4. Hub updates on the next student page load - no code change needed

---

## Apps Script (Code.gs)

The Apps Script is deployed as a web app:
- **Execute as:** Me (script owner)
- **Who can access:** Anyone

This means GET requests are fully public (curriculum content, not personal data), but write operations require token authentication. The AI companion chat is also public - students never need a token.

### Actions

**Public GET (no auth):**
| Action | Purpose |
|--------|---------|
| `ping` | Health check |
| `getRows?class=Year 7` | Fetch unlocked resource rows for a class |
| `getSchedule?class=Year 7` | Get active module for a class |
| `getQuiz?class=Year 7` | Get quiz questions for a class |

**Auth GET (school Google account required):**
| Action | Purpose |
|--------|---------|
| `getWriteToken` | Returns write token if caller has a school email |

**Public POST (no token):**
| Action | Purpose |
|--------|---------|
| `chat` | AI companion - system prompt built server-side from Sheet |
| `emailQuizScore` | Quiz score notification to teacher |

**Token-gated POST:**
| Action | Purpose |
|--------|---------|
| `append` | Add or update a Sheet row |
| `update` | Update a row by id |
| `delete` | Delete a row by id |
| `ai` | Raw AI proxy for the converter |

### Token security

The write token (`WRITE_TOKEN`) is defined only in Code.gs. The converter (`index.html`) no longer contains it. Instead:

1. On load, `index.html` calls `getWriteToken`
2. Apps Script checks `Session.getActiveUser().getEmail()`
3. If the email ends with `@emmanuelchristian.tas.edu.au`, the token is returned
4. The converter holds the token in a JS variable (`let writeToken`) in memory only
5. If not authenticated, all write buttons show an error - the converter is read-only

This means the token is never in GitHub, never in browser source view, and never in network logs.

### Safety constraints on AI calls
- `max_tokens` capped at 1500 regardless of what the client requests
- Message content capped at 10,000 characters per message
- System prompt capped at 5,000 characters
- History capped at last 8 messages (4 exchanges) to control cost
- All messages sanitised to `role` + `content` only - no unknown fields forwarded

### Formula injection protection
All values written to the Sheet go through `sanitiseCell()`, which prefixes cells starting with `=`, `+`, `-`, or `@` with an apostrophe. This prevents a malicious payload from being interpreted as a spreadsheet formula.

### ID collision protection
`appendRow()` checks whether an incoming `id` already exists in the Sheet. If the `id` belongs to a different lesson (different title or URL), the push is rejected with an error message rather than silently overwriting the existing row.

---

## hub.html - Student interface

### Data flow on page load
```
1. loadSchedule()     → GET getSchedule → finds active=TRUE row for class
2. updateActiveModule() → sets module banner and activeModule variable
3. loadResources()    → GET getRows → all unlocked rows for class
4. renderResources()  → filters, sorts (active module first), builds cards
5. newChat()          → renders mode welcome message
```

### AI companion
The system prompt is built **server-side** in `buildDynamicPrompt()` inside Apps Script. The hub sends only:
```javascript
{ action: 'chat', class: '7', mode: 'explain', messages: [...] }
```
No curriculum text, no API key, no token - nothing sensitive leaves the browser.

The prompt has three layers:
1. **Identity** (~50 tokens) - class, school, curriculum band
2. **Module context** (~150 tokens) - current module name, definitions, success criteria, tasks, key concepts pulled from the active Schedule row and matching Resource rows
3. **Mode instructions + rules** (~250 tokens) - behaviour for the selected mode

### Resource cards
Each card shows:
- Format badge (HTML, PDF, DOCX, OneNote) - colour-coded by format
- Type tag (Lesson Outline, Worksheet, Guide, Interactive, etc.) - colour-coded by type
- Module, term, week in the subtitle
- Summary text
- Action buttons (Open/Launch/Print/Watch depending on format and type)
- Collapsible Key info section (definitions, success criteria, tasks)

Cards from the active module get a green left border and sort to the top.

### Type system
| Type | Colour | Meaning |
|------|--------|---------|
| `Guide` | Amber | Static reference page - students read it |
| `Interactive` | Purple | Interactive HTML - students do something |
| `Lesson Outline` | Grey | Lesson plan |
| `Worksheet` | Grey | Student activity sheet |
| `Assessment` | Grey | Graded task |
| `Rubric` | Grey | Marking guide |
| `Video` | Grey | Video resource |

`Guide` and `Interactive` replace the old `Reference` and `Explainer` labels. A legacy normaliser in `loadResources()` remaps old values automatically while Sheet rows are updated.

### Quiz game
Questions come from two sources:
1. **Definition questions** - auto-generated from the `definitions` field of all resource rows for the current class. Each term becomes a "What does X mean?" question with 3 distractor definitions from other terms.
2. **General questions** - fetched from the Quiz Sheet tab via `getQuiz`.

Options are shuffled using Fisher-Yates and trimmed to equal word length so option length can't give away the answer.

Scoring:
- 10 points per correct answer (configurable via `QUIZ_POINTS_PER_CORRECT`)
- 3 misses resets score to zero (configurable via `QUIZ_MAX_MISSES`)
- Score submit unlocks after 5 correct answers (configurable via `QUIZ_MIN_CORRECT_TO_SUBMIT`)
- Submit emails the teacher via `emailQuizScore` - teacher compiles leaderboard manually

### Flashcards
Built from the `definitions` field across all resource rows for the class. Can be filtered to a single module. Fisher-Yates shuffled. Flip on click.

### Quick prompts
Each AI mode has a pool of 10 prompt suggestions per class. On each mode switch or new chat, 4 are picked at random with a character budget (~60 chars of label text) so the strip never overflows. A 🔀 button reshuffles without starting a new chat.

---

## index.html - Resource converter

### Processing pipeline
```
File dropped
  → readFile()           extract text (format-specific)
  → extractPageMeta()    check for authored page-meta block
    if found:            skip AI, use block directly
    if not found:
      → extractWithAI()  send to Apps Script AI proxy
      on failure:
        → guessFromFilename()  best-effort guess, fall back to manual
  → buildCSV()           generate Sheet row
  → buildMeta()          inject page-meta into HTML
  → pushRowToSheet()     POST to Apps Script append action
```

### page-meta block
Every lesson HTML should have a `page-meta` block in the `<head>`:
```html
<script type="application/json" id="page-meta">
{
  "id": "y7-office-excel-explainer",
  "class": "Year 7",
  "term": "1",
  "week": "3",
  "module": "Microsoft Office Suite",
  "type": "Guide",
  "title": "Excel - The Basics",
  "summary": "...",
  "topics": "AC9TDI8P11",
  "file_format": "html",
  "url": "https://m7kcst.github.io/digitech-tools/lessons/y7/office-suite/y7_office_excel_explainer.html",
  "source": "Drive",
  "print_ready": "FALSE",
  "onenote_path": "Digitech7a > References > Excel - The Basics",
  "definitions": "",
  "success_criteria": "",
  "tasks": "",
  "key_concepts": "cells, rows, columns, formulas",
  "current": "FALSE",
  "locked": "FALSE"
}
</script>
```
When the converter finds this block it skips the AI call entirely - faster, cheaper, and exactly correct. The `id` field is always overridden by `filenameToId(filename)` to prevent id collisions from copy-pasted blocks.

### ID collision protection
`filenameToId()` converts a filename to a kebab-case id:
```
Y7_BinaryImages_P2_Lesson.html  →  y7-binaryimages-p2-lesson
```
Since filenames are unique per lesson (you can't have two files with the same name), ids derived from filenames are also unique. The AI is no longer trusted to generate ids - it produced collisions when two "Part 2" lessons in similar modules got the same AI-generated slug.

### Auth flow
On load, `initWriteToken()` calls `getWriteToken` on the Apps Script. If the browser is signed into a school Google account, the write token is returned and stored in `let writeToken`. If not, `writeToken` stays `null` and all write operations show an auth error. The auth status badge in the top bar shows who is signed in.

---

## Live URLs

| Resource | URL |
|----------|-----|
| Student hub | https://m7kcst.github.io/digitech-tools/hub.html |
| Converter | https://m7kcst.github.io/digitech-tools/ |
| GitHub repo | https://github.com/m7kcst/digitech-tools |
| Apps Script | https://script.google.com/macros/s/AKfycbyjoh9CabUxzZ3caSGQmwcLH_smIQktJIHVC-rPjU5NNf_OhMk9hMeb4H_7uPf8UY7h/exec |

---

## Classes and colour system

| Class | Colour | Hex | Notes |
|-------|--------|-----|-------|
| Year 7 | Blue | `#185FA5` | Digital systems, binary, Office Suite |
| Year 8 | Green | `#2E7D32` | Networks, cybersecurity, data |
| Year 9/10 | Purple | `#534AB7` | Python, micro:bit, Bit:Bot, 3D printing |
| Inquiry | Teal | `#00695C` | Years 6-10, open creative exploration |

Each class has a full colour family: main, light background, dark text, medium (for gradients). All colours are defined as CSS custom properties in `:root` and referenced throughout - changing a colour in one place cascades everywhere.

---

## Modules

These names must match exactly across the Schedule tab, Sheet1 module column, and the converter's `MODULES` constant:

```
3D Printing and Design
AI and Machine Learning
Advanced Cybersecurity
Binary Numbers and Data Representation
Bit:Bot Automation
Capstone Project
Creating a Digital Solution
Data Compression
Data Science with Python
Digital Solution Project
Digital Systems and Hardware
Extension and Enrichment
File Journeys and Networks
General-purpose Programming
Microsoft Office Suite
Networks and Cyber Security
Object-oriented Programming
Open Exploration
Privacy and Ethics
Python and micro:bit
Web Development
Working with Data
```

---

## Deployment

**GitHub Pages** serves hub.html and index.html as static files. No server needed - all dynamic behaviour goes through the Apps Script web app.

**Apps Script** is deployed via Apps Script editor → Deploy → Manage Deployments. After any Code.gs change, create a new version and deploy it - the URL stays the same. The deployment URL is hardcoded as `SCRIPT_URL` in both HTML files.

**Adding a new resource:**
1. Create the file (lesson HTML, PDF, DOCX)
2. Add a page-meta block if it's an HTML file (see `LESSON_TEMPLATE_REFERENCE.md`)
3. Upload to GitHub Pages or Drive (depending on format)
4. Drop into the converter at `m7kcst.github.io/digitech-tools/`
5. Review extracted metadata, push to Sheet
6. Card appears in the hub on next student page load

**Changing the current module:** Schedule tab → set old row `active=FALSE`, new row `active=TRUE`. Done in 30 seconds, no code change.

---

## Security notes

- **Anthropic API key** - stored only in Code.gs, never in any HTML file
- **Write token** - stored only in Code.gs, fetched at runtime by the converter after Google session auth
- **Student chat** - token-free, public action; sends only class, mode, and message history
- **Locked rows** - filtered server-side in `getRows()`; never reach the browser
- **Formula injection** - all Sheet writes go through `sanitiseCell()` which escapes formula characters
- **XSS** - all Sheet data inserted into HTML goes through `esc()` which HTML-encodes special characters
- **Token rotation** - change `WRITE_TOKEN` in Code.gs and redeploy; the converter fetches it fresh on next load

---

*Built by M. Miller, Emmanuel Christian School, Tasmania. Australian Curriculum v9.*
