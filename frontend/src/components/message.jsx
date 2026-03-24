export default function Message({ user, text, media }) {
  return (
    <div className="flex flex-col max-w-[85%] md:max-w-[60%]">

      {/* Username */}
      <span className="text-xs text-green-400 mb-1">
        {user || "User"}
      </span>

      {/* Bubble */}
      <div className="bg-[#1b2030] p-3 rounded-xl text-sm md:text-base break-words">

        {/* Text */}
        {text && <p>{text}</p>}

        {/* Image */}
        {media?.dataUrl && (
          <img
            src={media.dataUrl}
            alt="uploaded"
            className="mt-2 rounded-lg max-w-[250px]"
          />
        )}

      </div>
    </div>
  );
}