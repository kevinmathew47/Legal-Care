import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import ReactMarkdown from "react-markdown";
import {
  FaFileUpload,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";


const genAI = new GoogleGenerativeAI(`${process.env.REACT_APP_GEMINI_API_KEY}`);

const initPDFJS = async () => {
  const pdfjs = await import("pdfjs-dist/webpack");
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  return pdfjs;
};

const DocAnalyser = () => {
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [pdfjs, setPdfjs] = useState(null);

  useEffect(() => {
    initPDFJS().then(setPdfjs).catch(console.error);
  }, []);

  // Function to extract text from PDF
  const extractPDFText = async (arrayBuffer) => {
    if (!pdfjs) {
      throw new Error("PDF.js not initialized");
    }

    try {
      // Convert ArrayBuffer to Uint8Array for pdf.js
      const uint8Array = new Uint8Array(arrayBuffer);

      const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      console.log("Extracted PDF text length:", fullText.length);
      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new Error("Failed to extract text from PDF");
    }
  };

  // Function to extract text from DOCX
  const extractDOCXText = async (arrayBuffer) => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error("DOCX extraction error:", error);
      throw new Error("Failed to extract text from DOCX");
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const extractFileContent = async (file) => {
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      let text = "";

      switch (file.type) {
        case "application/pdf":
          text = await extractPDFText(arrayBuffer);
          break;
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          text = await extractDOCXText(arrayBuffer);
          break;
        case "text/plain":
          text = await readFileAsText(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

      if (!text || text.trim().length === 0) {
        console.warn(
          "No text extracted from file – using fallback description."
        );
        return "No readable text could be extracted from this document. It may be a scanned or image-based legal document. Please give general guidance a legal advisor might offer when only the existence of such a document is known, but not its exact text.";
      }

      return text;
    } catch (error) {
      console.error("Content extraction error:", error);
      throw error;
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileURL(URL.createObjectURL(selectedFile));
      setError(null);
      setAnalysisResult("");
      setExtractedText("");
      
      // Pre-extract text for preview
      try {
        const text = await extractFileContent(selectedFile);
        setExtractedText(text);
      } catch (err) {
        console.error("Text extraction failed for preview:", err);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fileContent = await extractFileContent(file);
      setExtractedText(fileContent);

      const response = await fetch("/_/backend/api/ml/analyze_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentText: fileContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to get analysis from the server.");
      }

      const mlResult = await response.json();
      
      if (!mlResult.isLegal) {
        setAnalysisResult(`**Notice**: We can't help with this document as it is not related to law or does not contain sufficient legal context.`);
        setLoading(false);
        return;
      }
      
      // Document is legal, fetch brief description via Gemini
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction:
          "You are pretending to be a legal advisor. You will provide answers based on Indian law. Do not answer vaguely. Give clear steps on how the user can proceed. Refer to yourself as legal advisor. Only provide the legal side of the queries.",
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });

      const prompt = `As a legal advisor, please analyze the following document content and provide:
1. A brief summary of what the document is about
2. A summary of the key points
3. Any legal implications under Indian law
4. Recommended actions or next steps

Make the content easy to understand for a person with little or no legal knowledge.

Document content:
${fileContent}`;

      const geminiResult = await model.generateContent(prompt);
      const geminiText = geminiResult.response.text();
      
      const formattedResult = `### ML Model Analysis\n\n**Category:** ${mlResult.category} | **Severity Level:** ${mlResult.severity}\n\n---\n\n### AI Legal Advisor Summary\n\n${geminiText}`;
      
      setAnalysisResult(formattedResult);
    } catch (error) {
      console.error("Error analyzing document:", error);
      setError(`Failed to analyze the document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaFileUpload className="text-4xl" />;

    switch (file.type) {
      case "application/pdf":
        return <FaFilePdf className="text-4xl text-red-400" />;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return <FaFileWord className="text-4xl text-blue-400" />;
      case "text/plain":
        return <FaFileAlt className="text-4xl text-slate-400" />;
      default:
        return <FaFileUpload className="text-4xl" />;
    }
  };

  return (
    <div className="min-h-full w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-6 py-2">
              <FaFileAlt className="text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">
                DOCUMENT ANALYSER
              </span>
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-200 mb-4">
            Analyze Your Documents
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload legal documents for AI-powered analysis and insights
          </p>
        </div>

        {/* Upload Form Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 mb-4">
                Upload Document
              </label>

              <div className="relative group">
                <input
                  type="file"
                  name="document"
                  id="document"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                    file
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-slate-700/50 bg-slate-800/30 group-hover:border-purple-500/50 group-hover:bg-purple-500/5"
                  }`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    {getFileIcon()}
                    <div>
                      <p className="text-slate-300 text-lg font-medium mb-1">
                        {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {file
                          ? `${(file.size / 1024).toFixed(2)} KB`
                          : "PDF, DOCX, or TXT (Max 10MB)"}
                      </p>
                    </div>
                    {file && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <FaCheckCircle />
                        <span className="text-sm font-medium">
                          File uploaded successfully
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Analyzing Document...</span>
                </>
              ) : (
                <>
                  <FaFileAlt className="text-xl" />
                  <span>Analyze Document</span>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {fileURL && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Preview */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                  Document Preview
                </h3>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-blue-400 text-xs font-semibold">
                    UPLOADED
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 h-96">
                {file?.type === "application/pdf" ? (
                  <div className="w-full h-full relative">
                    <iframe
                      src={fileURL}
                      className="w-full h-full"
                      title="Uploaded Document"
                    />
                    {/* Fallback info for if the iframe fails to load or if the user wants to see the raw text */}
                    {!extractedText && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm pointer-events-none">
                        <div className="flex flex-col items-center space-y-2">
                          <FaSpinner className="animate-spin text-2xl text-purple-400" />
                          <p className="text-slate-400 text-sm">Loading preview...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 h-full overflow-y-auto font-mono text-sm text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
                    {extractedText ? (
                      <div className="whitespace-pre-wrap">{extractedText}</div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <FaSpinner className="animate-spin text-4xl text-purple-400" />
                        <p className="text-slate-400">Extracting document content...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Results */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                  Analysis Results
                </h3>
                {analysisResult && (
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-400 text-xs font-semibold">
                      COMPLETE
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 h-96 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <FaSpinner className="text-4xl text-purple-400 animate-spin" />
                    <p className="text-slate-400">Analyzing your document...</p>
                    <div className="w-48 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="prose prose-invert prose-slate max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-white text-2xl font-bold mb-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-purple-200 text-xl font-bold mb-3 mt-6"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-purple-300 text-lg font-semibold mb-2 mt-4"
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            className="text-slate-300 mb-3 leading-relaxed"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="text-slate-300 space-y-2 mb-4"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="text-slate-300 space-y-2 mb-4"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="ml-4" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="text-white font-semibold"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {analysisResult}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="text-6xl text-slate-700">📄</div>
                    <p className="text-slate-400">
                      Upload and analyze a document to see results here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocAnalyser;
