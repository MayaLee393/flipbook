import { useRef } from "react";
import { Bookmark, Trash2, X, Plus } from "lucide-react";

const BookmarkDrawer = ({ open, onClose, bookmarks, currentPage, isMobile, onAdd, onDelete, onJump }) => {
  const titleRef = useRef(null);
  const handleAdd = () => {
    const title = titleRef.current?.value.trim();
    if (!title) return;
    onAdd(title);
    if (titleRef.current) titleRef.current.value = "";
  };

  // Convert stored spread index to display page number
  const toDisplay = (page) => isMobile ? page + 1 : page * 2 + 1;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-20" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 font-semibold text-black">
            <Bookmark size={16} /> Bookmarks
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Bookmark page {toDisplay(currentPage)}</p>
          <div className="flex gap-2">
            <input
              ref={titleRef}
              type="text"
              placeholder="Bookmark title…"
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-black"
            />
            <button onClick={handleAdd} className="flex items-center gap-1 bg-black text-white text-xs px-2 py-1 rounded hover:bg-gray-800 transition-colors">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-8">No bookmarks yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {bookmarks.map((bm) => (
                <li key={bm.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 group">
                  <button onClick={() => { onJump(bm.page); onClose(); }} className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium text-black truncate w-full">{bm.title}</span>
                    <span className="text-xs text-gray-400">Page {toDisplay(bm.page)}</span>
                  </button>
                  <button onClick={() => onDelete(bm.id)} className="ml-2 text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default BookmarkDrawer;