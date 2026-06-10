/**
 * =============================================================================
 * DigiTech Hub - Google Drive Folder Creator v3
 * =============================================================================
 *
 * Minimal flat structure - one folder per module.
 * 22 module folders + Assessments + References = ~30 folders total.
 * No nesting inside module folders - files go directly in the module folder.
 *
 * Run createFolderStructure() ONCE.
 * Run logFolderIDs() after to get all IDs.
 *
 * Author  : M. Miller - Emmanuel Christian School, Tasmania
 * =============================================================================
 */

/**
 * All 22 teachable modules from the Schedule tab.
 * Folder names here must match the consolidated module names
 * used in the Resources tab 'module' column.
 */
const MODULES = [
  '3D Printing and Design',
  'AI and Machine Learning',
  'Advanced Cybersecurity',
  'Binary Numbers and Data Representation',
  'Bit:Bot Automation',
  'Capstone Project',
  'Creating a Digital Solution',
  'Data Compression',
  'Data Science with Python',
  'Digital Solution Project',
  'Digital Systems and Hardware',
  'Extension and Enrichment',
  'File Journeys and Networks',
  'General-purpose Programming',
  'Microsoft Office Suite',
  'Networks and Cyber Security',
  'Object-oriented Programming',
  'Open Exploration',
  'Privacy and Ethics',
  'Python and micro:bit',
  'Web Development',
  'Working with Data'
];

/**
 * Assessment folders - one per class.
 * Rubrics and marking guides go here (locked=TRUE in Sheet).
 */
const ASSESSMENT_FOLDERS = [
  'Year 7',
  'Year 8',
  'Year 9-10',
  'Inquiry'
];

/**
 * Shared reference materials used across multiple modules.
 */
const REFERENCE_FOLDERS = [
  'Rubric Templates',
  'Lesson Outline Templates',
  'AC Code Reference Sheets',
  'Student Handout Templates'
];


// =============================================================================
// MAIN
// =============================================================================

/**
 * Creates the entire folder structure.
 * Run ONCE - will create duplicates if run again.
 */
function createFolderStructure() {
  const root = DriveApp.getRootFolder();

  Logger.log('Creating DigiTech Resources 2026...');
  const main = root.createFolder('DigiTech Resources 2026');

  // Module folders - flat, one per module
  Logger.log('Creating Modules folder...');
  const modulesFolder = main.createFolder('Modules');
  MODULES.forEach(name => {
    Logger.log('  ' + name);
    modulesFolder.createFolder(name);
  });

  // Assessment folders - one per class
  Logger.log('Creating Assessments folder...');
  const assessFolder = main.createFolder('Assessments');
  ASSESSMENT_FOLDERS.forEach(name => {
    Logger.log('  ' + name);
    assessFolder.createFolder(name);
  });

  // Reference and template materials
  Logger.log('Creating References and Templates folder...');
  const refFolder = main.createFolder('References and Templates');
  REFERENCE_FOLDERS.forEach(name => {
    Logger.log('  ' + name);
    refFolder.createFolder(name);
  });

  Logger.log('');
  Logger.log('Done - ' + (MODULES.length + ASSESSMENT_FOLDERS.length + REFERENCE_FOLDERS.length + 3) + ' folders created.');
  Logger.log('Run logFolderIDs() to get all IDs.');
}

/**
 * Logs all folder IDs after creation.
 * Copy output - IDs build your Drive file links.
 */
function logFolderIDs() {
  const results = DriveApp.getFoldersByName('DigiTech Resources 2026');
  if (!results.hasNext()) {
    Logger.log('DigiTech Resources 2026 not found. Run createFolderStructure() first.');
    return;
  }
  const root = results.next();
  Logger.log('=== DigiTech Resources 2026 Folder IDs ===');
  Logger.log('Root: ' + root.getId());
  Logger.log('');
  logChildren(root, 0);
}

function logChildren(folder, depth) {
  const indent = '  '.repeat(depth);
  const children = folder.getFolders();
  while (children.hasNext()) {
    const child = children.next();
    Logger.log(indent + child.getName() + ' | ' + child.getId());
    logChildren(child, depth + 1);
  }
}
