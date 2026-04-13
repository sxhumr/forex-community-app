export default function Message({
  id,
  user,
  text,
  media,
  isOwn,
  onDelete,
}) {
  return (
    <div className="max-w-[80%] group">

      <div className="flex justify-between text-xs text-green-400">
        <span>{user}</span>

        {isOwn && (
          <button
            onClick={() => onDelete(id)}
            className="text-red-400 opacity-0 group-hover:opacity-100"
          >
            Delete
          </button>
        )}
      </div>

      <div className="bg-[#1b2030] p-3 rounded-xl">

        {text && (
          <p className="whitespace-pre-wrap">{text}</p>
        )}

        {media?.dataUrl && (
          <img
            src={media.dataUrl}
            alt="upload"
            className="mt-2 rounded-lg max-w-[250px]"
          />
        )}

      </div>
    </div>
  );
}