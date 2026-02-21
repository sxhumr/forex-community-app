import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Message from "../components/message";
import api from "../services/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://forex-community-app.onrender.com");

export default function Home() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const [messages, setMessages] = useState({
    general: [],
    feeds: [],
  });

  const [newMessage, setNewMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState("general");

  // 🔐 Always read fresh token
  const getToken = () => localStorage.getItem("token");

  const token = getToken();

  const currentUserId = (() => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  })();

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* SOCKET SETUP */
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
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      // 🚫 DO NOT clear token automatically
    });

    socket.on("newMessage", (message) => {
      const room = message.room || "general";
      setMessages((prev) => ({
        ...prev,
        [room]: [...prev[room], message],
      }));
    });

    socket.on("messageEdited", ({ _id, text, room, isEdited }) => {
      const targetRoom = room || "general";
      setMessages((prev) => ({
        ...prev,
        [targetRoom]: prev[targetRoom].map((msg) =>
          msg._id === _id ? { ...msg, text, isEdited } : msg
        ),
      }));
    });

    socket.on("messageDeleted", ({ _id, room }) => {
      const targetRoom = room || "general";
      setMessages((prev) => ({
        ...prev,
        [targetRoom]: prev[targetRoom].filter(
          (msg) => msg._id !== _id
        ),
      }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate]);

  /* LOAD MESSAGES */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedToken = getToken();
        if (!storedToken) return;

        const { data } = await api.get(`/messages?room=${activeRoom}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

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
    if (!newMessage.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
    });

    setNewMessage("");
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
          <h2 className="text-[#80f7c7] text-sm tracking-[0.25em]">
            CR MATRIX
          </h2>
          <p className="text-xs text-green-200/60 mt-2">
            Secure Trading Signal Hub
          </p>
        </div>

        <div className="flex-1 p-4 space-y-3 text-sm">
          <button
            onClick={() => setActiveRoom("general")}
            className={`w-full text-left px-3 py-2 rounded-md border ${
              activeRoom === "general"
                ? "border-[#80f7c7]/40 bg-[#1b2030] text-green-100"
                : "border-transparent text-green-100/70 hover:text-green-100"
            }`}
          >
            # general
          </button>

          <button
            onClick={() => setActiveRoom("feeds")}
            className={`w-full text-left px-3 py-2 rounded-md border ${
              activeRoom === "feeds"
                ? "border-[#80f7c7]/40 bg-[#1b2030] text-green-100"
                : "border-transparent text-green-100/70 hover:text-green-100"
            }`}
          >
            # live-market-feeds
          </button>
        </div>

        <div className="p-4 border-t border-white/10">
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
        <div className="border-b border-white/10 bg-[#0d1320] p-4 text-sm flex items-center justify-between">
          <span className="text-green-100">
            {activeRoom === "general"
              ? "# general"
              : "# live-market-feeds"}
          </span>

          <span className="text-xs text-green-100/50">
            {messages[activeRoom].length} messages
          </span>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-[#111827] to-[#0c1422]">
          {messages[activeRoom].map((msg) => {
            const isOwn =
              String(msg.user || "") === String(currentUserId || "");

            return (
              <div key={msg._id} className="group">
                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className="w-full max-w-[85%]">
                    <Message
                      user={msg.username || "User"}
                      role={msg.role}
                      text={msg.text}
                      media={msg.media}
                      isOwn={isOwn}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-[#0d1320] p-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={`Message ${
                activeRoom === "general"
                  ? "#general"
                  : "#live-market-feeds"
              }`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#101829] border border-white/15 rounded-md px-4 py-2 text-green-100 outline-none focus:border-[#80f7c7]/50"
            />

            <button
              onClick={handleSend}
              className="px-5 py-2 bg-purple-500/90 text-white rounded-md hover:bg-purple-400 transition font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}