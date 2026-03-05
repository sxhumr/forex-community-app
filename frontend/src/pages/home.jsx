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

  /* -------------------------------
     Decode token for user identity
  --------------------------------*/
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

  const isRobert = currentUsername === "robert";

  /* -------------------------------
     Auto scroll
  --------------------------------*/
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* -------------------------------
     Socket Connection
  --------------------------------*/
  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      navigate("/login");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: storedToken },
      transports: ["polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

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
  }, [navigate]);

  /* -------------------------------
     Load messages when room changes
  --------------------------------*/
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

  /* -------------------------------
     Send message
  --------------------------------*/
  const handleSend = () => {
    if (!newMessage.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
    });

    setNewMessage("");
  };

  /* -------------------------------
     Media Upload (Robert Only)
  --------------------------------*/
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

  /* -------------------------------
     Logout
  --------------------------------*/
  const handleLogout = () => {
    localStorage.clear();
    socketRef.current?.disconnect();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-[#05080f] text-green-200 font-mono">

      {/* =======================
          SIDEBAR
      ======================= */}
      <div className="w-72 flex flex-col bg-[#101521] border-r border-white/10">

        <div className="p-5 border-b border-[#00ff9c]/20">
          <h2 className="text-[#80f7c7] text-sm tracking-[0.25em]">
            CR MATRIX
          </h2>
        </div>

        <div className="flex-1 p-4 space-y-2 text-sm">

          <button
            onClick={() => setActiveRoom("general-chat")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "general-chat"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # general-chat 💬
          </button>

          <button
            onClick={() => setActiveRoom("market-analysis")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "market-analysis"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # market-analysis
          </button>

          <button
            onClick={() => setActiveRoom("private-team-updates")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "private-team-updates"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # private-team-updates 🔒
          </button>

          <button
            onClick={() => setActiveRoom("live-signals")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "live-signals"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # live-signals 📉
          </button>

          <button
            onClick={() => setActiveRoom("one-on-one-request")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "one-on-one-request"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # one-on-one-request
          </button>

          <button
            onClick={() => setActiveRoom("full-trading-course")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeRoom === "full-trading-course"
                ? "bg-[#1b2030] text-green-100"
                : "text-green-100/70 hover:text-green-100"
            }`}
          >
            # full-trading-course 📖
          </button>

        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>

      </div>

      {/* =======================
          CHAT AREA
      ======================= */}
      <div className="flex-1 flex flex-col">

        <div className="border-b border-white/10 bg-[#0d1320] p-4 text-sm flex items-center justify-between">
          <span className="text-green-100"># {activeRoom}</span>
          <span className="text-xs text-green-100/50">
            {messages[activeRoom]?.length || 0} messages
          </span>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">

          {activeRoom === "market-analysis" && <MarketFeed />}

          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-[#111827] to-[#0c1422]">

            {(messages[activeRoom] || []).map((msg) => {
              const isOwn =
                String(msg.user || "") === String(currentUserId || "");

              return (
                <div key={msg._id}>
                  <Message
                    user={msg.username || "User"}
                    role={msg.role}
                    text={msg.text}
                    media={msg.media}
                    isOwn={isOwn}
                  />
                </div>
              );
            })}

            <div ref={messagesEndRef} />

          </div>
        </div>

        {/* =======================
            INPUT AREA
        ======================= */}
        <div className="border-t border-white/10 bg-[#0d1320] p-4">
          <div className="flex gap-3 items-center">

            {isRobert && (
              <label className="cursor-pointer bg-[#1b2030] px-3 py-2 rounded-md text-green-200 hover:bg-[#222b40]">
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
              placeholder={`Message #${activeRoom}`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-[#101829] border border-white/15 rounded-md px-4 py-2 text-green-100 outline-none focus:border-[#80f7c7]/50"
            />

            <button
              onClick={handleSend}
              className="px-5 py-2 bg-purple-500/90 text-white rounded-md hover:bg-purple-400"
            >
              Send
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}