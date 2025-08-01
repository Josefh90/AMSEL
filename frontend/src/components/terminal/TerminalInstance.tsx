import { useState, useRef, useEffect } from "react";
import { TerminalSplit } from "./TerminalSplit";
import { TerminalSidebar } from "./TerminalSidebar";

import { TerminalHeader } from "./TerminalHeader";
import { useTerminal } from "./context/TerminalContext";

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TerminalTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <div className="text-xs text-neutral-400">{formatElapsedTime(elapsed)}</div>;
}


export function TerminalInstance({ sidebarWidth }: { sidebarWidth: number }) {
  //const { isVisible, hideTerminal } = useTerminal();

  const { height, setHeight } = useTerminal();
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);


  const {
    terminals,
    selectedTerminal,
    selectTerminal,
    addTerminal,
    removeTerminal,
    showAlert, // Use the new showAlert function
  } = useTerminal();;



  const startDragging = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = height;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      const deltaY = dragStartY.current - e.clientY; // invertiert: ziehen nach oben erhöht Höhe
      const newHeight = dragStartHeight.current + deltaY;

      // Minimum 200px, max Fensterhöhe - 100px
      if (newHeight >= 200 && newHeight <= window.innerHeight - 100) {
        setHeight(newHeight);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, []);

  // if (!isVisible) return null;

  return (
    <>

      {/* Platzhalter, damit Content nicht vom Terminal überlappt wird */}
      {/*{isVisible && <div style={{ height }} />} */}


      <div
        className="fixed bottom-0 flex flex-col border-t border-neutral-700 bg-[#1e1e1e]"
        style={{
          left: sidebarWidth,
          right: 0,
          height,
          zIndex: 50,
          /*  transition: 'left 0.2s ease-in-out' */
        }}
      >


        {/* Dragbar oben zum Höhentesten */}
        <div
          onMouseDown={startDragging}
          className="h-2 cursor-row-resize bg-amselblue hover:bg-neutral-600"
          title="Terminal Höhe ziehen"
        />


        {/* Terminal Container */}
        <div className="flex flex-col w-full h-full">
          <TerminalHeader />
          {/* Header – jetzt schmaler */}


          {/* Hauptbereich bleibt gleich */}
          <div className="flex flex-grow overflow-hidden h-full">
            <div className="flex-1 overflow-hidden">
              <TerminalSplit />
            </div>
            <div className="w-1 cursor-col-resize bg-neutral-800 hover:bg-neutral-600" />
            <TerminalSidebar
              terminals={terminals}
              selectedTerminal={selectedTerminal}
              onSelect={selectTerminal}
              onAdd={addTerminal}
              onDelete={removeTerminal}
              showAlert={showAlert} // Pass the showAlert function
            />
          </div>
        </div>

      </div>

    </>
  );
}
