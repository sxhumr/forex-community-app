import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";

const socket = io(import.meta.env.VITE_API_URL, { auth: { token: localStorage.getItem("token"), }, });

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

  const token = localStorage.getItem("token");

  const currentUserId = (() => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return null;
    }
  })();

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

    socket.on("messageEdited", ({ _id, text, room }) => {
      setMessages((prev) => ({
        ...prev,
        [room]: prev[room].map((m) =>
          m._id === _id ? { ...m, text, isEdited: true } : m
        ),
      }));
    });

    socket.on("messageDeleted", ({ _id, room }) => {
      setMessages((prev) => ({
        ...prev,
        [room]: prev[room].filter((m) => m._id !== _id),
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
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.off("connect_error");
    };
  }, [navigate]);

  /* LOAD HISTORY */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/messages?room=${activeRoom}`, {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [activeRoom, token]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    socket.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
    });

    setNewMessage("");
  };

  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditedText(msg.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  const saveEdit = () => {
    if (!editedText.trim()) return;

    socket.emit("editMessage", {
      id: editingId,
      text: editedText.trim(),
    });

    cancelEdit();
  };

  const deleteMessage = (id) => {
    socket.emit("deleteMessage", { id });
  };

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-[#0b141a] text-gray-200">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#111b21] border-r border-white/10 flex flex-col">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-mono tracking-[0.35em] text-[#00ff9c]">
            CR MATRIX
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Secure Trading Hub
          </p>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {["general", "feeds"].map((room) => (
            <button
              key={room}
              onClick={() => setActiveRoom(room)}
              className={`w-full px-4 py-3 rounded-lg text-left transition
                ${
                  activeRoom === room
                    ? "bg-[#202c33] text-white"
                    : "text-gray-400 hover:bg-[#202c33]/60"
                }`}
            >
              #{room}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* CHAT */}
      <main className="flex-1 flex flex-col bg-[#0b141a]">
        <header className="px-6 py-4 bg-[#202c33] border-b border-white/5">
          <p className="text-sm font-medium">
            #{activeRoom}
          </p>
        </header>

        {/* MESSAGES */}
        <section className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages[activeRoom].map((msg) => {
            const isOwn = msg.userId === currentUserId;

            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}
              >
                <div className="max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm leading-relaxed
                      ${
                        isOwn
                          ? "bg-[#005c4b] text-white"
                          : "bg-[#202c33] text-gray-100"
                      }`}
                  >
                    {msg.text}
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1">
                    {msg.username}
                    {msg.isEdited && " • edited"}
                  </p>

                  {isOwn && (
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-3 text-[11px] text-gray-400 mt-1">
                      <button
                        onClick={() => startEdit(msg)}
                        className="hover:text-[#00ff9c]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </section>

        {/* INPUT */}
        <footer className="px-4 py-4 bg-[#202c33] border-t border-white/5">
          {editingId ? (
            <div className="space-y-3">
              <input
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-[#111b21] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#00ff9c]/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-[#00a884] text-black rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-white/10 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message"
                className="flex-1 bg-[#111b21] border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#00ff9c]/50"
              />
              <button
                onClick={handleSend}
                className="px-5 py-3 bg-[#00a884] text-black rounded-lg font-medium"
              >
                Send
              </button>
            </div>
          )}
        </footer>
      </main>
    </div>
  );
}
