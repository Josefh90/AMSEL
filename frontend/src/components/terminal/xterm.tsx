import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import { SendInput, StartTerminal, GetCompletion } from "../../../wailsjs/go/app/App";
import { FitAddon } from "xterm-addon-fit";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { ChevronDown, SquareTerminal, Trash2, Columns } from "lucide-react";

export function Terminal() {
  const [sidebarWidth, setSidebarWidth] = useState(192); // default 48 * 4 px = 192px (w-48)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(sidebarWidth);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = startX.current - e.clientX; // sidebar is on right, dragging left increases width
    let newWidth = startWidth.current + deltaX;
    newWidth = Math.min(Math.max(newWidth, 150), 400); // clamp width between 150 and 400 px
    setSidebarWidth(newWidth);
  };

  const onMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const inputRef = useRef(""); // Eingabepuffer
  const [isVisible, setIsVisible] = useState(true);
  const startedRef = useRef(false); // Nur einmal Shell starten

  const [terminals, setTerminals] = useState<string[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<number | null>(null);

  const handleAddTerminal = () => {
    setTerminals((prev) => {
      const newList = [...prev, `Terminal ${prev.length + 1}`];
      setSelectedTerminal(newList.length - 1);
      return newList;
    });
  };

  const handleRemoveTerminal = (idx: number) => {
    setTerminals((prev) => {
      const newList = prev.filter((_, i) => i !== idx);
      // Adjust selected terminal if needed
      if (selectedTerminal !== null) {
        if (idx === selectedTerminal) {
          setSelectedTerminal(null);
        } else if (idx < selectedTerminal) {
          setSelectedTerminal((sel) => (sel !== null ? sel - 1 : null));
        }
      }
      return newList;
    });
  };

  const handleSplitTerminal = () => {
    alert("Split terminal feature coming soon!");
  };

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      if (terminalRef.current && !xtermRef.current) {
        const term = new XTerm({
          convertEol: true,
          fontFamily: "monospace",
          cursorBlink: true,
          fontSize: 14,
          theme: {
            background: "#1e1e1e",
            foreground: "#d0d0d0",
          },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit();

        term.open(terminalRef.current);
        term.reset();
        term.writeln("Welcome to your terminal!");
        term.write("> ");

        if (!startedRef.current) {
          StartTerminal("hydra-container")
            .then(() => {
              term.writeln("[Shell gestartet]");
              startedRef.current = true;
            })
            .catch((err) => {
              console.error("Shell konnte nicht gestartet werden:", err);
              term.writeln("[Fehler beim Starten der Shell]");
            });
        }

        term.onData((data: string) => {
          if (!inputRef.current) inputRef.current = "";

          switch (data) {
            case "\r": // ENTER
              term.write("\r\n");
              SendInput(inputRef.current);
              inputRef.current = "";
              term.write("> ");
              break;
            case "\t": // TAB
              if (inputRef.current.trim()) {
                GetCompletion(inputRef.current.trim()).then((suggestion) => {
                  if (suggestion) {
                    const current = inputRef.current;
                    const newInput = suggestion;
                    const diff = newInput.slice(current.length);
                    inputRef.current = newInput;
                    term.write(diff);
                  }
                });
              }
              break;
            case "\u007f": // Backspace
              if (inputRef.current.length > 0) {
                inputRef.current = inputRef.current.slice(0, -1);
                term.write("\b \b");
              }
              break;
            default:
              inputRef.current += data;
              term.write(data);
              break;
          }
        });

        EventsOn("terminal:data", (data) => {
          xtermRef.current?.write(data as string);
        });

        xtermRef.current = term;
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
      xtermRef.current?.dispose();
      xtermRef.current = null;
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between text-sm bg-[#2d2d2d] text-white px-4 py-1 border-b border-neutral-700">
        <div className="px-2 py-1 rounded-t bg-[#1e1e1e] font-semibold">TERMINAL</div>

        <div className="flex items-center space-x-2">
          {/* + button */}
          <button
            onClick={handleAddTerminal}
            className="hover:text-amselblue transition-colors text-sm font-bold"
            aria-label="Add Terminal"
          >
            ＋
          </button>

          {/* ▼ dropdown button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:text-amselblue transition-colors text-sm font-bold" aria-label="Options">
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="z-50 bg-[#1e1e1e] text-white border border-neutral-700 rounded shadow-md"
            >
              <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                Split Terminal (coming soon)
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-neutral-800 cursor-pointer">
                Rename (coming soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close */}
          <button
            onClick={() => setIsVisible(false)}
            className="hover:text-red-400 transition-colors text-sm"
            aria-label="Close Terminal"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-grow h-full overflow-hidden bg-[#1e1e1e]">
        {/* Terminal display */}
        <div ref={terminalRef} className="flex-1 overflow-hidden" />

        {/* Resizable Sidebar */}
<aside
  style={{ width: sidebarWidth }}
  className="border-l border-neutral-700 bg-[#252526] text-white text-sm py-2 overflow-y-auto flex flex-col relative"
>
  {/* Drag handle */}
  <div
    onMouseDown={onMouseDown}
    className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-amselblue"
    title="Resize Sidebar"
  />

  {/* Sidebar header */}
  <div className="px-3 py-2 font-semibold border-b border-neutral-800 flex items-center justify-between select-none">
    <span>Terminals</span>
    <button
      onClick={handleAddTerminal}
      className="hover:text-amselblue transition-colors text-sm font-bold"
      aria-label="Add Terminal"
    >
      ＋
    </button>
  </div>

  {/* Terminal list */}
  <nav
    className="flex-1 overflow-y-auto scrollbar-thin"
    style={{
      scrollbarColor: "#3b82f6 #1e1e1e", // thumb blue, track terminal bg
      scrollbarWidth: "thin",
    }}
  >
    {terminals.length === 0 && (
      <div className="px-3 py-2 text-neutral-500 text-xs italic">No terminals yet</div>
    )}
    {terminals.map((name, idx) => (
      <div
        key={idx}
        className={`flex items-center justify-between px-3 py-1 border-b border-neutral-800 cursor-pointer select-none
          ${
            selectedTerminal === idx
              ? "bg-neutral-700 text-amselblue"
              : "hover:bg-neutral-700"
          }
        `}
        onClick={() => setSelectedTerminal(idx)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setSelectedTerminal(idx);
        }}
      >
        {/* Icon + name horizontally aligned */}
        <div className="flex items-center gap-2 min-w-0">
          <SquareTerminal className="w-4 h-4 shrink-0" />
          <span className="truncate">{name}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSplitTerminal();
            }}
            className="p-1 hover:text-amselblue"
            aria-label={`Split ${name}`}
            title="Split Terminal"
            type="button"
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTerminal(idx);
            }}
            className="p-1 hover:text-red-500"
            aria-label={`Delete ${name}`}
            title="Delete Terminal"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    ))}
  </nav>
</aside>
      </div>
    </div>
  );
}
