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

  const getToken = () => localStorage.getItem("token");
  const token = getToken();

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

  const userInfo = (() => {
    try {
      if (!token) return null;
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  })();

  const currentUserId = userInfo?.userId || null;
  const currentUsername = userInfo?.username || "";
  const isAdmin = userInfo?.role === "admin";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* ============================================================
     EFFECT 1: SOCKET INITIALIZATION (Runs once)
     ============================================================ */
  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      navigate("/login");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: storedToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Socket Server");
      // Re-join active room on reconnection (prevents losing stream after signal drop)
      socket.emit("joinRoom", activeRoom);
    });

    socket.on("newMessage", (message) => {
      const room = message.room || "general-chat";
      setMessages((prev) => ({
        ...prev,
        [room]: [...(prev[room] || []), message],
      }));
    });

    socket.on("messageEdited", ({ _id, text, room, isEdited }) => {
      setMessages((prev) => ({
        ...prev,
        [room]: prev[room].map((msg) =>
          msg._id === _id ? { ...msg, text, isEdited } : msg
        ),
      }));
    });

    socket.on("messageDeleted", ({ _id, room }) => {
      setMessages((prev) => ({
        ...prev,
        [room]: prev[room].filter((msg) => msg._id !== _id),
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); 
  // Note: activeRoom is excluded here intentionally because we handle 
  // room switching in the effect below to avoid socket reconnections.

  /* ============================================================
     EFFECT 2: ROOM SWITCHING (Runs on activeRoom change)
     ============================================================ */
  useEffect(() => {
    // 1. Inform the socket server of the room change
    if (socketRef.current?.connected) {
      socketRef.current.emit("joinRoom", activeRoom);
    }

    // 2. Fetch history for the new room
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages?room=${activeRoom}`);
        setMessages((prev) => ({
          ...prev,
          [activeRoom]: data,
        }));
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
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
    localStorage.clear();
    socketRef.current?.disconnect();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-[#05080f] text-green-200 font-mono">
      {/* SIDEBAR */}
      <div className="w-72 flex flex-col bg-[#101521] border-r border-white/10">
        <div className="p-5 border-b border-[#00ff9c]/20">
          <h2 className="text-[#80f7c7] text-sm tracking-[0.25em]">CR MATRIX</h2>
        </div>

        <div className="flex-1 p-4 space-y-2 text-sm">
          {[
            { id: "general-chat", label: "general-chat 💬" },
            { id: "market-analysis", label: "market-analysis" },
            { id: "private-team-updates", label: "private-team-updates 🔒" },
            { id: "live-signals", label: "live-signals 📉" },
            { id: "one-on-one-request", label: "one-on-one-request" },
            { id: "full-trading-course", label: "full-trading-course 📖" },
          ].map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeRoom === room.id
                  ? "bg-[#1b2030] text-green-100 shadow-[0_0_10px_rgba(128,247,199,0.1)]"
                  : "text-green-100/70 hover:text-green-100 hover:bg-[#1b2030]/50"
              }`}
            >
              # {room.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 px-3 py-2 bg-[#0d1320] rounded border border-white/5">
            <p className="text-[10px] text-green-100/40 uppercase">Identified as</p>
            <p className="text-xs text-[#80f7c7] truncate">{currentUsername}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-[#0d1320] p-4 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-100 font-bold uppercase tracking-widest">
              {activeRoom.replace("-", " ")}
            </span>
          </div>
          <span className="text-xs text-green-100/50">
            {messages[activeRoom]?.length || 0} signals/messages
          </span>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRoom === "market-analysis" && <MarketFeed />}

          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-[#111827] to-[#0c1422]">
            {(messages[activeRoom] || []).map((msg) => (
              <Message
                key={msg._id}
                user={msg.username || "User"}
                role={msg.role}
                text={msg.text}
                media={msg.media}
                isOwn={String(msg.user || "") === String(currentUserId || "")}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0d1320] p-4">
          <div className="flex gap-3 items-center max-w-6xl mx-auto">
            {isAdmin && (
              <label className="cursor-pointer bg-[#1b2030] px-3 py-2 rounded-md text-green-200 hover:bg-[#222b40] border border-white/10 transition-colors">
                📎
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e.target.files[0])}
                />
              </label>
            )}

            <input
              type="text"
              placeholder={`Broadcast to #${activeRoom}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#101829] border border-white/15 rounded-md px-4 py-2 text-green-100 outline-none focus:border-[#80f7c7]/50 placeholder:text-white/20"
            />

            <button
              onClick={handleSend}
              className="px-6 py-2 bg-[#6366f1] text-white rounded-md hover:bg-[#4f46e5] font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}