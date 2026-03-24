# Legal Care ⚖️

Legal Care is a comprehensive, AI-powered legal assistance platform designed to make legal insights accessible, efficient, and tailored to the ruleset of India. 

## 🚀 Features

- **Legal Chatbot**: Get instant, AI-driven answers to your legal queries based on Indian law.
- **Document Analyser**: Upload and analyze complex legal documents (PDF, DOCX, TXT) to get summaries and next steps.
- **Document Drafter**: (In Development) Tools to help you create professional legal documents with ease.
- **Law Lookup**: Search and find specific legal codes and regulations.
- **Authentication**: Secure user login and signup to persist your legal conversations.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Natural (ML).
- **AI Integration**: Google Gemini AI (Google Generative AI).
- **Deployment**: Configured for seamless hosting on Vercel.

## 📦 Project Structure

```text
├── backend/            # Express server and ML models
├── frontend/           # React application
├── vercel.json         # Vercel deployment configuration
└── README.md           # This file
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed.
- MongoDB Atlas account.
- Google Gemini API Key.

### 1. Backend Setup
1. Navigate to the `backend/` directory.
2. Create a `.env` file with the following:
   ```text
   MONGODB_URI=your_mongodb_atlas_url
   GEMINI_API_KEY=your_gemini_api_key
   PORT=5000
   ```
3. Run `npm install` and then `npm start`.

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Run `npm install` and then `npm start`.
3. The app will be available at `http://localhost:3000`.

## 🌐 Deployment

This project is ready for **Vercel**. 
1. Push this code to your GitHub repository.
2. Connect the repository to Vercel.
3. Add `MONGODB_URI` and `GEMINI_API_KEY` to Vercel's environment variables.

---
Created by [Kevin Mathew](https://github.com/kevinmathew47)
