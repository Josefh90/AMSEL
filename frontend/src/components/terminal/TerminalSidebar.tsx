import { useState, useEffect } from "react";
import { SquareTerminal, Columns, Trash2 } from "lucide-react";
import { TerminalTimer } from "./TerminalInstance"; // Adjust the import path as needed

type TerminalTab = {
  id: number;
  name: string;
  startTime: number; // Track start time for elapsed time display
};

interface SidebarProps {
  terminals: TerminalTab[];
  selectedTerminal: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
}

export function TerminalSidebar({
  terminals,
  selectedTerminal,
  onSelect,
  onAdd,
  onDelete,
}: SidebarProps) {
  const [width, setWidth] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);

  const handleResizing = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(150, Math.min(e.clientX, window.innerWidth - 200));
      setWidth(newWidth);
    }
  };

  // Attach global mousemove and mouseup
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleResizing(e);
    const onMouseUp = () => stopResizing();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="relative" style={{ width }}>
      {/* Sidebar Content */}
      <aside
        className="h-full border-l border-neutral-800 bg-[#252526] text-white text-sm overflow-y-auto"
        style={{ width }}
      >
        {/* Terminal List */}
        {terminals.map((terminal, idx) => (
          <div
            key={terminal.id}
            onClick={() => onSelect(idx)}
            className={`px-3 py-1 cursor-pointer flex items-center justify-between gap-2 transition-colors border-b border-neutral-800 whitespace-nowrap overflow-hidden text-ellipsis ${selectedTerminal === idx ? "bg-neutral-700 text-amselblue" : "hover:bg-neutral-700"
              }`}
          >
            {/* Icon + Name */}
            <div className="flex items-center gap-2 overflow-hidden">
              <SquareTerminal className="w-4 h-4 shrink-0" />
              <span className="truncate">{terminal.name}</span>
            </div>

            {/* Split/Delete Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                title="Split"
                className="hover:text-white text-neutral-400"
              >
                <Columns className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                title="Close"
                className="hover:text-red-400 text-neutral-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <TerminalTimer startTime={terminal.startTime} />
          </div>
        ))}
      </aside>

      {/* Drag Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 left-0 h-full w-1 cursor-col-resize z-50 bg-transparent hover:bg-neutral-700"
        style={{ left: `calc(100% - 1px)` }}
      />
    </div>
  );
}
