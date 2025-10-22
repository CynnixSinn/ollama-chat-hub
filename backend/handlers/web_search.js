const axios = require('axios');

async function webSearch(query) {
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      }
    });
    
    const results = [];
    
    if (response.data.AbstractText) {
      results.push({
        title: response.data.Heading || 'Direct Answer',
        snippet: response.data.AbstractText,
        url: response.data.AbstractURL || ''
      });
    }
    
    if (response.data.RelatedTopics && response.data.RelatedTopics.length > 0) {
      response.data.RelatedTopics.slice(0, 5).forEach(topic => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related',
            snippet: topic.Text,
            url: topic.FirstURL
          });
        }
      });
    }
    
    return {
      success: true,
      results: results.length > 0 ? results : [{
        title: 'No results found',
        snippet: `No search results found for "${query}"`,
        url: ''
      }]
    };
  } catch (error) {
    console.error('Web search error:', error.message);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

module.exports = { webSearch };
