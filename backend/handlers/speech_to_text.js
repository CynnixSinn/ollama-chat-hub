const SpeechToText = require('../utils/speech_to_text');
const speechToText = new SpeechToText();

// Initialize speech-to-text capability
speechToText.initialize().catch(error => {
    console.error('Failed to initialize speech-to-text:', error);
});

module.exports = async function handleSpeechToText(req, res) {
    try {
        const { audio } = req.body;
        if (!audio) {
            return res.status(400).json({ error: 'Audio data is required' });
        }

        const text = await speechToText.transcribe(audio);
        res.json({ text });
    } catch (error) {
        console.error('Speech to text error:', error);
        res.status(500).json({ error: error.message });
    }
};