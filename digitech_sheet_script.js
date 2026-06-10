/**
 * =============================================================================
 * DigiTech Hub - Google Apps Script API
 * =============================================================================
 *
 * Dual-purpose Apps Script deployed as a Web App:
 *   1. Google Sheets CRUD API - manages the resource content database
 *   2. Anthropic API proxy - relays AI calls server-side so the API key
 *      is never exposed in browser code or client-side network requests
 *
 * Deploy settings:
 *   Execute as  : Me (the script owner)
 *   Who can access : Anyone
 *
 * All write operations (append, update, delete, ai) require a shared
 * secret token. Read operations (ping, getRows) are intentionally public
 * because the Sheet contains curriculum content, not personal data.
 *
 * Author  : M. Miller
 * School  : Emmanuel Christian School, Tasmania
 * Version : 1.0
 * =============================================================================
 */


// =============================================================================
// CONFIGURATION
// Replace placeholder values before deploying.
// =============================================================================

/** Name of the Sheet tab that holds resource rows. */
const SHEET_NAME = 'Sheet1';

/**
 * Column schema - defines the order of columns in the Sheet.
 * Must match the header row exactly. Any change here requires a
 * matching change in the converter HTML and the Sheet itself.
 */
const COLS = [
  'id', 'class', 'term', 'week', 'module', 'type', 'title', 'summary',
  'topics', 'file_format', 'url', 'source', 'print_ready',
  'onenote_path', 'definitions', 'success_criteria', 'tasks',
  'key_concepts', 'current', 'locked'
];

/**
 * Anthropic API key.
 * Stored here (server-side) so it is never exposed in browser code.
 * Rotate this key at console.anthropic.com if compromised.
 */
const ANTHROPIC_KEY = 'YOUR_API_KEY_HERE';

/**
 * Shared secret for write operations.
 * Any request to append, update, delete, or use the AI proxy must
 * include this token. Set the same value in the converter HTML.
 * Use a random string - e.g. 'miller-digitech-2026-x7k'
 */
const WRITE_TOKEN = 'Miller-Digitech-2026-woodentigersm7k';

/**
 * Hard cap on AI response tokens per request.
 * Prevents a malicious or runaway request from generating a huge
 * response and running up API costs unexpectedly.
 */
const MAX_TOKENS_CAP = 1500;

/**
 * Hard cap on input content length per AI message (characters).
 * Stops oversized payloads from hitting the API.
 */
const MAX_CONTENT_LENGTH = 10000;


// =============================================================================
// REQUEST ROUTING
// Apps Script calls doPost for POST requests and doGet for GET requests.
// We treat GET as read-only (public) and POST as write (token required).
// =============================================================================

/**
 * Handles all POST requests.
 * Routes to the correct handler based on the 'action' field in the body.
 * All actions except 'ping' require a valid write token.
 *
 * Expected body shape:
 *   { action: string, token: string, ...actionSpecificFields }
 *
 * @param {Object} e - Apps Script event object containing postData
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'append';

    // Ping is the only unauthenticated POST - used for connection checks
    if (action === 'ping') return respond(true, 'pong');

    // All other POST actions require the write token
    if (!verifyToken(data.token)) {
      return respond(false, 'Unauthorised - invalid or missing token');
    }

    if (action === 'append') return appendRow(data.row);
    if (action === 'update') return updateRow(data.id, data.row);
    if (action === 'delete') return deleteRow(data.id);
    if (action === 'ai')     return proxyAI(data.messages, data.system, data.max_tokens);
    if (action === 'chat')   return handleChat(data.class, data.mode, data.messages);

    return respond(false, 'Unknown action: ' + action);

  } catch (err) {
    // Catch malformed JSON or unexpected runtime errors
    return respond(false, 'Request error: ' + err.message);
  }
}

/**
 * Handles all GET requests.
 * Only read operations are available via GET - no authentication required
 * because the Sheet contains curriculum content, not personal data.
 *
 * Supported actions:
 *   ?action=ping               - health check
 *   ?action=getRows            - get all unlocked rows
 *   ?action=getRows&class=X    - filter by class
 *   ?action=getRows&term=X     - filter by term
 *
 * @param {Object} e - Apps Script event object containing queryString params
 * @returns {TextOutput} JSON response
 */
