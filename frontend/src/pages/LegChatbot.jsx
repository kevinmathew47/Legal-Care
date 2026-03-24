import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane, FaTrash, FaRobot, FaUser, FaSpinner } from "react-icons/fa";

// 🔹 New helper: call your backend AI endpoint instead of Gemini directly
const sendToBackend = async (message) => {
  try {
    const response = await axios.post("/api/vertex", {
      message,
    });
    // backend returns: { content: "..." }
    return response.data.content;
  } catch (error) {
    console.error(
      "Backend AI Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get response from legal advisor");
  }
};

const LegChatbot = () => {
  const userId = window.localStorage.getItem("USER") || "default-user";
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const saveMessagesToBackend = async (updatedMessages) => {
    try {
      const response = await axios.post(
        `/api/conversations/${userId}`,
        {
          messages: updatedMessages,
        }
      );
      console.log("Messages saved:", response.data);
    } catch (error) {
      console.error(
        "Failed to save messages:",
        error.response?.data || error.message
      );
      setError("Failed to save conversation");
    }
  };

  const clearChat = async () => {
    setIsLoading(true);
    try {
      await axios.post(
        `/api/conversations/${userId}/clear`
      );
      setMessages([]);
      setError(null);
      console.log("Chat cleared successfully");
    } catch (error) {
      console.error(
        "Error clearing chat:",
        error.response?.data || error.message
      );
      setError("Failed to clear chat");
    }
    setIsLoading(false);
  };

  const getUserChat = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/conversations/${userId}`
      );
      console.log("Fetched messages:", response.data);
      const fetchedMessages = Array.isArray(response.data)
        ? response.data
        : [];
      setMessages(fetchedMessages);
      setError(null);
    } catch (error) {
      console.error(
        "Error fetching chat:",
        error.response?.data || error.message
      );
      setError("Failed to load previous messages");
      setMessages([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getUserChat();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setInputMessage("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 🔹 Call backend AI instead of sendToGemini
      const response = await sendToBackend(userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage];
        saveMessagesToBackend(updatedMessages);
        return updatedMessages;
      });
    } catch (error) {
      console.error("Send message error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not get a response. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
      setError("Failed to get response from legal advisor");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-full w-full py-8 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-block mb-3">
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-6 py-2">
              <FaRobot className="text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">
                LEGAL CHATBOT
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200 mb-2">
            Legal Advisor Chat
          </h1>
          <p className="text-slate-400 text-sm">
            Ask any legal questions and get expert guidance based on Indian law
          </p>
        </div>

        {/* Chat Container */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/30">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <FaRobot className="text-5xl text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Start a Conversation
                  </h3>
                  <p className="text-slate-400 max-w-md">
                    Ask me anything about Indian law, legal procedures, or get
                    advice on legal matters
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                  {[
                    "What are tenant rights in India?",
                    "How to file a consumer complaint?",
                    "What is the process for divorce?",
                    "How to register a company?",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 text-sm hover:bg-slate-700/50 hover:border-emerald-500/30 hover:text-white transition-all duration-300 text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                      : "bg-gradient-to-br from-emerald-500 to-teal-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <FaUser className="text-white text-lg" />
                  ) : (
                    <FaRobot className="text-white text-lg" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 ${
                    message.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <div
                    className={`max-w-3xl ${
                      message.role === "user" ? "text-right" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`text-sm font-semibold ${
                          message.role === "user"
                            ? "text-blue-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {message.role === "user" ? "You" : "Legal Advisor"}
                      </span>
                    </div>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30"
                          : "bg-slate-800/50 border border-slate-700/50"
                      }`}
                    >
                      <div
                        className={`prose prose-invert prose-slate max-w-none ${
                          message.role === "user" ? "text-slate-200" : ""
                        }`}
                      >
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-white text-xl font-bold mb-3"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-emerald-200 text-lg font-bold mb-2 mt-4"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-emerald-300 text-base font-semibold mb-2 mt-3"
                                {...props}
                              />
                            ),
                            p: ({ node, ...props }) => (
                              <p
                                className="text-slate-300 mb-2 leading-relaxed text-sm"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="text-slate-300 space-y-1 mb-3 text-sm"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="text-slate-300 space-y-1 mb-3 text-sm"
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
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-slate-900/50 px-1 py-0.5 rounded text-emerald-400"
                                {...props}
                              />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <FaRobot className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-semibold text-emerald-400">
                      Legal Advisor
                    </span>
                  </div>
                  <div className="rounded-2xl p-4 bg-slate-800/50 border border-slate-700/50 max-w-xs">
                    <div className="flex items-center space-x-3">
                      <FaSpinner className="animate-spin text-emerald-400" />
                      <span className="text-slate-400 text-sm">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700/50 p-4 bg-slate-900/50">
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your legal question..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-6 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
              >
                <FaPaperPlane className="text-sm" />
                <span className="hidden sm:inline">Send</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </button>
              <button
                type="button"
                onClick={clearChat}
                disabled={isLoading}
                className="group relative px-6 py-3 bg-slate-800/50 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
              >
                <FaTrash className="text-sm" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegChatbot;
