# DigiTech Hub - Session State
## Emmanuel Christian School - Mr Miller (m7kcst)
## Saved: June 2026

---

## SYSTEM STATUS - EVERYTHING THAT IS LIVE AND WORKING

### GitHub Pages
- Repo: github.com/m7kcst/digitech-tools
- Converter: m7kcst.github.io/digitech-tools/ (index.html)
- Hub: m7kcst.github.io/digitech-tools/hub.html
- Test page: m7kcst.github.io/digitech-tools/test.html
- Lessons: m7kcst.github.io/digitech-tools/lessons/[year]/[module]/filename.html

### GitHub repo folder structure
```
digitech-tools/
├── index.html          (converter - teacher tool)
├── hub.html            (student hub - REBUILD if missing)
├── test.html           (connection test)
├── homepage.html       (Google Sites embed)
├── README.md
└── lessons/
    ├── y7/
    │   ├── office-suite/
    │   └── digital-systems/
    ├── y8/
    ├── y910/
    └── inquiry/
```

### CRITICAL - HTML files must use GitHub Pages URLs
- Drive /preview does NOT render HTML files (Google blocks it)
- HTML lesson files go in GitHub lessons/ folder
- Students open: m7kcst.github.io/digitech-tools/lessons/y7/office-suite/p1-outlook.html
- PDFs and DOCX from Drive links work fine
- Sheet url column = GitHub Pages URL for HTML, Drive link for PDF/DOCX

### Apps Script (LIVE - all 4 tests passing)
- URL: https://script.google.com/macros/s/AKfycbzdhRhNiETzLIZo3xBwr0srS6bdmnFZnHdpO9t8I4BiWa8vk2qbG4yPTn4MKfBjUbVp/exec
- Write token: Miller-Digitech-2026-woodentigersm7k
- Actions: ping, getRows, getSchedule, append, update, delete, chat, ai
- chat action: PUBLIC (no token needed) - builds prompt server-side from Sheet
- write actions: require WRITE_TOKEN
- Anthropic key: set in Apps Script (not in any HTML file)

### Google Drive
- Root folder: DigiTech Resources 2026
- Root ID: 1BMLpQkDrwSZb-3-tSfWYDmkiQPHH2efg
- Structure: Modules/ (22 folders) + Assessments/ (4 folders) + References and Templates/ (4 folders)
- All folder IDs: see drive_folder_ids.md in GitHub repo

### Google Sheet
- Tab 1: Resources (20 cols: id, class, term, week, module, type, title, summary, topics, file_format, url, source, print_ready, onenote_path, definitions, success_criteria, tasks, key_concepts, current, locked)
- Tab 2: Schedule (cols: class, term, year, module, start_week, end_week, active, ac_codes, notes)
- module column is the JOIN KEY between both tabs
- Only ONE row per class should have active=TRUE at a time

---

## ALL OUTPUT FILES (in /mnt/user-data/outputs/)

| File | Purpose | Status |
|------|---------|--------|
| hub.html | Student hub v2 - 4 classes, server-side prompt, Schedule integration | CURRENT - needs GitHub upload |
| index.html (digitech_resource_converter.html) | Teacher converter with proxy | CURRENT - on GitHub |
| digitech_sheet_script.js | Apps Script source | CURRENT - deployed |
| digitech_schedule_template.csv | Schedule tab - 104 rows, all 16 terms | CURRENT - needs Sheet import |
| digitech_resources_template.csv | Resources tab with module column | CURRENT - needs Sheet reimport |
| digitech_homepage.html | Google Sites embed - 4 class cards | CURRENT - needs GitHub upload |
| README.md | Full system docs with ASCII art banner and tiger | CURRENT - needs GitHub upload |
| digitech_curriculum_map.md | All AC codes mapped to modules | CURRENT - on GitHub |
| digitech_10week_programs.md | All 16 term programs, Wk4+Wk7 assessments | CURRENT - needs GitHub upload |
| drive_folder_ids.md | All 30 Drive folder IDs with links | CURRENT - on GitHub |
| create_drive_folders.js | Drive setup script v3 - flat module structure | CURRENT |
| y7_binary_images_p2_SEQTA.html | NEW lesson template - one file, teacher config block | CURRENT - THIS IS THE NEW TEMPLATE |
| drive_url_footer.html | Paste into HTML resources before converting | CURRENT |

---

## THE NEW LESSON TEMPLATE SYSTEM

### Key design decisions just made:
- ONE file per lesson (not two)
- Paste into SEQTA HTML editor
- NO accordions anywhere (break in MyDay view)
- Fully expanded - works for students, parents, auditors
- Teacher config block at TOP of file - only section ever edited
- Everything renders from config automatically

### File naming convention:
`y7_binary_images_p2_SEQTA.html`
= [year]_[topic-slug]_p[part]_SEQTA.html

