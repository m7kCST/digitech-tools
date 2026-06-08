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
                        ( ==  ^  == )        DIGITECH HUB v1.0
                         )         (         Emmanuel Christian School
                        (           )        Tasmania, Australia
                       ( (  )   (  ) )
                      (__(__)___(__)__)
                      
              [ Mr Miller :: Digital Technologies :: 2026 ]
```

---

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           DIGITECH HUB  v1.0                               ║
║                    An Agentic AI System for Education                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Author   :  M. Miller  (m7kcst)                                            ║
║  School   :  Emmanuel Christian School, Tasmania, Australia                 ║
║  Subject  :  Digital Technologies - Year 7 and Year 9/10                   ║
║  Curriculum: Australian Curriculum v9 (ACv9)                               ║
║  Status   :  Active Development                                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## What is this?

DigiTech Hub is a full-stack agentic AI system built for a secondary Digital Technologies classroom. It combines a **resource management pipeline**, a **live content delivery system**, and an **AI companion** that thinks and responds like a sparring partner rather than a search engine.

This project was built entirely without a backend server. Every component runs in the browser or through Google Apps Script, making it deployable by a single teacher with no infrastructure budget.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIGITECH HUB                             │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────┐  │
│  │   CONVERTER  │     │  APPS SCRIPT │     │  STUDENT HUB   │  │
│  │  (Teacher)   │────▶│   PROXY &    │◀────│  (Students)    │  │
│  │              │     │  SHEET API   │     │                │  │
│  │ Drop a file  │     │              │     │ Ask questions  │  │
│  │ AI extracts  │     │ • AI proxy   │     │ Browse files   │  │
│  │ Row → Sheet  │     │ • Row CRUD   │     │ Chat with AI   │  │
│  └──────────────┘     │ • Auth token │     └────────────────┘  │
│                       └──────┬───────┘                         │
│                              │                                  │
│                    ┌─────────▼────────┐                        │
│                    │  GOOGLE SHEET    │                        │
│                    │  (Content CMS)   │                        │
│                    │                  │                        │
│                    │ 19-column schema │                        │
│                    │ All resources    │                        │
│                    │ Chunk metadata   │                        │
│                    └──────────────────┘                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              ANTHROPIC CLAUDE API                        │  │
│  │  Accessed server-side via Apps Script proxy only         │  │
│  │  API key never exposed to browser or client code         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Resource Converter (`index.html`)
A drag-and-drop teacher tool for processing resource files into the content pipeline.

- Accepts `.html`, `.docx`, and `.pdf` files
- Extracts metadata via AI (title, class, term, week, type, definitions, tasks, success criteria)
- Auto-detects Google Drive URLs from embedded footer metadata
- Pushes structured rows directly to the Google Sheet via Apps Script
- Falls back to manual entry if AI extraction is unavailable
- Full connection diagnostics panel

### 2. Apps Script API (`digitech_sheet_script.js`)
A Google Apps Script deployed as a Web App that serves as both a Sheet API and an AI proxy.

- **Sheet CRUD** — append, update, delete rows
- **AI proxy** — routes Anthropic API calls server-side (API key never leaves Google's servers)
- **Token authentication** — write operations require a shared secret
- **Input sanitisation** — formula injection prevention, content length capping
- **Locked row filtering** — teacher-only rows never returned to student requests

### 3. Google Sheet (Content CMS)
A 19-column spreadsheet that acts as the single source of truth for all resources.

```
id | class | term | week | type | title | summary | topics |
file_format | url | source | print_ready | onenote_path |
definitions | success_criteria | tasks | key_concepts |
current | locked
```

### 4. Student Hub (`hub.html`) *(in development)*
A student-facing interface that reads live from the Sheet and uses the AI proxy.

- Class and term selector
- Four AI modes: Explain It / Quiz Me / Let's Debate / Help Me Think
- Inline resource cards surfaced by the AI in response to natural questions
- TTS, chunked explanations, safe curated links
- Sparring partner logic — redirects answer-seeking toward reasoning

---

## TASC Agentic AI — Design Notes

This project is documented as a TASC example of building an **Agentic AI system**. The following concepts are demonstrated:

### What makes it agentic?

An agent is a system that:
1. **Perceives** its environment (reads the Sheet, reads uploaded files)
2. **Reasons** about what action to take (AI extraction, mode detection)
3. **Acts** on the environment (writes to Sheet, surfaces resources, responds to students)
4. **Learns from feedback** (manual corrections feed back into the knowledge base)

### Key design decisions

**Why a Google Sheet as CMS?**  
No database, no server, no cost. The Sheet is human-readable, teacher-editable, and publishable as CSV. Any teacher can update it without touching code.

**Why Apps Script as proxy?**  
Browser-based AI calls are blocked by CSP headers on hosted platforms (Google Sites, GitHub Pages). Running the API call server-side via Apps Script bypasses this cleanly without needing a real backend.

**Why chunked metadata?**  
Sending an entire HTML lesson file to the AI on every student question is expensive and slow. Extracting definitions, tasks, and criteria into the Sheet means the AI gets precise, relevant context injected per question — not a wall of HTML.

**Why a sparring partner instead of a tutor?**  
Students who get direct answers stop thinking. The sparring partner model forces them to defend positions, explain reasoning, and dig deeper — skills that transfer to real work environments.

---

## Security Model

```
┌─────────────────────┬──────────────────────────────────────────┐
│ Operation           │ Protection                               │
├─────────────────────┼──────────────────────────────────────────┤
│ Read Sheet rows     │ Public (curriculum content, not PII)     │
│ Write/update rows   │ Requires WRITE_TOKEN                     │
│ Delete rows         │ Requires WRITE_TOKEN                     │
│ AI proxy calls      │ Requires WRITE_TOKEN                     │
│ API key             │ Server-side only, never in browser code  │
│ Locked rows         │ Filtered server-side, never sent         │
│ Cell input          │ Formula injection prevented              │
│ AI messages         │ Sanitised, length-capped before relay    │
│ Student data        │ Nothing collected or stored              │
└─────────────────────┴──────────────────────────────────────────┘
```

---

## File Structure

```
digitech-tools/
├── index.html              # Resource converter (teacher tool)
├── hub.html                # Student hub (in development)
├── test.html               # Connection test suite
├── drive_url_footer.html   # Reusable footer snippet for resources
├── README.md               # This file
└── digitech_sheet_script.js  # Apps Script source (deploy via Google)
```

---

## Setup

### Prerequisites
- Google account (personal — school accounts may block Cloud Console)
- Anthropic API account (`console.anthropic.com`)
- GitHub account (for hosting via GitHub Pages)

### Deployment Steps

**1. Google Sheet**
```
1. Create a new Google Sheet named "DigiTech Resources 2026"
2. Import digitech_resources_template.csv
3. Note the Sheet ID from the URL
```

**2. Apps Script**
```
1. Extensions > Apps Script
2. Paste digitech_sheet_script.js
3. Set ANTHROPIC_KEY = 'your-key-here'
4. Set WRITE_TOKEN = 'your-secret-token'
5. Deploy as Web App
   - Execute as: Me
   - Access: Anyone
6. Copy the /exec URL
```

**3. Converter**
```
1. Open index.html in a text editor
2. Set SHEET_URL = 'your-apps-script-url'
3. Set WRITE_TOKEN = 'same-token-as-script'
4. Upload to GitHub repository
```

**4. GitHub Pages**
```
1. Repository Settings > Pages
2. Source: main branch / root
3. Access at: yourusername.github.io/digitech-tools
```

---

## Curriculum Links

| Component | AC Code | Descriptor |
|-----------|---------|------------|
| AI companion — Year 7 | AC9TDI8K01 | How digital systems represent data |
| AI companion — Year 7 | AC9TDI8K02 | Transmission of data through networks |
| AI companion — Year 9/10 | AC9TDI10P01 | Implement algorithms in a general-purpose language |
| Agentic system design | AC9TDI10P02 | Design and implement a digital solution |

---

## Licence

Built for educational use at Emmanuel Christian School, Tasmania.  
Not for redistribution without permission.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DigiTech Hub  |  m7kcst  |  Emmanuel Christian School  |  2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
