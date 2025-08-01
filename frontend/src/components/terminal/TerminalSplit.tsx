import React, { useEffect, useRef, useState } from "react";
import { SquareTerminal, Trash2, PictureInPicture2 } from "lucide-react";
import { useTerminal } from "./context/TerminalContext";

import type { TerminalTab } from "./context/TerminalContext";
import { XTermInstance } from "./XTermInstance";

// 🔁 Holt das aktuelle Terminal und alle seine rekursiven Kinder
function getTerminalBranch(terminals: TerminalTab[], parentId: number): TerminalTab[] {
  const branch: TerminalTab[] = [];
  const queue: number[] = [parentId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const current = terminals.find((t) => t.id === currentId);
    if (current) {
      branch.push(current);
      const children = terminals.filter((t) => t.parentId === current.id);
      queue.push(...children.map((c) => c.id));
    }
  }

  return branch;
}

export function TerminalSplit() {
  const { terminals, selectedTerminal, removeTerminal } = useTerminal();
  const terminalBranch = getTerminalBranch(terminals, selectedTerminal);

  const [widths, setWidths] = useState<number[]>([]);

  const draggingIndex = useRef<number | null>(null);
  const startX = useRef(0);
  const startWidths = useRef<number[]>([]);

  // 📏 Initialisiere Breiten nach Anzahl Terminals im Branch
  useEffect(() => {
    if (terminalBranch.length > 0) {
      setWidths(Array(terminalBranch.length).fill(100 / terminalBranch.length));
    }
  }, [terminalBranch.length]);

  function popOutTerminal(term: TerminalTab) {
    const popup = window.open(
      "",
      `TerminalPopup_${term.id}`,
      "width=600,height=400,left=200,top=200"
    );

    if (popup) {
      popup.document.title = term.name;
      popup.document.body.style.background = "#1e1e1e";
      popup.document.body.style.color = "white";
      popup.document.body.style.fontFamily = "monospace";
      popup.document.body.style.margin = "0";
      popup.document.body.style.padding = "10px";
      popup.document.body.innerText = `[${term.name} terminal content here]`;

      popup.addEventListener("beforeunload", () => {
        // hier kannst du spätere Logik einbauen
      });
    }
  }

  function onMouseDownSplitter(e: React.MouseEvent, idx: number) {
    draggingIndex.current = idx;
    startX.current = e.clientX;
    startWidths.current = [...widths];

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (draggingIndex.current === null) return;

    const deltaX = e.clientX - startX.current;
    const idx = draggingIndex.current;

    const deltaPercent = (deltaX / window.innerWidth) * 100;

    let leftWidth = startWidths.current[idx] + deltaPercent;
    let rightWidth = startWidths.current[idx + 1] - deltaPercent;

    const minWidth = 10;
    const total = startWidths.current[idx] + startWidths.current[idx + 1];

    if (leftWidth < minWidth) {
      leftWidth = minWidth;
      rightWidth = total - minWidth;
    } else if (rightWidth < minWidth) {
      rightWidth = minWidth;
      leftWidth = total - minWidth;
    }

    const newWidths = [...startWidths.current];
    newWidths[idx] = leftWidth;
    newWidths[idx + 1] = rightWidth;

    setWidths(newWidths);
  }

  function onMouseUp() {
    draggingIndex.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-white select-none">
      <div
        className="flex flex-row flex-grow relative overflow-hidden"
        style={{ height: "calc(100% - 40px)" }}
      >
        {terminalBranch.map((term, i) => (
          <React.Fragment key={term.id}>
            <div
              className="relative flex flex-col bg-[#252526] border-r border-neutral-700 overflow-auto"
              style={{ width: `${widths[i] ?? 100 / terminalBranch.length}%`, minWidth: "10%" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-2 py-1 border-b border-neutral-800">
                <div className="flex items-center gap-2 min-w-0">
                  <SquareTerminal className="w-4 h-4 shrink-0" />
                  <span className="truncate">{term.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeTerminal(terminals.findIndex((t) => t.id === term.id))}
                    title="Delete Terminal"
                    className="p-1 hover:text-red-500"
                    aria-label={`Delete ${term.name}`}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => popOutTerminal(term)}
                    title="Pop Out Terminal"
                    className="p-1 hover:text-green-400"
                    aria-label={`Pop Out ${term.name}`}
                    type="button"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inhalt */}
              {/* <div className="flex-grow p-2 text-sm overflow-auto text-neutral-300">
                <div
                  style={{
                    background: "#1e1e1e",
                    height: "100%",
                    borderRadius: 4,
                    padding: 8,
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    overflowY: "auto",
                  }}
                >
                  {`[${term.name} terminal content here]`}
                </div>
              </div>*/}
              <div className="flex-grow p-2 text-sm overflow-auto text-neutral-300">
                <XTermInstance terminalId={term.id} />
              </div>
            </div>



            {/* Splitter zwischen Terminals */}
            {i < terminalBranch.length - 1 && (
              <div
                onMouseDown={(e) => onMouseDownSplitter(e, i)}
                className="w-1 cursor-col-resize bg-neutral-700 hover:bg-amselblue transition-colors"
                style={{ userSelect: "none" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
