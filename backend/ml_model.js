const natural = require('natural');
const fs = require('fs');
const path = require('path');

//  classifiers
const legalClassifier = new natural.BayesClassifier();
const categoryClassifier = new natural.BayesClassifier();
const severityClassifier = new natural.BayesClassifier();

// Load  dataset
const datasetPath = path.join(__dirname, 'ml_dataset.json');
let dataset = [];
try {
  dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
} catch (error) {
  console.error("Could not load ML dataset. Ensure ml_dataset.json exists.");
}

// Train the models based on the dataset
const trainModels = () => {
    dataset.forEach((data) => {
      
        legalClassifier.addDocument(data.text, data.is_legal ? 'legal' : 'not_legal');

        // Train category & severity only if it's legal
        if (data.is_legal) {
            categoryClassifier.addDocument(data.text, data.category);
            severityClassifier.addDocument(data.text, data.severity);
        }
    });

    legalClassifier.train();
    categoryClassifier.train();
    severityClassifier.train();
    console.log("Custom Machine Learning Models trained successfully!");
};

// Start training on initialization
trainModels();

/**
 * Predict details from a text snippet
 * @param {string} text - text from document
 * @returns {object} predictions
 */
const predictDocument = (text) => {
    // 0. Pre-filter very short text
    const words = text.trim().split(/\s+/);
    if (words.length < 5) {
        return {
            isLegal: false,
            message: "This document is too short to be analyzed accurately. Please provide a full context or at least 5 words."
        };
    }

 
    const legalClassification = legalClassifier.classify(text);

    if (legalClassification === 'not_legal') {
        return {
            isLegal: false,
            message: "We can't help with this document as it is not related to law."
        };
    }


    const category = categoryClassifier.classify(text);

    // 3. Predict Severity
    const severity = severityClassifier.classify(text);

    return {
        isLegal: true,
        category: category,
        severity: severity,
        message: "Successfully analyzed document using custom ML Model."
    };
};

module.exports = {
    trainModels,
    predictDocument
};
