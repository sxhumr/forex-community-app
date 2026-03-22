export default function Message({ user, role, text, isOwn, media }) {
  // Define name colors based on user role
  const nameColor =
    role === "admin"
      ? "text-red-400"
      : role === "system"
      ? "text-emerald-400"
      : "text-green-200";

  return (
    <div className={`w-full flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        
        {/* USER LABEL */}
        <p className={`text-[10px] mb-1 uppercase tracking-tighter ${nameColor}`}>
          {isOwn ? "LOCAL_USER" : user}
          {role === "admin" && (
            <span className="ml-2 text-[9px] text-red-500 border border-red-500/40 px-1 rounded bg-red-500/5">
              SYS_ADMIN
            </span>
          )}
        </p>

        {/* MESSAGE BUBBLE */}
        <div
          className={`px-4 py-2 rounded-2xl text-sm leading-relaxed border shadow-[0_0_10px_rgba(0,0,0,0.3)] overflow-hidden ${
            isOwn
              ? "bg-[#161b2c] border-[#3b4b7a] text-blue-50 rounded-br-md"
              : role === "admin"
              ? "bg-[#2a0a0a] border-red-900/50 text-red-100"
              : role === "system"
              ? "bg-emerald-900/20 border-emerald-500/20 text-emerald-100"
              : "bg-[#0d1320] border-white/10 text-green-100 rounded-bl-md"
          }`}
        >
          {/* IMAGE RENDERING */}
          {media?.dataUrl && (media.type === "image" || !media.type) && (
            <div className="relative group">
              <img
                src={media.dataUrl}
                alt="uploaded terminal data"
                className="mt-2 rounded-lg max-w-full md:max-w-[350px] max-h-[450px] object-contain border border-white/5 hover:border-[#00ff9c]/30 transition-all cursor-zoom-in"
              />
              <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-[8px] px-2 py-1 rounded text-white font-mono">
                IMG_DATA_STR
              </div>
            </div>
          )}

          {/* VIDEO RENDERING */}
          {media?.type === "video" && media?.dataUrl && (
            <video
              src={media.dataUrl}
              controls
              className="rounded-lg max-h-80 w-full mt-2 bg-black border border-white/10"
            />
          )}

          {/* TEXT RENDERING */}
          {text && (
            <p className={`${media?.dataUrl ? "mt-3" : "mt-0"} font-mono whitespace-pre-wrap`}>
              {text}
            </p>
          )}
        </div>

        {/* TIMESTAMP (Optional visual flair) */}
        <p className="text-[8px] text-white/10 mt-1 font-mono tracking-widest">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </p>
      </div>
    </div>
  );
}