function doGet(e) {
  const action = e.parameter.action || 'ping';

  if (action === 'ping')        return respond(true, 'DigiTech Sheet API running');
  if (action === 'getRows')     return getRows(e.parameter.class, e.parameter.term);
  if (action === 'getSchedule') return getSchedule(e.parameter.class);

  return respond(false, 'Unknown GET action: ' + action);
}


// =============================================================================
// AUTHENTICATION
// =============================================================================

/**
 * Verifies that a request includes the correct write token.
 * Returns false (blocking the request) if the token is not configured,
 * which prevents accidental open writes on a fresh deployment.
 *
 * @param {string} token - Token value from the incoming request body
 * @returns {boolean} true if authorised, false otherwise
 */
function verifyToken(token) {
  // Block all writes if the token has not been configured yet
  if (!WRITE_TOKEN || WRITE_TOKEN === 'YOUR_WRITE_TOKEN_HERE') {
    return false;
  }
  return token === WRITE_TOKEN;
}


// =============================================================================
// CHAT HANDLER
// Public action - no write token needed. Builds system prompt server-side
// from live Schedule and Resources data so prompt logic is never exposed
// to the browser. Students send only class, mode and message history.
// =============================================================================

/**
 * Handles the public chat action.
 * Caps history at 8 messages (4 exchanges) to control token cost.
 * Builds the system prompt dynamically then forwards to proxyAI.
 */
function handleChat(cls, mode, messages) {
  if (!cls || !['7','8','910','inq'].includes(String(cls)))
    return respond(false, 'Invalid class');
  if (!mode || !['eli5','explain','quiz','debate','help'].includes(String(mode)))
    return respond(false, 'Invalid mode');
  if (!Array.isArray(messages) || messages.length === 0)
    return respond(false, 'Invalid messages');

  // Cap history at last 8 messages - biggest single cost saving
  const capped = messages.slice(-8).map(m => ({
    role   : m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').substring(0, 2000)
  }));

  return proxyAI(capped, buildDynamicPrompt(cls, mode), 900);
}

/**
 * Builds a lean dynamic system prompt from Sheet data.
 * Three layers: identity (~50 tokens) + current module context
 * (~150-200 tokens) + mode instructions + rules (~250 tokens).
 * Total ~450-500 tokens vs ~850 tokens hardcoded client-side.
 * Updates automatically when Schedule tab active row changes.
 */
function buildDynamicPrompt(cls, mode) {
  const classNames = {'7':'Year 7','8':'Year 8','910':'Year 9/10','inq':'Inquiry'};
  const bandNames  = {'7':'Years 7/8','8':'Years 7/8','910':'Years 9/10','inq':'Years 6-10'};
  const className  = classNames[cls];

  // Layer 1: Identity
  let p = 'You are a DigiTech AI companion for ' + className + ' students at Emmanuel Christian School, Tasmania, Australia.\n';
  p += 'Curriculum: Australian Curriculum v9 (ACv9) - ' + bandNames[cls] + ' band.\n';

  if (cls === 'inq') {
    p += 'Inquiry is open creative DigiTech for Years 6-10 - no grades, student-directed making and exploration.\n';
  }

  // Layer 2: Current module context from Schedule + Resources
  const active = getActiveModule(className);
  if (active) {
    p += '\nCURRENT MODULE: ' + active.module;
    if (active.ac_codes) p += ' | AC codes: ' + active.ac_codes;
    p += '\n';
    const chunks = getModuleChunks(className, active.module);
    if (chunks.definitions)      p += 'Definitions: '       + chunks.definitions      + '\n';
    if (chunks.success_criteria) p += 'Success criteria: '  + chunks.success_criteria + '\n';
    if (chunks.tasks)            p += 'Current tasks: '     + chunks.tasks            + '\n';
    if (chunks.key_concepts)     p += 'Key concepts: '      + chunks.key_concepts     + '\n';
  } else {
    const fallback = {
      '7'  : 'Year 7: Office Suite (T1), Digital Systems and Binary (T2), Data and Programming (T3), Digital Solutions (T4).',
      '8'  : 'Year 8: Networks and Cyber (T1), Programming and Solutions (T2), AI and ML (T3), Extension (T4).',
      '910': 'Year 9/10: 3D Printing (T1), Python and Bit:Bot (T2), AI and Web Dev (T3), Digital Solution Project (T4).',
      'inq': 'Students can explore any area of digital technology.'
    };
    p += '\n' + (fallback[cls] || '') + '\n';
    p += 'No active module in Schedule tab - teacher needs to set active=TRUE on a row.\n';
  }

  // Layer 3: Mode instructions + safety rules
  p += '\n' + getModePrompt(cls, mode);
  p += '\n\nRULES: Never write content students can paste into assessments. Always ask a follow-up question. Redirect "just give me the answer" with a question. Warm encouraging tone. Suggest checking class notes and SEQTA.';
  p += '\nIf student asks to find/show/open a resource respond with exactly: RESOURCE_REQUEST: [describe what they want]';

  return p;
}

