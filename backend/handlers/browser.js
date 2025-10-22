const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class BrowserTool {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
        }
    }

    async navigate(url) {
        await this.initialize();
        await this.page.goto(url, { waitUntil: 'networkidle0' });
        return {
            title: await this.page.title(),
            url: this.page.url()
        };
    }

    async click(selector) {
        await this.initialize();
        await this.page.click(selector);
        await this.page.waitForNetworkIdle();
        return {
            success: true,
            url: this.page.url()
        };
    }

    async type(selector, text) {
        await this.initialize();
        await this.page.type(selector, text);
        return { success: true };
    }

    async extract(selector) {
        await this.initialize();
        const elements = await this.page.$$(selector);
        const results = await Promise.all(
            elements.map(el => el.evaluate(node => ({
                text: node.innerText,
                html: node.innerHTML
            })))
        );
        return { elements: results };
    }

    async screenshot() {
        await this.initialize();
        const buffer = await this.page.screenshot();
        return {
            screenshot: buffer.toString('base64')
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

const browserTool = new BrowserTool();

// Cleanup on process exit
process.on('exit', () => {
    browserTool.cleanup().catch(console.error);
});

module.exports = async function handleBrowser(req, res) {
    const { action, url, selector, text } = req.body;

    try {
        let result;
        switch (action) {
            case 'navigate':
                result = await browserTool.navigate(url);
                break;
            case 'click':
                result = await browserTool.click(selector);
                break;
            case 'type':
                result = await browserTool.type(selector, text);
                break;
            case 'extract':
                result = await browserTool.extract(selector);
                break;
            case 'screenshot':
                result = await browserTool.screenshot();
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        res.json({ result });
    } catch (error) {
        console.error('Browser tool error:', error);
        res.status(500).json({ error: error.message });
    }
};