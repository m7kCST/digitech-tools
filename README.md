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

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           DIGITECH HUB  v2.0                               ║
║                    An Agentic AI System for Education                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Author   :  M. Miller  (m7kcst)                                            ║
║  School   :  Emmanuel Christian School, Tasmania, Australia                 ║
║  Subject  :  Digital Technologies - Year 7, 8, 9/10, Inquiry               ║
║  Curriculum: Australian Curriculum v9 (ACv9)                               ║
║  Status   :  Active - Term 2 2026                                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## What is this?

DigiTech Hub is a full-stack agentic AI system built for a secondary Digital
Technologies classroom. It combines a resource management pipeline, a live
content delivery system, and an AI companion that adapts to what the class is
actually studying right now - automatically, without any code changes.

Built entirely without a backend server. Everything runs in the browser or
through Google Apps Script, making it deployable by a single teacher with no
infrastructure budget and minimal ongoing cost.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DIGITECH HUB v2.0                              │
│                                                                         │
│  ┌──────────────┐      ┌───────────────────┐      ┌─────────────────┐  │
│  │  CONVERTER   │      │   APPS SCRIPT     │      │   STUDENT HUB   │  │
│  │  (Teacher)   │─────▶│   Web App API     │◀─────│  hub.html       │  │
│  │  index.html  │      │                   │      │                 │  │
│  │              │      │  • chat action    │      │  Sends only:    │  │
│  │  Drop file   │      │    (public)       │      │  class + mode   │  │
│  │  AI extracts │      │  • Sheet CRUD     │      │  + messages     │  │
│  │  Row→Sheet   │      │    (token auth)   │      │                 │  │
│  └──────────────┘      │  • Prompt builder │      │  Never sees:    │  │
│                        │    (server-side)  │      │  API key        │  │
│                        └────────┬──────────┘      │  Prompt logic   │  │
│                                 │                  │  Write token    │  │
│                    ┌────────────▼─────────┐        └─────────────────┘  │
│                    │    GOOGLE SHEET      │                             │
│                    │                      │                             │
│                    │  Tab 1: Resources    │                             │
│                    │  Tab 2: Schedule     │◀── Teacher flips            │
│                    │                      │    active=TRUE              │
│                    │  module column joins │    to change module         │
│                    │  both tabs together  │                             │
│                    └──────────────────────┘                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   ANTHROPIC CLAUDE API                           │  │
│  │  Called server-side only via Apps Script UrlFetchApp.            │  │
│  │  API key never touches the browser or any file on GitHub.        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## How the AI knows what to teach

The system prompt is built **server-side** in Apps Script on every request:

```
Apps Script receives: { class: '910', mode: 'explain', messages: [...] }

Apps Script reads Schedule tab  →  finds active=TRUE for Year 9/10
                                →  module = 'Bit:Bot Automation'
                                →  ac_codes = 'P05, P06, P09'

Apps Script reads Resources tab →  finds rows where module matches
                                →  extracts definitions, criteria, tasks

Apps Script builds prompt       →  identity (~50 tokens)
                                +  current module context (~150 tokens)
                                +  mode instructions (~250 tokens)
                                =  ~450 tokens total

Apps Script calls Anthropic     →  returns response to hub
```

The student never sees the prompt. The teacher never touches code to update it.
Changing the current module = flipping two cells in the Schedule tab.

---

## Updating the schedule

**Public holiday eats a lesson:**
```
Schedule tab → find the active module row → change end_week from 6 to 7
```

**Moving to the next module:**
```
Schedule tab → set current module active=FALSE
             → set next module active=TRUE
```

**Adding a new module mid-year:**
```
Resources tab → add rows with new module name
Schedule tab  → add a row for the new module
```

No code changes. No GitHub uploads. Takes 30 seconds.

---

## Components

### hub.html - Student interface
- Four class tabs: Year 7 (blue), Year 8 (green), Year 9/10 (purple), Inquiry (teal)
- Five AI modes: ELI5, Explain it, Quiz me, Lets debate, Help me think
- Inquiry modes: ELI5, Explain it, Quiz me, Give me ideas, Help me build
- Resources filtered and sorted by current module automatically
- Module banner shows what the class is studying right now
- URL parameter `?class=7` pre-selects the class (used by homepage cards)
- TTS read-aloud (Australian English, Web Speech API)
- Chat history capped at 8 messages to control cost

### index.html - Resource converter (teacher tool)
- Drag and drop HTML, DOCX, PDF files
- AI extracts metadata via Apps Script proxy
- Detects DRIVE-URL from file footer automatically
- Pushes rows to Google Sheet via Apps Script
- Falls back to manual entry if extraction fails

### Apps Script - API and AI proxy
- `chat` action: public, no token, builds prompt server-side, calls Anthropic
- `getRows` action: public read of Resources tab
- `getSchedule` action: public read of Schedule tab
- `append/update/delete` actions: token-protected write operations
- Formula injection prevention on all cell writes
- Message history capped server-side at 8 messages
- All inputs sanitised and length-capped before forwarding to Anthropic

### Google Sheet - Content CMS
Two tabs:

**Tab 1: Resources** (20 columns)
```
id | class | term | week | module | type | title | summary | topics |
file_format | url | source | print_ready | onenote_path |
definitions | success_criteria | tasks | key_concepts | current | locked
```