/**
 * Returns lean mode instruction text for the given class and mode.
 * Kept short - essential formatting rules only.
 */
function getModePrompt(cls, mode) {
  const isY910 = cls === '910';
  const isInq  = cls === 'inq';

  if (isInq) {
    const m = {
      eli5   : 'ELI5: Short sentences, fun analogies, emoji headers, max 4 sections.',
      explain: 'EXPLAIN: Fun curious tone, real examples, ask what they want to DO with the concept.',
      quiz   : 'QUIZ: Fun and light, one question at a time, any tech topic, celebrate right answers.',
      debate : 'IDEAS: Help brainstorm, suggest 2-3 concrete project ideas based on their interests.',
      help   : 'BUILD: Ask what they are building, break into small steps, suggest tools and tutorials.'
    };
    return m[mode] || m.explain;
  }

  const m = {
    eli5: 'ELI5 mode - use these emoji headers every time:\n🎯 **What it is** (one sentence)\n🤔 **Think of it like...** (teen-relatable analogy)\n⚡ **The key point** (bold the key thing)\n❓ **Quick check** (one question to verify understanding)\nNo walls of text. Definitions: 📖 **TERM** = plain english.',

    explain: 'EXPLAIN mode - chunks only, never a paragraph:\n🎯 **The simple version** (2-3 sentences plain language)\n🔗 **Real world example** (one concrete example)\n🧠 **The technical bit** (correct terminology, 2-3 sentences)\n❓ **Check understanding** (ask them to explain it back)' + (isY910 ? '\nFor code: show syntax then one minimal example, never full solutions.' : ''),

    quiz: 'QUIZ mode: One question at a time, wait for answer, never give the answer when wrong - hint only.' + (isY910 ? ' Include code-reading and debugging questions.' : '') + ' After 5-6 questions summarise strengths and gaps.',

    debate: 'DEBATE mode: Challenge even if you agree. Demand reasoning not opinions. Counter-arguments required.' + (isY910 ? ' High standard: reasoning + real-world example. Ask "Who benefits? Who is harmed?" End: summarise core argument.' : ' Summarise both sides at end.'),

    help: 'HELP mode - NEVER write pasteable content.\n1. Ask what they have so far.\n2. Break into small steps one at a time.\n3. Respond to their writing with questions not rewrites.\n4. Never write model answers.' + (isY910 ? '\nFor code: ask to see their code, point to problem with a question, never paste a solution.' : '')
  };

  return m[mode] || m.explain;
}

/**
 * Finds the active=TRUE row for a class in the Schedule tab.
 */
function getActiveModule(className) {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Schedule') || ss.getSheetByName('schedule');
  if (!sheet) return null;
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, j) => { row[h] = data[i][j]; });
    if (row.class === className &&
       (row.active === true || String(row.active).toUpperCase() === 'TRUE')) {
      return row;
    }
  }
  return null;
}

/**
 * Gets content chunks for a module from the Resources tab.
 * Combines definitions, criteria, tasks and key concepts across all
 * matching rows into single strings for prompt injection.
 */
function getModuleChunks(className, module) {
  const data    = getSheet().getDataRange().getValues();
  const headers = data[0];
  const chunks  = {definitions:'', success_criteria:'', tasks:'', key_concepts:''};
  data.slice(1).forEach(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    if (obj.class !== className || obj.module !== module) return;
    if (obj.locked === true || String(obj.locked).toUpperCase() === 'TRUE') return;
    ['definitions','success_criteria','tasks','key_concepts'].forEach(f => {
      if (obj[f]) chunks[f] = chunks[f] ? chunks[f] + ' | ' + obj[f] : String(obj[f]);
    });
  });
  return chunks;
}

// =============================================================================
// AI PROXY
// Routes AI requests through UrlFetchApp so the Anthropic API key stays
// server-side and is never visible in browser network traffic.
// =============================================================================

