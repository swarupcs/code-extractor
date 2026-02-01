/**
 * Code Extractor Script
 * ---------------------
 * Extracts all source code from a target folder
 * and writes it into a single text file.
 * Output folder name is HARD-CODED.
 */

const fs = require('fs');
const path = require('path');

// =========================
// CONFIG
// =========================

// 👇 Source folder (absolute or relative)
// const TARGET_FOLDER = 'E:/My Projects/chrona-ai/chrona-ai-backend/src';
const TARGET_FOLDER =
  'E:/My Projects/AI-Interview-Coach/aI-interview-coach-backend/src';

// 👇 HARD-CODED output folder name
const OUTPUT_FOLDER_NAME = 'aI-interview-coach-backend';

// 👇 Output file
const OUTPUT_FILE_NAME = 'all_code.txt';

// =========================
// EXCLUSION RULES
// =========================

const EXCLUDED_DIRS = new Set([
  '.git',
  'node_modules',
  '.pnpm-store',
  'dist',
  'build',
  'out',
  'logs',
  '.cache',
  '.tmp',
  'coverage',
  '.idea',
  '.vscode',
]);

const EXCLUDED_FILES = new Set([
  '.gitignore',
  'extract-codes.js',
  'tokens.json',
  'all_code.txt',
  '.DS_Store',
  'Thumbs.db',
]);

const EXCLUDED_EXTENSIONS = new Set(['.log', '.swp', '.tsbuildinfo']);

// =========================
// HELPERS
// =========================

function shouldIgnore(filePath) {
  const baseName = path.basename(filePath);

  if (baseName.startsWith('.env') && baseName !== '.env.example') {
    return true;
  }

  if (EXCLUDED_FILES.has(baseName)) return true;

  if (EXCLUDED_EXTENSIONS.has(path.extname(baseName))) return true;

  return false;
}

// =========================
// EXTRACTION LOGIC
// =========================

function extractCode(dirPath, writer) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      extractCode(fullPath, writer);
    } else {
      if (shouldIgnore(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf8');

      writer.write('\n\n==============================\n');
      writer.write(`FILE: ${fullPath}\n`);
      writer.write('==============================\n\n');
      writer.write(content);
    }
  }
}

// =========================
// RUN
// =========================

(function run() {
  const sourcePath = path.resolve(TARGET_FOLDER);

  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Target folder does not exist:', sourcePath);
    process.exit(1);
  }

  // 👇 Output always created next to extract-codes.js
  const outputDir = path.join(__dirname, OUTPUT_FOLDER_NAME);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFilePath = path.join(outputDir, OUTPUT_FILE_NAME);
  const writer = fs.createWriteStream(outputFilePath, { flags: 'w' });

  extractCode(sourcePath, writer);

  writer.end();

  console.log('✅ Code extraction completed!');
  console.log('📁 Output folder:', outputDir);
  console.log('📄 Output file:', outputFilePath);
})();
