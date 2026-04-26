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
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Expense-Tracker\AI-Expense-Tracker-Frontend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Expense-Tracker\AI-Expense-Tracker-Backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\Slack Clone\Slack-Backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\Slack Clone\Slack-Frontend-New\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Resume-Builder\aI-resume-builder-frontend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Resume-Builder\AI-Resume-Builder-Backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\devflow\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\LeetLab\Algodrill-Project\algodrill-backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\LeetLab\Algodrill-Project\algodrill-backend-typescript\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\LeetLab\Algodrill-Project\algodrill-frontend\src`;
// const TARGET_FOLDER = String.raw`e:\My Projects\URL-Shortner-NextJS\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Interview-Coach\aI-interview-coach-backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\AI-Interview-Coach\aI-interview-coach-frontend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\WhatsApp\WhatsApp-Frontend\src`;
// const TARGET_FOLDER = String.raw`e:\My Projects\WhatsApp\WhatsApp-Backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\WhatsApp-Clone\whatsapp-frontend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\WhatsApp-Clone\whatsapp-backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\Drive-X\drive-X-backend\src`;
// const TARGET_FOLDER = String.raw`E:\My Projects\Drive-X\drive-X-frontend\src`;

// const TARGET_FOLDER = 'E:/My Projects/LeetLab/Algodrill/frontend/src';
// const TARGET_FOLDER = 'E:/My Projects/LeetLab/Algodrill/frontend/src';
// const TARGET_FOLDER =
//   'E:/My Projects/Dev-Collab/Dev-Collab-Frontend/src';
// const TARGET_FOLDER = 'E:/My Projects/Slack Clone/Slack-Frontend/src';
// const TARGET_FOLDER = 'E:/Web Dev Course/Coder\'s Gyan Gen AI Course/LinkedIn-Post-Writter-Reflection-Pattern/src';

// 👇 TARGET_FOLDERS supports one or more paths.
//    All paths are extracted into a single combined output file.
//    Add as many paths as needed — just separate them with commas.
const TARGET_FOLDERS = [
  // String.raw`E:\My Projects\WhatsApp-Clone\whatsapp-backend\src`,
  // String.raw`E:\My Projects\WhatsApp-Clone\whatsapp-frontend\src`,
  // String.raw`E:\My Projects\Dev-Collab\Dev-Collab-TypeScript\Dev-Collab-Frontend\src`,
  // String.raw`E:\My Projects\AI-Expense-Tracker\AI-Expense-Tracker-Backend\src`,
  // String.raw`E:\My Projects\AI-Expense-Tracker\AI-Expense-Tracker-Frontend\src`,
  // String.raw`E:\My Projects\Project-Management\sprintly-frontend\src`,
  // String.raw`E:\My Projects\ai-image-editor\src`,
  // String.raw`E:\My Projects\URL-Shortner-NextJS\src`,
  // String.raw`E:\My Projects\AI-Resume-Builder\AI-Resume-Builder-Backend\src`,
  // String.raw`E:\My Projects\AI-Resume-Builder\resumeiq-typescript\resumeiq-frontend\src`,
  // String.raw`E:\My Projects\AI-Resume-Builder\resumeiq-typescript\resumeiq-backend\src`,
  String.raw`E:\My Projects\Dev-Collab\Dev-Collab-TypeScript\Dev-Collab-Frontend\src`,
  // String.raw`E:\My Projects\AI-Resume-Builder\resumeiq-typescript\resumeiq-backend\src`,
];

// 👇 Output folder name (leave empty to auto-generate from TARGET_FOLDERS)
//    When multiple folders are provided, names are joined with '_and_'
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
  "fonts",
  "generated",
  "prisma",
]);

const EXCLUDED_FILES = new Set([
  ".gitignore",
  "extract-codes.js",
  "tokens.json",
  "all_code.txt",
  ".DS_Store",
  "Thumbs.db",
  "favicon.ico",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".log",
  ".swp",
  ".tsbuildinfo",
  ".json",
  ".yml",
  ".png",
  ".jpg",
  ".jpeg",
]);

// Directories excluded only when inside a specific parent directory
const EXCLUDED_NESTED = [
  { parent: "components", child: "ui" },
  { parent: "components", child: "ai-elements" },
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
  // Validate all paths exist before starting
  for (const folder of TARGET_FOLDERS) {
    const sourcePath = path.resolve(folder);
    if (!fs.existsSync(sourcePath)) {
      console.error("❌ Target folder does not exist:", sourcePath);
      process.exit(1);
    }
  }

  // 👇 Iterate over all target folders and extract each into its OWN folder
  for (const folder of TARGET_FOLDERS) {
    const sourcePath = path.resolve(folder);

    // 👇 Determine output folder name per folder
    const outputFolderName =
      OUTPUT_FOLDER_NAME || extractOutputFolderName(folder);

    // 👇 Output always created next to extract-codes.js
    const outputDir = path.join(__dirname, outputFolderName);
    fs.mkdirSync(outputDir, { recursive: true });

    const outputFilePath = path.join(outputDir, OUTPUT_FILE_NAME);
    const writer = fs.createWriteStream(outputFilePath, { flags: "w" });

    console.log(`📂 Extracting: ${sourcePath}`);
    extractCode(sourcePath, writer);

    writer.end();

    console.log("✅ Code extraction completed!");
    console.log("📁 Output folder:", outputDir);
    console.log("📄 Output file:", outputFilePath);
    console.log("📝 Output folder name:", outputFolderName);
    console.log("─".repeat(50));
  }
})();
