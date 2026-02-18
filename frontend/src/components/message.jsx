export default function Message({ user, role, text, isOwn, media }) {
  const nameColor =
    role === "admin"
      ? "text-red-400"
      : role === "system"
      ? "text-emerald-400"
      : "text-green-200";

  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <p className={`text-xs mb-1 ${nameColor}`}>
          {isOwn ? "You" : user}
          {role === "admin" && (
            <span className="ml-2 text-[10px] text-red-300 border border-red-500/40 px-1 rounded">
              ADMIN
            </span>
          )}
        </p>

        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed border shadow-sm overflow-hidden ${
            isOwn
              ? "bg-purple-600/80 border-purple-400/30 text-purple-50 rounded-br-md"
              : role === "admin"
              ? "bg-red-900/30 border-red-500/30 text-red-100"
              : role === "system"
              ? "bg-emerald-900/20 border-emerald-500/20 text-emerald-100"
              : "bg-[#112015] border-[#2f5440] text-green-100 rounded-bl-md"
          }`}
        >
          {media?.type === "image" && media?.dataUrl && (
            <img
              src={media.dataUrl}
              alt={media.fileName || "shared image"}
              className="rounded-lg max-h-80 w-auto mb-2"
            />
          )}

          {media?.type === "video" && media?.dataUrl && (
            <video
              src={media.dataUrl}
              controls
              className="rounded-lg max-h-80 w-full mb-2 bg-black"
            />
          )}

          {text && <p>{text}</p>}
        </div>
      </div>
    </div>
  );
}
