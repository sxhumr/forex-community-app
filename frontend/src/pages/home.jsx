import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Message from "../components/message";
import api from "../services/api";
import MarketFeed from "../components/marketFeed";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://forex-community-app.onrender.com");

export default function Home() {
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const [activeRoom, setActiveRoom] = useState("general-chat");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState({
    "general-chat": [],
    "market-analysis": [],
    "private-team-updates": [],
    "live-signals": [],
    "one-on-one-request": [],
    "full-trading-course": [],
  });

  // Robust JWT Decoder to extract username and role
  const userInfo = (() => {
    try {
      if (!token) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch {

      return null;
    }
  })();

  const currentUserId = userInfo?.userId || null;
  const currentUsername = userInfo?.username || "Guest User";
  const isAdmin = userInfo?.role === "admin";

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* ============================================================
      EFFECT 1: SOCKET INITIALIZATION
     ============================================================ */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Matrix Socket");
      socket.emit("joinRoom", activeRoom);
    });

    socket.on("newMessage", (message) => {
      const room = message.room || "general-chat";
      setMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), message],
      }));
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Auth Error:", err.message);
      if (err.message === "Authentication error") navigate("/login");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  /* ============================================================
      EFFECT 2: ROOM SWITCHING & HISTORY FETCHING
     ============================================================ */
  useEffect(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("joinRoom", activeRoom);
    }

    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/messages?room=${activeRoom}`);
        setMessages((prev) => ({
          ...prev,
          [activeRoom]: data,
        }));
      } catch (err) {
        console.error("History fetch failed:", err);
      }
    };

    loadHistory();
  }, [activeRoom]);

  const handleSend = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    
    socketRef.current.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
    });
    setNewMessage("");
  };

  const handleMediaUpload = (file) => {
    if (!file || !socketRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      socketRef.current.emit("sendMessage", {
        room: activeRoom,
        media: {
          type: file.type.startsWith("video") ? "video" : "image",
          mimeType: file.type,
          dataUrl: reader.result,
          fileName: file.name,
          size: file.size,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    socketRef.current?.disconnect();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-[#05080f] text-green-200 font-mono overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-72 flex flex-col bg-[#101521] border-r border-white/10 shrink-0">
        <div className="p-6 border-b border-[#00ff9c]/20">
          <h2 className="text-[#00ff9c] text-lg font-bold tracking-widest">CR MATRIX</h2>
          <p className="text-[10px] text-white/30 uppercase mt-1">Terminal v3.0.1</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: "general-chat", label: "GENERAL CHAT", icon: "💬" },
            { id: "market-analysis", label: "MARKET ANALYSIS", icon: "📊" },
            { id: "live-signals", label: "LIVE SIGNALS", icon: "📉" },
            { id: "private-team-updates", label: "TEAM UPDATES", icon: "🔒" },
            { id: "one-on-one-request", label: "CONSULTATION", icon: "🤝" },
            { id: "full-trading-course", label: "TRADING COURSE", icon: "📖" },
          ].map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeRoom === room.id
                  ? "bg-[#00ff9c]/10 text-[#00ff9c] border border-[#00ff9c]/20 shadow-[0_0_15px_rgba(0,255,156,0.1)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{room.icon}</span>
              <span className="text-xs font-bold tracking-tighter">{room.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 bg-[#0a0f1a] border-t border-white/5">
          <div className="mb-4 px-4 py-3 bg-black/40 rounded-lg border border-white/5">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`}></div>
               <p className="text-xs text-[#00ff9c] font-bold truncate uppercase">{currentUsername}</p>
            </div>
            {isAdmin && <p className="text-[8px] text-red-400 mt-1">SYSTEM ADMINISTRATOR</p>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-xs text-red-500/70 hover:text-red-400 font-bold border border-red-500/20 rounded hover:bg-red-500/5 transition-all"
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/10 bg-[#0d1320] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            <h1 className="text-white font-bold text-sm tracking-widest uppercase italic">
              // {activeRoom.replace("-", " ")}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] text-white/20 font-mono">ENCRYPTION: AES-256</span>
             <div className="h-4 w-[1px] bg-white/10"></div>
             <span className="text-[10px] text-green-500/70 font-mono uppercase">{messages[activeRoom]?.length || 0} Packets</span>
          </div>
        </header>

        {/* FEED CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#05080f]">
          {activeRoom === "market-analysis" && <MarketFeed />}

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages[activeRoom]?.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-20 flex-col">
                <p className="text-xs tracking-[0.5em]">NO DATA RECEIVED</p>
              </div>
            ) : (
              messages[activeRoom].map((msg) => (
                <Message
                  key={msg._id}
                  user={msg.username}
                  role={msg.role}
                  text={msg.text}
                  media={msg.media}
                  isOwn={String(msg.user) === String(currentUserId)}
                  timestamp={msg.createdAt}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* INPUT AREA */}
        <footer className="p-4 bg-[#0d1320] border-t border-white/10">
          <div className="max-w-5xl mx-auto flex gap-3 items-center">
            {isAdmin && (
              <label className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
                <span className="text-xl">+</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e.target.files[0])}
                />
              </label>
            )}

            <div className="flex-1 relative">
               <input
                type="text"
                placeholder={`Type command for #${activeRoom}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-[#00ff9c]/40 transition-all placeholder:text-white/10"
              />
            </div>

            <button
              onClick={handleSend}
              className="px-8 py-4 bg-[#00ff9c] text-black font-black text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,156,0.3)]"
            >
              EXECUTE
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}