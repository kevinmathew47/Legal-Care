import React from "react";

const Home = () => {
  return (
    <div className="min-h-full flex items-center justify-center w-full py-12 px-4">
      <div className="max-w-5xl w-full">
        {/* Main Welcome Card */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-slate-700/50 shadow-2xl rounded-3xl p-12 text-center transition-all hover:scale-[1.01] duration-300 ease-in-out relative overflow-hidden">
          {/* Accent gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          {/* Decorative blur circles */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            

            <h1 className="text-6xl font-extrabold mb-6 text-white drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200">
              Welcome to Legal Care!
            </h1>

            <p className="text-lg text-slate-300 font-light leading-relaxed mb-8 max-w-3xl mx-auto">
              Empowering you with the legal insights you need, right at your
              fingertips. Whether you're drafting contracts, analyzing
              documents, or seeking quick answers to legal questions, we're here
              to make the law accessible, efficient, and tailored to you.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: "Document Drafter",
              description: "Create professional legal documents with ease",
              icon: "📝",
              gradient: "from-blue-500/10 to-blue-600/10",
              border: "border-blue-500/20",
            },
            {
              title: "Document Analyser",
              description: "Analyze and understand complex legal documents",
              icon: "🔍",
              gradient: "from-indigo-500/10 to-indigo-600/10",
              border: "border-indigo-500/20",
            },
            {
              title: "Legal Chatbot",
              description: "Get instant answers to your legal questions",
              icon: "💬",
              gradient: "from-purple-500/10 to-purple-600/10",
              border: "border-purple-500/20",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border ${feature.border} rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <div
                className={`text-4xl mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 border border-slate-700/30 rounded-2xl p-8 mt-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { number: "10K+", label: "Documents Created" },
              { number: "5K+", label: "Active Users" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