/**
 * Proxies a request to the Anthropic Messages API.
 *
 * Applies several safety constraints before forwarding:
 *   - Caps max_tokens at MAX_TOKENS_CAP regardless of what the client sends
 *   - Strips unknown fields from each message (only role + content allowed)
 *   - Caps message content length at MAX_CONTENT_LENGTH
 *   - Caps system prompt length at 5000 chars
 *
 * @param {Array}  messages   - Conversation history [{role, content}, ...]
 * @param {string} system     - System prompt string
 * @param {number} max_tokens - Requested token limit (will be capped)
 * @returns {TextOutput} JSON response containing AI content or error
 */
function proxyAI(messages, system, max_tokens) {

  // Guard: API key must be configured
  if (!ANTHROPIC_KEY || ANTHROPIC_KEY === 'YOUR_API_KEY_HERE') {
    return respond(false, 'Anthropic API key not configured in Apps Script');
  }

  // Guard: messages must be a non-empty array
  if (!Array.isArray(messages) || messages.length === 0) {
    return respond(false, 'Invalid messages - expected a non-empty array');
  }

  // Sanitise messages - strip unknown fields, cap content length, enforce valid roles
  const safeMessages = messages.map(msg => ({
    role    : msg.role === 'assistant' ? 'assistant' : 'user',
    content : String(msg.content || '').substring(0, MAX_CONTENT_LENGTH)
  }));

  // Cap tokens - client cannot exceed the server-side limit
  const safeTokens = Math.min(parseInt(max_tokens) || 1000, MAX_TOKENS_CAP);

  // Cap system prompt length
  const safeSystem = system ? String(system).substring(0, 5000) : null;

  // Build the Anthropic API payload
  const payload = {
    model      : 'claude-sonnet-4-20250514',
    max_tokens : safeTokens,
    messages   : safeMessages
  };
  if (safeSystem) payload.system = safeSystem;

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method            : 'post',
      headers           : {
        'Content-Type'      : 'application/json',
        'x-api-key'         : ANTHROPIC_KEY,
        'anthropic-version' : '2023-06-01'
      },
      payload           : JSON.stringify(payload),
      muteHttpExceptions: true  // prevents Apps Script from throwing on 4xx/5xx
    });

    const statusCode  = response.getResponseCode();
    const body        = JSON.parse(response.getContentText());

    if (statusCode === 200) {
      // Forward the content blocks and token usage back to the client
      return respond(true, 'ok', { content: body.content, usage: body.usage });
    }

    // Surface Anthropic error messages to help with debugging
    const errMsg = body.error ? body.error.message : 'Unknown error';
    return respond(false, 'Anthropic API error ' + statusCode + ': ' + errMsg);

  } catch (err) {
    return respond(false, 'UrlFetchApp error: ' + err.message);
  }
}


// =============================================================================
// SHEET OPERATIONS
// All write operations sanitise input before touching the Sheet.
// =============================================================================

/**
 * Appends a new row to the Sheet.
 * If a row with the same id already exists, updates it instead of
 * creating a duplicate - makes the operation idempotent.
 *
 * @param {Object} rowData - Key-value object matching the COLS schema
 * @returns {TextOutput} JSON response with the row id
 */
function appendRow(rowData) {
  if (!rowData || typeof rowData !== 'object') {
    return respond(false, 'Invalid row data - expected an object');
  }

  const sheet = getSheet();

  // Prevent duplicates - update if id already exists
  if (rowData.id) {
    const existingIndex = findRowById(rowData.id);
    if (existingIndex > 0) return updateRowAt(existingIndex, rowData);
  }

  // Map the object to an ordered array matching the Sheet columns
  sheet.appendRow(COLS.map(col => sanitiseCell(rowData[col])));
  return respond(true, 'Row appended: ' + (rowData.id || 'no id'), { id: rowData.id });
}

/**
 * Updates an existing row identified by its id value.
 *
 * @param {string} id      - The row's id value (column 1)
 * @param {Object} rowData - Updated key-value object
 * @returns {TextOutput} JSON response
 */
function updateRow(id, rowData) {
  if (!id) return respond(false, 'No id provided for update');

  const rowIndex = findRowById(id);
  if (rowIndex < 0) return respond(false, 'Row not found with id: ' + id);

  return updateRowAt(rowIndex, rowData);
}

