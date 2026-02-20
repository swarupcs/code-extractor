/**
 * Code Extractor Script
 * ---------------------
 * Extracts all source code from a target folder
 * and writes it into a single text file.
 * Output folder name is auto-generated from path if not specified.
 */
const fs = require("fs");
const path = require("path");

// =========================
// CONFIG
// =========================
// 👇 Source folder (absolute or relative)
// const TARGET_FOLDER = 'E:/My Projects/chrona-ai/chrona-ai-backend/src';
const TARGET_FOLDER = String.raw`E:\My Projects\swarup-portfolio\src`;
// const TARGET_FOLDER = 'E:/My Projects/LeetLab/Algodrill/frontend/src';
// const TARGET_FOLDER =
//   'E:/My Projects/Dev-Collab/Dev-Collab-Frontend/src';
// const TARGET_FOLDER = 'E:/My Projects/Slack Clone/Slack-Frontend/src';
// const TARGET_FOLDER = 'E:/Web Dev Course/Coder\'s Gyan Gen AI Course/LinkedIn-Post-Writter-Reflection-Pattern/src';

// 👇 Output folder name (leave empty to auto-generate from TARGET_FOLDER)
const OUTPUT_FOLDER_NAME = "";

// 👇 Output file
const OUTPUT_FILE_NAME = "all_code.txt";

// =========================
// EXCLUSION RULES
// =========================
const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".pnpm-store",
  "dist",
  "build",
  "out",
  "logs",
  ".cache",
  ".tmp",
  "coverage",
  ".idea",
  ".vscode",
  
]);

const EXCLUDED_FILES = new Set([
  ".gitignore",
  "extract-codes.js",
  "tokens.json",
  "all_code.txt",
  ".DS_Store",
  "Thumbs.db",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".log",
  ".swp",
  ".tsbuildinfo",
  ".json",
  ".yml",
]);

// Directories excluded only when inside a specific parent directory
const EXCLUDED_NESTED = [
  { parent: "components", child: "ui" },
  { parent: "generated", child: "prisma" },
];

// =========================
// HELPERS
// =========================
function shouldIgnore(filePath) {
  const baseName = path.basename(filePath);
  if (baseName.startsWith(".env") && baseName !== ".env.example") {
    return true;
  }
  if (EXCLUDED_FILES.has(baseName)) return true;
  if (EXCLUDED_EXTENSIONS.has(path.extname(baseName))) return true;
  return false;
}

/**
 * Extracts the folder name that comes before 'src' in the path
 * @param {string} targetPath - The target folder path
 * @returns {string} - The folder name before 'src'
 */
function extractOutputFolderName(targetPath) {
  // Normalize path separators to forward slashes
  const normalizedPath = targetPath.replace(/\\/g, "/");

  // Split the path into parts
  const parts = normalizedPath.split("/").filter((part) => part);

  // Find the index of 'src'
  const srcIndex = parts.findIndex((part) => part.toLowerCase() === "src");

  // If 'src' is found and there's a folder before it, return that folder
  if (srcIndex > 0) {
    return parts[srcIndex - 1];
  }

  // Fallback: return the last non-empty part of the path
  return parts[parts.length - 1] || "extracted_code";
}

// =========================
// EXTRACTION LOGIC
// =========================
function extractCode(dirPath, writer) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const currentDirName = path.basename(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;

      // Skip nested exclusions like components/ui
      const isExcludedNested = EXCLUDED_NESTED.some(
        ({ parent, child }) =>
          entry.name === child && currentDirName === parent,
      );
      if (isExcludedNested) continue;

      extractCode(fullPath, writer);
    } else {
      if (shouldIgnore(fullPath)) continue;
      const content = fs.readFileSync(fullPath, "utf8");
      writer.write("\n\n==============================\n");
      writer.write(`FILE: ${fullPath}\n`);
      writer.write("==============================\n\n");
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
    console.error("❌ Target folder does not exist:", sourcePath);
    process.exit(1);
  }

  // 👇 Determine output folder name
  const outputFolderName =
    OUTPUT_FOLDER_NAME || extractOutputFolderName(TARGET_FOLDER);

  // 👇 Output always created next to extract-codes.js
  const outputDir = path.join(__dirname, outputFolderName);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputFilePath = path.join(outputDir, OUTPUT_FILE_NAME);
  const writer = fs.createWriteStream(outputFilePath, { flags: "w" });

  extractCode(sourcePath, writer);

  writer.end();

  console.log("✅ Code extraction completed!");
  console.log("📁 Output folder:", outputDir);
  console.log("📄 Output file:", outputFilePath);
  console.log("📝 Output folder name:", outputFolderName);
})();
