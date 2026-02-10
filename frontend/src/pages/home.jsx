import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") },
});

export default function Home() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState({
    general: [],
    feeds: [],
  });
  const [newMessage, setNewMessage] = useState("");
  const [activeRoom, setActiveRoom] = useState("general");
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeRoom]);

  /* SOCKET LISTENERS */
  useEffect(() => {
    socket.on("newMessage", (message) => {
      const room = message.room || "general";

      setMessages((prev) => ({
        ...prev,
        [room]: [...prev[room], message],
      }));
    });

    socket.on("connect_error", (err) => {
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

  /* SEND MESSAGE */
  const handleSend = () => {
    if (!newMessage.trim()) return;

    socket.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
    });

    setNewMessage("");
  };

  /* EDIT MESSAGE (local UI only for now) */
  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditedText(msg.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  const saveEdit = () => {
    if (!editedText.trim()) return;

    setMessages((prev) => ({
      ...prev,
      [activeRoom]: prev[activeRoom].map((m) =>
        m.id === editingId
          ? { ...m, text: editedText.trim(), isEdited: true }
          : m
      ),
    }));

    cancelEdit();
  };

  /* DELETE MESSAGE (local UI only for now) */
  const deleteMessage = (id) => {
    setMessages((prev) => ({
      ...prev,
      [activeRoom]: prev[activeRoom].filter((m) => m.id !== id),
    }));
  };

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div
      className="h-screen flex text-gray-200"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0,255,156,0.04), transparent 60%), #0b141a",
      }}
    >
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#111b21] flex flex-col">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-mono tracking-widest text-[#00ff9c]">
            CR MATRIX
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Secure Trading Hub
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[
            { key: "general", title: "General", subtitle: "Community chat" },
            { key: "feeds", title: "Live Market Feeds", subtitle: "Market updates" },
          ].map((room) => (
            <button
              key={room.key}
              onClick={() => setActiveRoom(room.key)}
              className={`w-full px-5 py-4 text-left transition
                ${
                  activeRoom === room.key
                    ? "bg-[#202c33] shadow-[inset_3px_0_0_#00ff9c]"
                    : "hover:bg-[#202c33]/70"
                }`}
            >
              <p className="text-base font-medium">{room.title}</p>
              <p className="text-sm text-gray-400">
                {room.subtitle}
              </p>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="text-base text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-[#0b141a]">
        <header className="px-6 py-4 bg-[#202c33] border-b border-white/5">
          <p className="text-base font-mono tracking-wide text-[#00ff9c]">
            {activeRoom === "general" ? "GENERAL_CHANNEL" : "MARKET_FEEDS"}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {messages[activeRoom].length} messages
          </p>
        </header>

        <section className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages[activeRoom].map((msg) => {
            const isOwn = msg.isOwn === true;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
              >
                <div className="max-w-[70%]">
                  <div
                    className={`px-5 py-3 rounded-xl text-[15px] leading-relaxed relative
                      ${
                        isOwn
                          ? "bg-[#005c4b] text-white shadow-[0_0_14px_rgba(0,255,156,0.18)]"
                          : "bg-[#202c33] text-gray-100"
                      }`}
                  >
                    {msg.text}

                    {isOwn && (
                      <div className="absolute -top-6 right-1 opacity-0 group-hover:opacity-100 transition flex gap-3 text-xs text-gray-300">
                        <button
                          onClick={() => startEdit(msg)}
                          className="hover:text-[#00ff9c]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {msg.username}
                    {msg.isEdited && " • edited"}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </section>

        <footer className="px-5 py-4 bg-[#202c33] border-t border-white/5">
          <div className="flex gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Enter transmission…"
              className="flex-1 bg-[#111b21] rounded-lg px-4 py-3 text-base outline-none focus:ring-1 focus:ring-[#00ff9c]/40"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-[#00a884] text-black rounded-lg text-base font-medium shadow-[0_0_14px_rgba(0,255,156,0.25)]"
            >
              Send
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