/**
 * Writes a full row to a specific 1-indexed Sheet row number.
 * Used by both appendRow (for duplicate prevention) and updateRow.
 *
 * @param {number} rowIndex - 1-indexed Sheet row number
 * @param {Object} rowData  - Key-value object matching the COLS schema
 * @returns {TextOutput} JSON response
 */
function updateRowAt(rowIndex, rowData) {
  const sheet = getSheet();
  const values = [COLS.map(col =>
    rowData[col] !== undefined ? sanitiseCell(rowData[col]) : ''
  )];
  sheet.getRange(rowIndex, 1, 1, COLS.length).setValues(values);
  return respond(true, 'Row updated at index ' + rowIndex, { rowIndex });
}

/**
 * Deletes a row from the Sheet by its id value.
 * Rows are physically deleted (shifted up), not just cleared.
 *
 * @param {string} id - The row's id value (column 1)
 * @returns {TextOutput} JSON response
 */
function deleteRow(id) {
  if (!id) return respond(false, 'No id provided for delete');

  const rowIndex = findRowById(id);
  if (rowIndex < 0) return respond(false, 'Row not found with id: ' + id);

  getSheet().deleteRow(rowIndex);
  return respond(true, 'Row deleted: ' + id);
}

/**
 * Returns all unlocked resource rows, with optional filtering.
 * Locked rows (teacher marking guides, answer keys) are always
 * filtered out server-side and never sent to the client.
 *
 * @param {string} filterClass - Optional class filter e.g. 'Year 7'
 * @param {string} filterTerm  - Optional term filter e.g. '2'
 * @returns {TextOutput} JSON response with a rows array
 */
function getRows(filterClass, filterTerm) {
  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();

  // Row 0 is the header - slice it off and convert remaining rows to objects
  const headers = data[0];
  const rows = data.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => { obj[header] = row[i]; });
      return obj;
    })
    .filter(row => {
      // Hard filter - locked rows NEVER leave the server
      const isLocked = row.locked === true
        || String(row.locked).toLowerCase() === 'true';
      if (isLocked) return false;

      // Optional class filter
      if (filterClass && row.class !== filterClass) return false;

      // Optional term filter - compare as strings to handle mixed types
      if (filterTerm && String(row.term) !== String(filterTerm)) return false;

      return true;
    });

  return respond(true, rows.length + ' rows returned', { rows });
}


// =============================================================================
// HELPERS
// =============================================================================

/**
 * Returns the Sheet tab defined by SHEET_NAME.
 * Falls back to the first tab if the named tab is not found,
 * which prevents a hard failure on a misconfigured SHEET_NAME.
 *
 * @returns {Sheet} Google Apps Script Sheet object
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/**
 * Finds the 1-indexed Sheet row number for a given id value.
 * Searches column 1 (the id column) only.
 *
 * @param {string} id - The id value to search for
 * @returns {number} 1-indexed row number, or -1 if not found
 */
function findRowById(id) {
  const data = getSheet().getDataRange().getValues();

  // Start at index 1 to skip the header row
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i + 1; // +1 converts 0-indexed array to 1-indexed Sheet row
    }
  }
  return -1;
}

/**
 * Sanitises a value before writing it to a Sheet cell.
 *
 * Prevents formula injection attacks - a common spreadsheet vulnerability
 * where a malicious value starting with =, +, -, or @ is interpreted as
 * a formula by Google Sheets, potentially executing arbitrary code.
 *
 * Also caps cell length to prevent excessively large payloads.
 *
 * @param {*} value - Raw value from the incoming request
 * @returns {string} Safe string value ready to write to the Sheet
 */
function sanitiseCell(value) {
  if (value === null || value === undefined) return '';

  const str = String(value);

  // Prefix formula-injection characters with an apostrophe
  // Sheets treats apostrophe-prefixed values as plain text
  if (['=', '+', '-', '@'].includes(str.charAt(0))) {
    return "'" + str;
  }

  // Cap cell length - prevents bloated Sheet cells
  return str.substring(0, 5000);
}

/**
 * Builds a standardised JSON response object and returns it as a
 * ContentService TextOutput with MIME type JSON.
 *
 * All responses follow the shape:
 *   { success: boolean, message: string, ...extra }
 *
 * @param {boolean} success - Whether the operation succeeded
 * @param {string}  message - Human-readable result description
 * @param {Object}  extra   - Optional additional fields to include
 * @returns {TextOutput} Apps Script ContentService output
 */
function respond(success, message, extra) {
  const payload = Object.assign({ success, message }, extra || {});
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
