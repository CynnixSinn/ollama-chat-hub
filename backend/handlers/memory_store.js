const fs = require('fs').promises;
const path = require('path');
const NodeCache = require('node-cache');

// Initialize memory cache with 24hr TTL
const memoryCache = new NodeCache({ stdTTL: 86400 });

// File-based storage for persistence
const MEMORY_FILE = path.join(__dirname, '../../data/memory_store.json');

class MemoryStore {
    constructor() {
        this.ensureDataDir();
        this.loadMemories();
    }

    async ensureDataDir() {
        const dataDir = path.dirname(MEMORY_FILE);
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error('Failed to create data directory:', error);
            }
        }
    }

    async loadMemories() {
        try {
            const data = await fs.readFile(MEMORY_FILE, 'utf8');
            const memories = JSON.parse(data);
            Object.entries(memories).forEach(([key, value]) => {
                memoryCache.set(key, value);
            });
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Failed to load memories:', error);
            }
        }
    }

    async saveMemories() {
        try {
            const memories = memoryCache.mget(memoryCache.keys());
            await fs.writeFile(MEMORY_FILE, JSON.stringify(memories, null, 2));
        } catch (error) {
            console.error('Failed to save memories:', error);
        }
    }

    async store(key, content) {
        const memory = {
            content,
            timestamp: Date.now(),
            metadata: { lastAccessed: Date.now() }
        };
        memoryCache.set(key, memory);
        await this.saveMemories();
        return memory;
    }

    async retrieve(key) {
        const memory = memoryCache.get(key);
        if (memory) {
            memory.metadata.lastAccessed = Date.now();
            memoryCache.set(key, memory);
            await this.saveMemories();
        }
        return memory;
    }

    async search(query) {
        const memories = memoryCache.mget(memoryCache.keys());
        return Object.entries(memories)
            .filter(([_, memory]) => 
                JSON.stringify(memory.content).toLowerCase().includes(query.toLowerCase()))
            .map(([key, memory]) => ({ key, ...memory }));
    }

    async update(key, content) {
        const existing = memoryCache.get(key);
        if (!existing) return null;

        const updated = {
            content,
            timestamp: Date.now(),
            metadata: { 
                ...existing.metadata,
                lastModified: Date.now(),
                lastAccessed: Date.now()
            }
        };
        memoryCache.set(key, updated);
        await this.saveMemories();
        return updated;
    }

    async delete(key) {
        const success = memoryCache.del(key);
        if (success) {
            await this.saveMemories();
        }
        return success;
    }
}

const memoryStore = new MemoryStore();

module.exports = async function handleMemoryStore(req, res) {
    const { action, key, content, query } = req.body;

    try {
        let result;
        switch (action) {
            case 'store':
                result = await memoryStore.store(key, content);
                break;
            case 'retrieve':
                result = await memoryStore.retrieve(key);
                break;
            case 'search':
                result = await memoryStore.search(query);
                break;
            case 'update':
                result = await memoryStore.update(key, content);
                break;
            case 'delete':
                result = await memoryStore.delete(key);
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        if (result === null) {
            res.status(404).json({ error: 'Memory not found' });
        } else {
            res.json({ result });
        }
    } catch (error) {
        console.error('Memory store error:', error);
        res.status(500).json({ error: error.message });
    }
};