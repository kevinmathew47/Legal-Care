import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import html2pdf from "html2pdf.js";
import ReactMarkdown from "react-markdown";
import Will from "../components/Will";
import Lease from "../components/Lease";
import Divorce from "../components/Divorce";
import Nda from "../components/Nda";
import Partnership from "../components/Partnership";
import "react-toastify/dist/ReactToastify.css";
import { FaArrowLeft, FaFileAlt, FaFilePdf } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { marked } from "marked";

const DocDrafter = () => {
  const [clicked, setClicked] = useState(false);
  const [page, setPage] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [response, setResponse] = useState("");
  const [textAreaValue, setTextAreaValue] = useState("");

  // GEMINI SECTION
  const genAI = new GoogleGenerativeAI(`${process.env.REACT_APP_GEMINI_API_KEY}`);
  
  const sendToGemini = async (message) => {
    try {
      const model = genAI.getGenerativeModel({
        model: "tunedModels/docdrafterfinal-75a25zggnf0h",
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      });
      const chat = model.startChat({
        history: [],
        generationConfig: { temperature: 0.9 },
      });
      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const fixMarkdown = async (message) => {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: .7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      });
      const chat = model.startChat({
        history: [],
        generationConfig: { temperature: 0.9 },
      });
      const prompt = `Convert the following text to markdown format. Use Titles and whatever necessary: \n\n${message}`;
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  };

  const Submit = async (message) => {
    toast.info("Generating document...");
    try {
      const result = await sendToGemini(message);
      const res = await fixMarkdown(result);
      setResponse(res);
      console.log(res);
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };

  // PDF SECTION
  useEffect(() => {
    if (response) {
      setTextAreaValue(response);
      toast.success("Document generated successfully!");
    }
  }, [response]);

  const handleTextAreaChange = (e) => {
    setTextAreaValue(e.target.value);
  };

  const generatePDF = () => {
    const element = document.createElement("div");
    document.body.appendChild(element);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        ${marked.parse(textAreaValue)}
      </div>
    `;
    element.innerHTML = htmlContent;

    const opt = {
      margin: 10,
      filename: `${page || "document"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        toast.error("Failed to generate PDF.");
        document.body.removeChild(element);
      });
  };

  const onButtonClick = (documentName) => {
    setClicked(true);
    setPage(documentName);
  };

  const documents = [
    {
      name: "Divorce",
      title: "Divorce Agreement",
      description: "Comprehensive divorce settlement document",
      icon: "⚖️",
      gradient: "from-red-500/10 to-pink-500/10",
      border: "border-red-500/30",
      hoverBorder: "hover:border-red-500/50"
    },
    {
      name: "Will",
      title: "Last Will & Testament",
      description: "Estate planning and asset distribution",
      icon: "📜",
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-500/30",
      hoverBorder: "hover:border-blue-500/50"
    },
    {
      name: "Lease",
      title: "Lease Agreement",
      description: "Property rental contract and terms",
      icon: "🏠",
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-500/30",
      hoverBorder: "hover:border-green-500/50"
    },
    {
      name: "Nda",
      title: "Non-Disclosure Agreement",
      description: "Confidentiality and privacy protection",
      icon: "🔒",
      gradient: "from-purple-500/10 to-violet-500/10",
      border: "border-purple-500/30",
      hoverBorder: "hover:border-purple-500/50"
    },
    {
      name: "Partnership",
      title: "Partnership Deed",
      description: "Business partnership agreement",
      icon: "🤝",
      gradient: "from-indigo-500/10 to-blue-500/10",
      border: "border-indigo-500/30",
      hoverBorder: "hover:border-indigo-500/50"
    }
  ];

  return (
    <div className="min-h-full w-full py-8 px-4">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="dark"
      />
      
      {!clicked && (
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full px-6 py-2">
                <FaFileAlt className="text-blue-400" />
                <span className="text-blue-400 text-sm font-semibold">DOCUMENT DRAFTER</span>
              </div>
            </div>
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 mb-4">
              Choose Your Document
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Select a document type to start drafting professional legal documents with AI assistance
            </p>
          </div>

          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <button
                key={index}
                onClick={() => onButtonClick(doc.name)}
                className={`group relative backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border ${doc.border} ${doc.hoverBorder} rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20`}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {doc.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all duration-300">
                  {doc.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-400 text-sm mb-4">
                  {doc.description}
                </p>

                {/* Hover indicator */}
                <div className="flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Start Drafting</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${doc.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document Form Section */}
      {clicked && (
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => {
              setClicked(false);
              setResponse("");
            }}
            className="group flex items-center space-x-2 mb-8 px-6 py-3 bg-slate-800/50 text-slate-300 font-semibold rounded-xl border border-slate-700/50 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 transition-all duration-300"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back to Documents</span>
          </button>

          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            {page === "Will" && (
              <Will
                setSystemInstruction={setSystemInstruction}
                sendToGemini={Submit}
              />
            )}
            {page === "Divorce" && (
              <Divorce
                setSystemInstruction={setSystemInstruction}
                sendToGemini={Submit}
              />
            )}
            {page === "Lease" && (
              <Lease
                setSystemInstruction={setSystemInstruction}
                sendToGemini={Submit}
              />
            )}
            {page === "Nda" && (
              <Nda
                setSystemInstruction={setSystemInstruction}
                sendToGemini={Submit}
              />
            )}
            {page === "Partnership" && (
              <Partnership
                setSystemInstruction={setSystemInstruction}
                sendToGemini={Submit}
              />
            )}
          </div>
        </div>
      )}

      {/* Generated Document Section */}
      {response && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 mb-2">
                  Generated Document
                </h2>
                <p className="text-slate-400 text-sm">
                  Review and edit your document before downloading
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">READY</span>
              </div>
            </div>

            <textarea
              value={textAreaValue}
              onChange={handleTextAreaChange}
              className="w-full h-96 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Edit the document here if needed..."
            />

            <div className="mt-6 flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                <span className="text-slate-300 font-semibold">{textAreaValue.length}</span> characters
              </p>
              <button
                onClick={generatePDF}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <FaFilePdf className="text-xl" />
                <span>Generate PDF</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocDrafter;