const fs = require('fs').promises;
const path = require('path');

const ALLOWED_DIR = path.join(__dirname, '../../user_files');

async function ensureAllowedDir() {
  try {
    await fs.mkdir(ALLOWED_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating user_files directory:', err);
  }
}

function sanitizePath(filePath) {
  const resolvedPath = path.resolve(ALLOWED_DIR, filePath);
  
  if (!resolvedPath.startsWith(ALLOWED_DIR)) {
    throw new Error('Access denied: Path outside allowed directory');
  }
  
  return resolvedPath;
}

async function manageFile(action, filePath, content = null) {
  await ensureAllowedDir();

  try {
    const safePath = sanitizePath(filePath);

    switch (action.toLowerCase()) {
      case 'read':
        const data = await fs.readFile(safePath, 'utf8');
        return {
          success: true,
          result: data
        };

      case 'write':
        if (content === null) {
          return {
            success: false,
            error: 'Content is required for write operation'
          };
        }
        const dir = path.dirname(safePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(safePath, content, 'utf8');
        return {
          success: true,
          result: `File written successfully to ${filePath}`
        };

      case 'list':
        const files = await fs.readdir(safePath);
        return {
          success: true,
          result: files.join('\n')
        };

      case 'delete':
        await fs.unlink(safePath);
        return {
          success: true,
          result: `File ${filePath} deleted successfully`
        };

      default:
        return {
          success: false,
          error: `Unknown action: ${action}. Supported actions: read, write, list, delete`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { manageFile };
