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

  const [messages, setMessages] = useState({
    "general-chat": [],
    "market-analysis": [],
    "private-team-updates": [],
    "live-signals": [],
    "one-on-one-request": [],
    "full-trading-course": [],
  });

  const [newMessage, setNewMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState("general-chat");

  const token = localStorage.getItem("token");

  /* GET USER ID */
  const getUserId = () => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* SOCKET */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["polling"], // Render-safe
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 Socket connected");
    });

    socket.on("newMessage", (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.room]: [...(prev[message.room] || []), message],
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
  }, [navigate, token]);

  /* LOAD MESSAGES */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages?room=${activeRoom}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setMessages((prev) => ({
          ...prev,
          [activeRoom]: data,
        }));
      } catch (err) {
        console.error("❌ Failed to load messages", err);
      }
    };

    loadMessages();
  }, [activeRoom, token]);

  /* SEND MESSAGE */
  const handleSend = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      text: newMessage,
      room: activeRoom,
    });

    setNewMessage("");
  };

  /* DELETE MESSAGE */
  const deleteMessage = (id) => {
    socketRef.current.emit("deleteMessage", { id });
  };

  /* IMAGE UPLOAD */
  const handleImageUpload = (file) => {
    if (!file || !socketRef.current) return;

    console.log("📷 Uploading:", file.name);

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only JPG and PNG allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Max file size is 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      socketRef.current.emit("sendMessage", {
        room: activeRoom,
        media: {
          mimeType: file.type,
          dataUrl: reader.result,
          size: file.size,
        },
      });
    };

    reader.readAsDataURL(file);
  };

  const rooms = Object.keys(messages);

  return (
    <div className="h-screen flex flex-col bg-[#05080f] text-green-200">

      {/* ROOM SWITCHER */}
      <div className="flex gap-2 p-2 border-b border-white/10 overflow-x-auto">
        {rooms.map((room) => (
          <button
            key={room}
            onClick={() => setActiveRoom(room)}
            className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
              activeRoom === room
                ? "bg-purple-500 text-white"
                : "bg-[#1b2030]"
            }`}
          >
            {room.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      {/* MARKET FEED */}
      {activeRoom === "market-analysis" && <MarketFeed />}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages[activeRoom]?.map((msg) => (
          <Message
            key={msg._id}
            id={msg._id}
            user={msg.username}
            text={msg.text}
            media={msg.media}
            isOwn={msg.user === getUserId()}
            onDelete={deleteMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t border-white/10 flex gap-2 items-end">

        {/* IMAGE UPLOAD */}
        <label className="cursor-pointer bg-[#1b2030] px-3 py-2 rounded-md">
          📷
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              handleImageUpload(e.target.files[0]);
              e.target.value = ""; // 🔥 important fix
            }}
          />
        </label>

        {/* TEXT INPUT */}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type message... (Ctrl+Enter to send)"
          rows={1}
          className="flex-1 bg-[#101829] rounded-md px-3 py-2 resize-none outline-none"
        />

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          className="bg-purple-500 px-4 py-2 rounded-md text-white"
        >
          Send
        </button>

      </div>
    </div>
  );
}