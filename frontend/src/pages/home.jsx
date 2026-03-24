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
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getToken = () => localStorage.getItem("token");
  const token = getToken();

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* SOCKET */
  useEffect(() => {
    const storedToken = getToken();

    if (!storedToken) {
      navigate("/login");
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: storedToken },
      transports: ["polling"],
    });

    socketRef.current = socket;

    socket.on("newMessage", (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.room]: [...prev[message.room], message],
      }));
    });

    return () => socket.disconnect();
  }, [navigate]);

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
        console.error(err);
      }
    };

    loadMessages();
  }, [activeRoom]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

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

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0d1320] p-3 flex justify-between items-center z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
        <span className="text-sm">
          {activeRoom}
        </span>
      </div>

      {/* SIDEBAR */}
      <div className={`
        fixed md:relative z-40
        h-full w-64 bg-[#101521] border-r border-white/10
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}>
        <div className="p-5 border-b border-[#00ff9c]/20">
          CR MATRIX
        </div>

        <div className="p-4 space-y-2 text-sm">
          {Object.keys(messages).map((room) => (
            <button
              key={room}
              onClick={() => {
                setActiveRoom(room);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeRoom === room
                  ? "bg-[#1b2030]"
                  : "hover:bg-[#1b2030]"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        <div className="p-4">
          <button onClick={handleLogout} className="text-red-400">
            Logout
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col pt-12 md:pt-0">

        {/* HEADER */}
        <div className="hidden md:flex border-b border-white/10 p-4 justify-between">
          <span>{activeRoom}</span>
          <span>{messages[activeRoom].length} msgs</span>
        </div>

        {/* MARKET FEED */}
        {activeRoom === "market-analysis" && <MarketFeed />}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3">
          {messages[activeRoom].map((msg) => (
            <Message key={msg._id} {...msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type message..."
              className="flex-1 px-3 py-2 text-sm md:text-base bg-[#101829] rounded-md outline-none"
            />

            <button
              onClick={handleSend}
              className="px-3 md:px-5 py-2 bg-purple-500 rounded-md text-white"
            >
              Send
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}