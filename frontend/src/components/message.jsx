export default function Message({ user, role, text }) {
  return (
    <div className="max-w-2xl">
      <p
        className={`text-xs mb-1 ${
          role === "admin"
            ? "text-red-400"
            : role === "system"
            ? "text-green-500"
            : "text-green-300"
        }`}
      >
        {user}
        {role === "admin" && (
          <span className="ml-2 text-[10px] text-red-300 border border-red-500/40 px-1 rounded">
            ADMIN
          </span>
        )}
      </p>

      <div
        className={`inline-block px-4 py-2 rounded-lg text-sm leading-relaxed ${
          role === "admin"
            ? "bg-red-900/30 border border-red-500/30"
            : role === "system"
            ? "bg-green-900/20 border border-green-500/20"
            : "bg-[#050f0a] border border-[#00ff9c]/20"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
