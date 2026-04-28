const fs = require('fs').promises;
const path = require('path');

// Resolve paths relative to the repository root
const ROOT_DIR = path.resolve(__dirname, '..');
const BOOK_DIR = path.join(ROOT_DIR, 'book');
const OUTPUT_FILE = path.join(ROOT_DIR, 'catalog.json');

/**
 * Recursively collects all .json files except author.json
 */
async function collectJsonFiles(dir, relativePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      files.push(...await collectJsonFiles(fullPath, relPath));
    } else if (
      entry.name.toLowerCase().endsWith('.json') &&
      entry.name.toLowerCase() !== 'author.json'
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  try {
    // Verify book directory exists
    const bookDirExists = await fs.stat(BOOK_DIR).catch(() => false);
    if (!bookDirExists) {
      console.error(`❌ Book directory not found: ${BOOK_DIR}`);
      process.exit(1);
    }

    // 1. Collect all JSON files
    const filePaths = await collectJsonFiles(BOOK_DIR);

    // 2. Deterministic sort by full file path
    filePaths.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    // 3. Parse and clean book data
    const books = [];
    for (const filePath of filePaths) {
      const content = await fs.readFile(filePath, 'utf-8');
      const book = JSON.parse(content);

      // Remove chapters (handles both standard key and trailing-space artifact)
      delete book.chapters;
      delete book['chapters '];

      books.push(book);
    }

    // 4. Build catalog object (extensible for future authors/metadata)
    const catalog = { books };

    // 5. Write to root catalog.json (pretty-printed)
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
    console.log(`✅ catalog.json generated successfully with ${books.length} books.`);
  } catch (err) {
    console.error('❌ Failed to generate catalog:', err.message);
    process.exit(1);
  }
}

main();