import { useEffect, useRef, useState } from "react"
import { Terminal as XTerm } from "xterm"
import "xterm/css/xterm.css"
import { EventsOn } from "../../../wailsjs/runtime/runtime"
import { StartTerminal, WriteRaw } from "../../../wailsjs/go/app/App"
import { FitAddon } from "xterm-addon-fit"

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const startedRef = useRef(false)

useEffect(() => {
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
      })

      const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      // 🧠 Direkte Eingabe: an ConPTY schicken
      term.onData((data: string) => {
        WriteRaw(data)
      })

      // 🟢 Backend starten
      if (!startedRef.current) {
        StartTerminal("hydra-container")
          .then(() => {
            term.writeln("[ConPTY gestartet]")
            startedRef.current = true
          })
          .catch((err) => {
            console.error("Fehler beim Start:", err)
            term.writeln("[Fehler beim Starten]")
          })
      }

      // 📡 Ausgabe vom Backend
      EventsOn("terminal:data", (data) => {
        term.write(data as string)
      })

      xtermRef.current = term
    }
  }, 100)

  return () => {
    clearTimeout(timeout)
    xtermRef.current?.dispose()
    xtermRef.current = null
  }
}, [isVisible])

  if (!isVisible) return null

  return (
    <div>
      <div className="flex items-center justify-between text-sm bg-[#2d2d2d] text-white px-4 py-1 border-b border-neutral-700">
        <div className="px-2 py-1 rounded-t bg-[#1e1e1e] font-semibold">TERMINAL</div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert("Add new tab (coming soon!)")}
            className="hover:text-green-400 transition-colors text-sm font-bold"
          >
            ＋
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="hover:text-red-400 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="w-full h-[calc(100%-2rem)] overflow-hidden p-0 m-0"
      />
    </div>
  )
}
