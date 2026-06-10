# DigiTech Lesson Template - Reference Guide
## Emmanuel Christian School - Mr Miller

---

## Overview

One file per lesson. Paste into SEQTA HTML editor.
No accordions. Fully expanded. Works in all views including MyDay.
Teacher config block at top - only section ever edited.

---

## File naming

`y7_binary_images_p2_SEQTA.html`
= `[year]_[topic-slug]_p[part]_SEQTA.html`

Examples:
```
y7_outlook_email_p1_SEQTA.html
y7_onedrive_p2_SEQTA.html
y7_excel_basics_p3_SEQTA.html
y910_bitbot_motors_p1_SEQTA.html
```

---

## Config block - the ONLY section you edit

```javascript
const LESSON = {
  topic     : 'Binary Images',        // lesson topic name
  part      : 2,                      // Part X of this module
  module    : 'Binary Numbers and Data Representation',  // module name - must match Sheet
  year      : 'Year 7',              // Year 7 / Year 8 / Year 9/10 / Inquiry
  duration  : '80 minutes',          // lesson length
  notebook  : 'Digitech7a',          // OneNote notebook name - update each year
  acCodes   : ['AC9TDI8K03', 'AC9TDI8K04'],  // AC codes for this lesson
  auditNote : '',                    // optional - shows in parent section only
                                     // e.g. 'Week 4 teacher absent. Week 6 assessment.'

  // ONE plain sentence - what students are learning today
  focus : 'We are learning how computers store images using binary.',

  // Lesson timing phases
  timing : [
    { time: '0 - 15 min',  active: false, label: 'Entry ticket',  desc: '...' },
    { time: '15 - 40 min', active: true,  label: 'Together',      desc: '...' },
    { time: '40 - 70 min', active: true,  label: 'Your turn',     desc: '...' },
    { time: '70 - 80 min', active: false, label: 'Exit ticket',   desc: '...' }
  ],
  // active: true = blue bar (main activity), false = grey bar (transition)

  // OneNote page name students navigate to
  onenotePage : 'Part 2 - Binary Images',

  // Success criteria - I can... statements
  successCriteria : [
    'Explain what a pixel is',
    'Decode a simple binary image grid using 0s and 1s',
    'Create your own black-and-white binary image',
    'Explain how resolution affects image quality and file size',
    'Explain how binary values can represent image data'
  ],

  // Tasks 1-7 numbered, tiered f/s/e (never visible to students)
  // f = Foundation (1-3), s = Standard (1-5), e = Extension (1-7)
  tasks : [
    { num: 1, tier: 'f', desc: 'Vocabulary match - key terms' },
    { num: 2, tier: 'f', desc: 'Decode a provided binary image grid' },
    { num: 3, tier: 'f', desc: 'Write a one-sentence explanation' },
    { num: 4, tier: 's', desc: 'Create an original binary image' },
    { num: 5, tier: 's', desc: 'Written response explaining concepts' },
    { num: 6, tier: 'e', desc: 'Compare and analyse examples' },
    { num: 7, tier: 'e', desc: 'Higher order explanation or application' }
  ],
  // Tier ranges calculate automatically from task count
  // You don't need exactly 3/2/2 - any split works

  // Assessment evidence for parent/audit section
  assessment : [
    { evidence: 'Entry ticket',     lookFor: 'Prior knowledge check' },
    { evidence: 'Vocabulary task',  lookFor: 'Understanding of key terms' },
    { evidence: 'Main task',        lookFor: 'Application of concepts' },
    { evidence: 'Written response', lookFor: 'Explanation in own words' },
    { evidence: 'Exit ticket',      lookFor: 'Understanding at lesson close' }
  ]
};
```

---

## What renders automatically (do not edit)

| Section | Renders from |
|---------|-------------|
| Header band | topic, part, module, year, duration, acCodes |
| Focus sentence | focus |
| Success criteria list | successCriteria (numbered circles) |
| Timing strip | timing (blue bars = active) |
| OneNote path | notebook + onenotePage |
| Parent overview | year, module, part, topic, duration, acCodes, auditNote |
| Differentiation cards | tasks (counts f/s/e automatically) |
| Task breakdown table | tasks |
| Curriculum links | acCodes (descriptions auto-loaded from lookup table) |
| Assessment table | assessment |
| Footer | year, topic, part |

---

## Differentiation model

All students see the same numbered tasks. No tier labels visible.
Teacher directs verbally to appropriate depth.

| Tier | Tasks | Who |
|------|-------|-----|
| Foundation | 1-3 | Core concepts, vocabulary, decoding with support |
| Standard | 1-5 | Includes creation and written response |
| Extension | 1-7 | Includes analysis, comparison, higher-order thinking |

---

## AC code lookup (auto-populates descriptions)

The template has descriptions for all Y7/8 and Y9/10 band codes built in:

Y7/8: AC9TDI8K01 through AC9TDI8P14
Y9/10: AC9TDI10K01 through AC9TDI10P14

Just put the code string in acCodes array - description appears automatically.

---

## SEQTA sections layout

```
[HEADER BAND - blue, topic + part + module + year + duration + AC codes]

FOR STUDENTS
────────────
[What we are doing today - one sentence]
[By the end you should be able to - numbered circles]
[How we will use our time - timing strip]
[Your worksheet is in OneNote - path box]

FOR PARENTS AND CARERS
──────────────────────
[Lesson information header]
[Lesson overview - details grid]
[audit note if set - amber box]
[How the lesson runs]
[Differentiation - 3 cards: Foundation / Standard / Extension]
[Task breakdown table - task number, description, tier]
[Curriculum links - AC codes with descriptions]
[Assessment and evidence table]
[Contact details]
[Footer]
```

---

## To create a new lesson file

1. Copy `y7_binary_images_p2_SEQTA.html`
2. Rename to match new lesson e.g. `y7_outlook_email_p1_SEQTA.html`
3. Open in text editor
4. Edit ONLY the `const LESSON = { ... }` block at the top
5. Save
6. Open in Chrome to preview
7. Paste full file contents into SEQTA HTML editor

---

## To update for a new year

Change only:
```javascript
notebook : 'Digitech7b',   // new class notebook name
```

Everything else stays the same.

---

## Audit note usage

Add when a lesson was affected by absences, public holidays, or assessment weeks:

```javascript
auditNote : 'Week 4 teacher absent. Week 6 assessment week.'
```

Shows as amber box in parent section only. Students never see it.
Leave empty string `''` when not needed.

---

## Module name must match Sheet

The `module` value in the config must exactly match:
- The `module` column in the Resources tab
- The `module` column in the Schedule tab

This is how the hub connects the lesson to its resources and AI context.

Correct: `'Binary Numbers and Data Representation'`
Wrong:   `'Binary Numbers'` or `'Binary numbers and data representation'`

---

## Template base file

`y7_binary_images_p2_SEQTA.html` - use this as the base for all new lessons.
Copy it, rename it, change the config block only.