### Config block structure:
```javascript
const LESSON = {
  topic     : 'Binary Images',
  part      : 2,              // Part X of module
  module    : 'Binary Numbers and Data Representation',
  year      : 'Year 7',
  duration  : '80 minutes',
  notebook  : 'Digitech7a',  // update each year
  acCodes   : ['AC9TDI8K03', 'AC9TDI8K04'],
  auditNote : '',             // optional - shows in parent section only

  successCriteria : [...],    // I can... statements
  focus           : '...',    // one plain sentence
  timing          : [...],    // lesson phases
  onenotePage     : 'Part 2 - Binary Images',
  tasks           : [...],    // numbered 1-7, tier f/s/e
  assessment      : [...]     // evidence and look-fors
}
```

### Differentiation model:
- Tasks 1-3: Foundation (no label visible to students)
- Tasks 1-5: Standard
- Tasks 1-7: Extension
- Students never see tier labels
- Teacher directs verbally
- Tier ranges calculate automatically from task count

### SEQTA display:
- Student section: header, focus, success criteria, timing strip, OneNote direction
- Parent/carer section: lesson overview, how it runs, differentiation cards, task breakdown table, curriculum links, assessment table, contact
- auditNote appears as amber box in parent section if set

---

## CURRICULUM MAP - FULL FOUR YEAR PLAN

### Year 7 (current - 2026)
- T1 DONE: Microsoft Office Suite (P11, P12)
- T2 IN PROGRESS:
  - Wk 1-2: Digital Systems and Hardware (K01) - DONE
  - Wk 3: File Journeys and Networks (K01, K02) - DONE
  - Wk 4: Binary Numbers (K03, K04) - DONE
  - Wk 5: Assessment 1 - DONE
  - Wk 6: Binary Images (K03, K04) - CURRENT (Week 6)
  - Wk 7: Assessment 2
  - Wk 8-9: Binary Sound + Synthesis
  - Wk 10: Portfolio
- T3 PLANNED: Working with Data + General-purpose Programming
- T4 PLANNED: Creating a Digital Solution

### Year 8
- T1: Networks and Cyber Security + Working with Data
- T2: Programming + Creating a Digital Solution
- T3: AI and Machine Learning
- T4: Extension and Enrichment

### Year 9/10 (current - 2026)
- T1 DONE: 3D Printing and Design
- T2 IN PROGRESS: Python/micro:bit + Bit:Bot Automation (CURRENT Wk 6)
- T3 PLANNED: AI and Web Development
- T4 PLANNED: Digital Solution Project

### Assessment structure (every term, all years):
- Week 4: Assessment 1
- Week 7: Assessment 2 (both done by Wk 7)
- Weeks 8-9: Buffer for missed lessons
- Week 10: Portfolio and reflection

---

## CLASSES AND COLOURS
- Year 7: Blue (#185FA5) - own class, own sequence
- Year 8: Green (#2E7D32) - own class, continues Y7 band
- Year 9/10: Purple (#534AB7) - mixed Y9+Y10
- Inquiry: Teal (#00695C) - Y6-10 mixed, free exploration, no grades

---

## KEY ARCHITECTURE DECISIONS

### Server-side AI prompt (CRITICAL)
- hub.html sends ONLY: { class, mode, messages }
- Apps Script builds system prompt dynamically from Schedule + Resources tabs
- API key NEVER in any HTML file
- Write token NOT in hub.html (chat action is public)
- Write token IS in index.html (converter needs it for Sheet writes)
- History capped at 8 messages server-side
- Prompt ~450 tokens (down from ~850 hardcoded)
- Cost ~$0.003 per message

### Module system
- Resources tab has 'module' column - join key to Schedule tab
- Schedule tab has active=TRUE for current module per class
- Hub reads Schedule on load, finds active module, filters resources
- AI gets current module chunks injected automatically
- To change module: flip 2 cells in Schedule tab, ~30 seconds

### Drive folder structure (FLAT - 30 folders total)
- Modules/ - 22 folders, one per module, files go directly in
- Assessments/ - 4 folders (Year 7, Year 8, Year 9-10, Inquiry)
- References and Templates/ - 4 folders

### File workflow
1. Build resource HTML using lesson template
2. Upload to matching Drive module folder
3. Copy shareable link
4. Paste after DRIVE-URL: in file footer
5. Re-upload to Drive
6. Drop into converter at m7kcst.github.io/digitech-tools
7. Row auto-pushes to Sheet
8. Students see it in hub immediately

---

## IMMEDIATE NEXT STEPS (at start of next session)
1. Upload hub.html to GitHub (server-side prompt version)
2. Upload README.md to GitHub
3. Upload digitech_10week_programs.md to GitHub
4. Import digitech_schedule_template.csv into Sheet as Tab 2 named 'Schedule'
5. Reimport digitech_resources_template.csv into Sheet Tab 1 (has module column)
6. Build Year 7 T1 lesson files using new template (starting from beginning)
7. Upload lesson files to Drive and run through converter

---

## WHAT WE ARE BUILDING NEXT
Year 7 Term 1 lesson files using the new SEQTA template:
- Microsoft Office Suite module
- All lessons Part 1 through Part N
- Config block only changes per lesson
- Same template, same structure, same parent section

The template file is: y7_binary_images_p2_SEQTA.html
Use that as the base - change only the LESSON config block.

---
*Session state saved - start fresh chat and reference this file*
