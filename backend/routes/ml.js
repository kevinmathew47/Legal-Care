const express = require('express');
const router = express.Router();
const { predictDocument } = require('../ml_model');

router.post('/analyze_document', async (req, res) => {
    try {
        const { documentText } = req.body;

        if (!documentText) {
            return res.status(400).json({ error: 'documentText is required' });
        }

        // Run inference through custom built ML classification models
        const result = predictDocument(documentText);

        res.json(result);
    } catch (error) {
        console.error('Error analyzing document with ML model:', error);
        res.status(500).json({ error: 'Failed to analyze document' });
    }
});

module.exports = router;