**Tab 2: Schedule** (8 columns)
```
class | term | year | module | start_week | end_week | active | ac_codes | notes
```

The `module` column joins both tabs. One row per class has `active=TRUE` at any time.

---

## Security model

```
┌─────────────────────┬────────────────────────────────────────────────┐
│ What                │ Protection                                     │
├─────────────────────┼────────────────────────────────────────────────┤
│ Anthropic API key   │ Apps Script only - never in any browser file   │
│ Write token         │ Converter HTML only - not in hub.html          │
│ System prompt       │ Built server-side - students cannot see it     │
│ Chat action         │ Public but validates class + mode inputs       │
│ Write actions       │ Require WRITE_TOKEN header                     │
│ Locked rows         │ Filtered server-side, never sent to browser    │
│ Formula injection   │ sanitiseCell() prefixes = + - @ with apostrophe│
│ Message content     │ Sanitised and capped at 2000 chars per message │
│ Token cost abuse    │ max_tokens capped at 1500, history capped at 8 │
│ Student data        │ Nothing collected or stored anywhere           │
└─────────────────────┴────────────────────────────────────────────────┘
```

---

## Cost model

At ~$0.003 per message with history capping and server-side prompts:

```
One student, 10 questions          ~$0.03
Full class of 25, 10 questions each  ~$0.75
100 sessions per week              ~$1.50
Full term (10 weeks)               ~$15.00
Full year (4 terms)                ~$60.00
```

Key cost levers implemented:
- System prompt trimmed to current module only (~450 tokens vs ~850 hardcoded)
- Chat history capped at 8 messages server-side
- max_tokens capped at 900 per response

---

## Curriculum coverage

Full four-year plan across all classes. Every AC code covered by end of band.

| Band | Codes | Covered by |
|------|-------|-----------|
| Years 7/8 | 18 codes (K01-K04, P01-P14) | End of Year 8 T2 |
| Years 9/10 | 17 codes (K01-K03, P01-P14) | End of Year 10 T2 |

Assessment structure every term: Week 4 (Assessment 1), Week 7 (Assessment 2),
Weeks 8-9 (buffer for missed lessons), Week 10 (portfolio and reflection).

---

## File structure

```
digitech-tools/
├── index.html                    # Resource converter (teacher tool)
├── hub.html                      # Student hub (AI + resources)
├── homepage.html                 # Google Sites embed page
├── test.html                     # Connection test suite
├── README.md                     # This file
├── digitech_sheet_script.js      # Apps Script source (deploy via Google)
├── digitech_resources_template.csv   # Sheet Tab 1 template
├── digitech_schedule_template.csv    # Sheet Tab 2 template
├── digitech_curriculum_map.md        # Full AC code mapping
├── digitech_10week_programs.md       # All 16 term programs
├── drive_folder_ids.md               # All Drive folder IDs
└── create_drive_folders.js           # Drive folder setup script
```

---

## Setup

**1. Google Sheet**
```
Create sheet named DigiTech Resources 2026
Tab 1: import digitech_resources_template.csv
Tab 2: create tab named Schedule, import digitech_schedule_template.csv
```

**2. Apps Script**
```
Extensions > Apps Script
Paste digitech_sheet_script.js
Set ANTHROPIC_KEY = 'your-key'
Set WRITE_TOKEN = 'your-token'
Deploy as Web App: Execute as Me, Anyone can access
Authorise UrlFetchApp when prompted
Copy /exec URL
```

**3. Update URLs**
```
hub.html line 300:    SCRIPT_URL = 'your-apps-script-url'
index.html line ~3:   SHEET_URL  = 'your-apps-script-url'
                      WRITE_TOKEN = 'your-token'  (converter only)
```

**4. GitHub Pages**
```
Repository Settings > Pages > main branch > Save
Hub live at: yourusername.github.io/digitech-tools/hub.html
```

**5. Google Sites**
```
Insert > Embed > paste homepage.html contents
Publish
```

---

## Weekly maintenance

```
Monday morning (2 minutes):
  hub.html line 302:  CURRENT_WEEK = 7   (update, commit to GitHub)

Moving to next module (30 seconds):
  Schedule tab:  set old module active=FALSE
                 set new module active=TRUE
  Done - hub and AI update automatically on next load
```

---

## TASC - Agentic AI design notes

This project demonstrates an agentic AI system for TASC documentation purposes.

**Agent loop:**
```
Perceive   →  Reads Schedule tab to know current module
             Reads Resources tab for content chunks
Reason     →  Builds context-appropriate system prompt server-side
             Selects mode instructions based on class and mode
Act        →  Calls Anthropic API with capped, sanitised messages
             Returns structured response to student
Learn      →  Teacher updates Sheet → agent adapts next load
             No redeployment needed
```

**Why serverless:**
No backend server means no infrastructure to maintain, no uptime to monitor,
and no cost when not in use. Google Apps Script handles 0 to 500 requests
per day with identical reliability and zero configuration.

**Why Google Sheet as CMS:**
Human-readable, teacher-editable, publishable as CSV, zero API cost for reads.
Any teacher can update it without touching code. The Schedule tab makes
timetable changes a 30-second task instead of a code deployment.

---

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DigiTech Hub v2.0  |  m7kcst  |  Emmanuel Christian School  |  2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
