const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ArtifactsManager {
  constructor(artifactsDir = path.join(__dirname, '../artifacts')) {
    this.artifactsDir = artifactsDir;
    this.ensureArtifactsDir();
  }

  async ensureArtifactsDir() {
    try {
      await fs.mkdir(this.artifactsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating artifacts directory:', error.message);
    }
  }

  async saveArtifact(content, name, type, mimeType = null) {
    try {
      const artifactId = uuidv4();
      const extension = this.getExtensionFromType(type) || this.getExtensionFromMimeType(mimeType);
      const fileName = `${artifactId}${extension ? `.${extension}` : ''}`;
      const filePath = path.join(this.artifactsDir, fileName);

      // Write the artifact to the filesystem
      if (typeof content === 'string' && content.startsWith('data:')) {
        // Handle data URLs
        const base64Data = content.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (typeof content === 'string') {
        // Handle plain text content
        await fs.writeFile(filePath, content);
      } else if (Buffer.isBuffer(content)) {
        // Handle buffer content
        await fs.writeFile(filePath, content);
      }

      const stat = await fs.stat(filePath);
      
      const artifact = {
        id: artifactId,
        name: name || fileName,
        type,
        mimeType: mimeType || this.getMimeTypeFromType(type),
        content: content,
        size: stat.size,
        path: filePath,
        url: `/artifacts/${fileName}`,
        timestamp: new Date().toISOString()
      };

      return artifact;
    } catch (error) {
      console.error('Error saving artifact:', error.message);
      throw error;
    }
  }

  async getArtifact(id) {
    try {
      const artifacts = await this.getAllArtifacts();
      return artifacts.find(artifact => artifact.id === id);
    } catch (error) {
      console.error('Error getting artifact:', error.message);
      throw error;
    }
  }

  async getAllArtifacts() {
    try {
      const files = await fs.readdir(this.artifactsDir);
      const artifacts = [];

      for (const file of files) {
        const filePath = path.join(this.artifactsDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isFile()) {
          const fileName = path.basename(file, path.extname(file));
          const extension = path.extname(file).substring(1);
          
          artifacts.push({
            id: fileName,
            name: file,
            type: this.getTypeFromExtension(extension),
            mimeType: this.getMimeTypeFromExtension(extension),
            size: stat.size,
            path: filePath,
            url: `/artifacts/${file}`,
            timestamp: stat.mtime.toISOString()
          });
        }
      }

      return artifacts;
    } catch (error) {
      console.error('Error getting all artifacts:', error.message);
      throw error;
    }
  }

  async deleteArtifact(id) {
    try {
      const artifact = await this.getArtifact(id);
      if (artifact) {
        await fs.unlink(artifact.path);
      }
    } catch (error) {
      console.error('Error deleting artifact:', error.message);
      throw error;
    }
  }

  getTypeFromExtension(extension) {
    const typeMap = {
      'js': 'code',
      'ts': 'code',
      'jsx': 'code',
      'tsx': 'code',
      'py': 'code',
      'java': 'code',
      'cpp': 'code',
      'c': 'code',
      'html': 'code',
      'css': 'code',
      'json': 'code',
      'xml': 'code',
      'md': 'text',
      'txt': 'text',
      'pdf': 'document',
      'doc': 'document',
      'docx': 'document',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'svg': 'image',
      'webp': 'image'
    };
    return typeMap[extension.toLowerCase()] || 'file';
  }

  getMimeTypeFromExtension(extension) {
    const typeMap = {
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'jsx': 'application/javascript',
      'tsx': 'application/typescript',
      'py': 'text/x-python',
      'java': 'text/x-java-source',
      'cpp': 'text/x-c++src',
      'c': 'text/x-c',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'xml': 'application/xml',
      'md': 'text/markdown',
      'txt': 'text/plain',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp'
    };
    return typeMap[extension.toLowerCase()] || 'application/octet-stream';
  }

  getMimeTypeFromType(type) {
    const typeMap = {
      'code': 'text/plain',
      'text': 'text/plain',
      'document': 'application/octet-stream',
      'image': 'image/png'
    };
    return typeMap[type] || 'application/octet-stream';
  }

  getExtensionFromType(type) {
    const typeMap = {
      'code': 'txt',
      'text': 'txt',
      'document': 'txt',
      'image': 'png'
    };
    return typeMap[type] || 'txt';
  }
}

module.exports = ArtifactsManager;