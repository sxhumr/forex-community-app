import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Message from "../components/message";

const socket = io("http://localhost:5000", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export default function Home() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* SOCKET LISTENERS */
  useEffect(() => {
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);

      // Token invalid / expired
      if (err.message.includes("Authentication")) {
        localStorage.clear();
        navigate("/login");
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("connect_error");
    };
  }, [navigate]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    // ✅ Send ONLY the text
    socket.emit("sendMessage", {
      text: newMessage.trim(),
    });

    setNewMessage("");
  };

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-black text-green-400 font-mono">

      {/* SIDEBAR */}
      <div className="w-64 flex flex-col bg-[#050f0a] border-r border-[#00ff9c]/20">
        <div className="p-4 border-b border-[#00ff9c]/20">
          <h2 className="text-[#00ff9c] text-sm tracking-widest">
            CR MATRIX
          </h2>
          <p className="text-xs text-green-400/60 mt-1">
            Forex Command Room
          </p>
        </div>

        <div className="flex-1 p-4 space-y-2 text-sm">
          <p className="text-green-400/90 cursor-pointer"># general</p>
          <p className="text-green-400/60 cursor-pointer"># signals</p>
          <p className="text-green-400/60 cursor-pointer"># announcements</p>
        </div>

        <div className="p-4 border-t border-[#00ff9c]/20">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-[#00ff9c]/20 p-4 text-sm">
          # general
        </div>

        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <Message
              key={index}
              user={msg.username}
              role={msg.role}
              text={msg.text}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#00ff9c]/20 p-4 flex gap-3">
          <input
            type="text"
            placeholder="Message #general"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-black border border-[#00ff9c]/30 rounded-md px-4 py-2 text-green-400 outline-none focus:border-[#00ff9c]"
          />

          <button
            onClick={handleSend}
            className="px-5 py-2 bg-[#00ff9c]/90 text-black rounded-md hover:bg-[#00ff9c] transition font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
