import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaSpinner, FaUser, FaDatabase, FaCloudSun, FaChartLine, FaBookOpen } from "react-icons/fa";
import { sendChatMessage } from "../../services/aiService";
import type { ChatMessage } from "../../services/aiService";

export default function AIChatbotWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👋 Namaste! I am your **Raitha Mithra AI Assistant**. Ask me about farm profits, spraying schedules, APMC market price comparisons, PM-KISAN & government schemes, or pest treatments!",
      source: "AI System"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "Puttur vs Shivamogga arecanut price?",
    "Can I spray pesticide today?",
    "How much income & profit did I make?",
    "Tell me about PM-KISAN & KCC",
    "How to treat Kole Roga in Arecanut?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const query = questionText || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!questionText) setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(query, updatedMessages);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: res.answer, source: res.source }
      ]);
    } catch (err) {
      console.error("Error sending chat message:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Sorry, I could not process your query right now. Please try again.", source: "AI System" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSourceBadge = (source?: string) => {
    if (!source) return null;

    let icon = <FaRobot className="text-emerald-600" />;
    let colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200";

    if (source.includes("Database")) {
      icon = <FaDatabase className="text-blue-600" />;
      colorClass = "bg-blue-50 text-blue-800 border-blue-200";
    } else if (source.includes("Weather")) {
      icon = <FaCloudSun className="text-sky-600" />;
      colorClass = "bg-sky-50 text-sky-800 border-sky-200";
    } else if (source.includes("CEDA") || source.includes("Market")) {
      icon = <FaChartLine className="text-amber-600" />;
      colorClass = "bg-amber-50 text-amber-800 border-amber-200";
    } else if (source.includes("Knowledge")) {
      icon = <FaBookOpen className="text-purple-600" />;
      colorClass = "bg-purple-50 text-purple-800 border-purple-200";
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1.5 ${colorClass}`}>
        {icon}
        <span>Source: {source}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col h-[520px] overflow-hidden">
      {/* Widget Header */}
      <div className="bg-gradient-to-r from-green-800 to-emerald-700 text-white p-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
            <FaRobot />
          </div>
          <div>
            <h3 className="font-bold text-base">🤖 Raitha Mithra AI Assistant</h3>
            <p className="text-xs text-green-200">Powered by Database, Weather & CEDA Market APIs</p>
          </div>
        </div>
        <span className="bg-green-600/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Online
        </span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="bg-white hover:bg-green-50 text-green-800 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition"
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/30">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                msg.role === "user" ? "bg-green-700" : "bg-emerald-600"
              }`}
            >
              {msg.role === "user" ? <FaUser /> : <FaRobot />}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-green-700 text-white rounded-tr-none shadow-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm"
              }`}
            >
              {msg.role === "assistant" && renderSourceBadge(msg.source)}
              <div className="whitespace-pre-line">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-green-600 text-xs font-semibold p-2">
            <FaSpinner className="animate-spin text-base" />
            <span>Consulting database, weather & market APIs...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-gray-100 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask in English or Kannada (e.g. Puttur APMC Arecanut price?)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition flex items-center justify-center gap-2 shadow"
        >
          <FaPaperPlane className="text-xs" />
        </button>
      </form>
    </div>
  );
}
