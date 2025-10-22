const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function executeCode(language, code) {
  // SECURITY: Code executor is disabled by default due to RCE risk
  // To enable, set environment variable ENABLE_CODE_EXECUTOR=true
  if (process.env.ENABLE_CODE_EXECUTOR !== 'true') {
    return {
      success: false,
      error: 'Code execution is disabled for security reasons. Set ENABLE_CODE_EXECUTOR=true to enable (trusted environments only).'
    };
  }
  const tempDir = path.join(__dirname, '../../temp');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (err) {
    console.error('Error creating temp directory:', err);
  }

  const sessionId = uuidv4();
  let command, args, filename;

  switch (language.toLowerCase()) {
    case 'python':
      filename = path.join(tempDir, `${sessionId}.py`);
      command = 'python3';
      args = [filename];
      break;
    
    case 'javascript':
    case 'js':
      filename = path.join(tempDir, `${sessionId}.js`);
      command = 'node';
      args = [filename];
      break;
    
    case 'bash':
    case 'sh':
      filename = path.join(tempDir, `${sessionId}.sh`);
      command = 'bash';
      args = [filename];
      break;
    
    default:
      return {
        success: false,
        error: `Unsupported language: ${language}. Supported languages: python, javascript, bash`
      };
  }

  try {
    await fs.writeFile(filename, code);

    const result = await new Promise((resolve, reject) => {
      const childProcess = spawn(command, args, {
        timeout: 5000,
        cwd: tempDir,
        env: {
          HOME: tempDir,
          PATH: process.env.PATH,
          USER: 'nobody'
        },
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let killed = false;
      
      const maxOutputSize = 50000;

      childProcess.stdout.on('data', (data) => {
        if (stdout.length < maxOutputSize) {
          stdout += data.toString();
        } else if (!killed) {
          killed = true;
          childProcess.kill();
          stderr += '\nOutput size limit exceeded (50KB)';
        }
      });

      childProcess.stderr.on('data', (data) => {
        if (stderr.length < maxOutputSize) {
          stderr += data.toString();
        }
      });

      childProcess.on('close', (code) => {
        resolve({
          success: code === 0 && !killed,
          output: stdout.slice(0, maxOutputSize),
          error: stderr || (code !== 0 ? `Process exited with code ${code}` : ''),
          exitCode: code
        });
      });

      childProcess.on('error', (err) => {
        reject({
          success: false,
          error: err.message
        });
      });

      setTimeout(() => {
        if (!killed) {
          killed = true;
          childProcess.kill('SIGKILL');
          reject({
            success: false,
            error: 'Execution timeout (5 seconds)'
          });
        }
      }, 5000);
    });

    await fs.unlink(filename).catch(() => {});
    
    return result;
  } catch (error) {
    await fs.unlink(filename).catch(() => {});
    
    return {
      success: false,
      error: error.message || error.error || 'Unknown error occurred'
    };
  }
}

module.exports = { executeCode };
