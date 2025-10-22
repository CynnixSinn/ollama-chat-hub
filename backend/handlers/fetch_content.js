const axios = require('axios');
const cheerio = require('cheerio');

async function fetchContent(req, res) {
    const { url, method = 'GET', headers = {}, body = null, extract = null } = req.body;

    try {
        // Make the request
        const response = await axios({
            method,
            url,
            headers,
            data: body,
            responseType: 'text',
            maxContentLength: 10 * 1024 * 1024 // 10MB limit
        });

        let content = response.data;
        let extracted = null;

        // Extract specific content if selector is provided
        if (extract && typeof content === 'string') {
            const $ = cheerio.load(content);
            extracted = $(extract).map((_, el) => ({
                text: $(el).text().trim(),
                html: $(el).html()
            })).get();
            content = extracted;
        }

        res.json({
            content,
            metadata: {
                status: response.status,
                headers: response.headers,
                contentType: response.headers['content-type']
            }
        });
    } catch (error) {
        console.error('Fetch content error:', error);
        res.status(error.response?.status || 500).json({
            error: error.message,
            metadata: error.response ? {
                status: error.response.status,
                headers: error.response.headers
            } : null
        });
    }
}

module.exports = fetchContent;