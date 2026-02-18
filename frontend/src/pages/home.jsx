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

const MAX_MEDIA_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [pendingMedia, setPendingMedia] = useState(null);

  const token = localStorage.getItem("token");

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

  /* SOCKET LISTENERS */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

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
        [targetRoom]: prev[targetRoom].map((message) =>
          message._id === _id ? { ...message, text, isEdited } : message
        ),
      }));
    });

    socket.on("messageDeleted", ({ _id, room }) => {
      const targetRoom = room || "general";
      setMessages((prev) => ({
        ...prev,
        [targetRoom]: prev[targetRoom].filter(
          (message) => message._id !== _id
        ),
      }));
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);

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
      socket.disconnect();
      socketRef.current = null;
    };
  }, [navigate, token]);

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
        console.error("Failed to load messages", err);
      }
    };

    loadMessages();
  }, [activeRoom, token]);

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!ACCEPTED_MEDIA_TYPES.includes(file.type)) {
      alert("Only JPG, PNG, WEBP, GIF, MP4, WEBM, and MOV are supported.");
      return;
    }

    if (file.size > MAX_MEDIA_SIZE_BYTES) {
      alert("Max upload size is 10MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setPendingMedia({
        type: file.type.startsWith("video/") ? "video" : "image",
        mimeType: file.type,
        dataUrl,
        fileName: file.name,
        size: file.size,
      });
    } catch (err) {
      console.error("Failed to read file", err);
    }
  };

  const clearPendingMedia = () => {
    setPendingMedia(null);
  };

  const handleSend = () => {
    if (!newMessage.trim() && !pendingMedia) return;

    if (!socketRef.current) {
      console.error("Socket not connected yet");
      return;
    }

    socketRef.current.emit("sendMessage", {
      text: newMessage.trim(),
      room: activeRoom,
      media: pendingMedia,
    });

    setNewMessage("");
    clearPendingMedia();
  };

  const startEdit = (message) => {
    setEditingId(message._id);
    setEditedText(message.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedText("");
  };

  const saveEdit = () => {
    if (!editedText.trim() || !socketRef.current) return;

    socketRef.current.emit("editMessage", {
      id: editingId,
      text: editedText.trim(),
    });

    cancelEdit();
  };

  const deleteMessage = (id) => {
    if (!socketRef.current) return;
    socketRef.current.emit("deleteMessage", { id });
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
            type="button"
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
            type="button"
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
          <div className="flex flex-col">
            <span className="text-green-100">
              {activeRoom === "general"
                ? "# general"
                : "# live-market-feeds"}
            </span>
            <span className="text-xs text-green-100/60">
              {activeRoom === "general"
                ? "Community chat and trade ideas."
                : "Live commentary and market updates."}
            </span>
          </div>
          <div className="text-xs text-green-100/50">
            {messages[activeRoom].length} messages
          </div>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gradient-to-b from-[#111827] to-[#0c1422]">
          {messages[activeRoom].map((msg) => {
            const isOwn = String(msg.user || "") === String(currentUserId || "");

            return (
              <div key={msg._id || msg.createdAt} className="group">
                <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className="w-full max-w-[85%]">
                    <Message
                      user={msg.username || "User"}
                      role={msg.role}
                      text={msg.text}
                      media={msg.media}
                      isOwn={isOwn}
                    />

                    {msg.isEdited && (
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn
                            ? "text-right text-purple-200/60"
                            : "text-left text-green-100/50"
                        }`}
                      >
                        Edited
                      </p>
                    )}

                    {isOwn && (
                      <div className="opacity-0 group-hover:opacity-100 transition text-xs flex gap-2 mt-1 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(msg)}
                          className="text-purple-200 hover:text-purple-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMessage(msg._id)}
                          className="text-red-300 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 bg-[#0d1320] p-4">
          {editingId ? (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-[#101829] border border-white/15 rounded-md px-4 py-2 text-green-100 outline-none focus:border-[#80f7c7]/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-purple-500/90 text-white rounded-md hover:bg-purple-400 transition font-medium"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-white/20 text-green-100 rounded-md hover:border-white/40 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingMedia && (
                <div className="rounded-md border border-white/15 bg-[#101829] p-3 text-xs text-green-100/80 flex items-center justify-between gap-3">
                  <span className="truncate">
                    Attached: {pendingMedia.fileName} ({Math.round(pendingMedia.size / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={clearPendingMedia}
                    className="text-red-300 hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <label className="px-4 py-2 border border-white/20 text-green-100 rounded-md hover:border-white/40 transition cursor-pointer whitespace-nowrap">
                  📎
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleMediaPick}
                  />
                </label>

                <input
                  type="text"
                  placeholder={
                    activeRoom === "general"
                      ? "Message #general"
                      : "Message #live-market-feeds"
                  }
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
          )}
        </div>
      </div>
    </div>
  );
}
