import { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaSpinner, FaUser, FaLightbulb } from "react-icons/fa";
import { sendChatMessage } from "../../services/aiService";
import type { ChatMessage } from "../../services/aiService";

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "🌾 **Namaste! I am Raitha Mithra AI**, your intelligent decision support assistant. I can answer all queries regarding your crops, weather alerts, spraying safety, market predictions, and farm profits!"
    }
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    "Can I spray tomorrow?",
    "Should I sell my arecanut?",
    "What is today's market price?",
    "Will it rain tomorrow?",
    "How much profit did I make?"
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
      setMessages([...updatedMessages, { role: "assistant", content: res.answer }]);
    } catch (err) {
      console.error("Error sending chat message:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "⚠️ Sorry, I could not process your request. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl text-white p-8 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <FaRobot /> Raitha Mithra AI Assistant
          </h1>
          <p className="text-green-100 mt-1">Smart Agriculture Decision Support Engine (Powered by OpenAI & Live Farm Data)</p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col h-[600px] overflow-hidden">
        {/* Chips */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1 shrink-0">
            <FaLightbulb className="text-amber-500" /> Suggested Queries:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="bg-white hover:bg-green-50 text-green-800 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shadow-sm transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/20">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm shrink-0 ${
                  msg.role === "user" ? "bg-green-700" : "bg-emerald-600"
                }`}
              >
                {msg.role === "user" ? <FaUser /> : <FaRobot />}
              </div>

              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-green-700 text-white rounded-tr-none shadow"
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold p-2">
              <FaSpinner className="animate-spin text-lg" />
              <span>Gathering farm metrics, weather forecast & price predictions...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white border-t border-gray-100 flex gap-3"
        >
          <input
            type="text"
            placeholder="Type your question here (e.g. Will it rain tomorrow?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
          >
            <FaPaperPlane /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
