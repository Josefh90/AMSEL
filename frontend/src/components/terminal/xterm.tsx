import { useEffect, useRef, useState } from "react"
import { Terminal as XTerm } from "xterm"
import "xterm/css/xterm.css"
import {  EventsOn } from "../../../wailsjs/runtime/runtime";
import { SendInput, StartTerminal } from "../../../wailsjs/go/app/App"
import { FitAddon } from "xterm-addon-fit"

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement | null>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const inputRef = useRef("") // Eingabepuffer
  const [isVisible, setIsVisible] = useState(true)
  const startedRef = useRef(false) // Nur einmal Shell starten

  useEffect(() => {
  if (!isVisible) return



  const timeout = setTimeout(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerm({
        cols: 80,
        rows: 24,
        theme: {
          background: "#1e1e1e",
          foreground: "#267697",
        },
      })

        const fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(terminalRef.current)
      fitAddon.fit()

      term.open(terminalRef.current)
      term.reset()
      term.writeln("Welcome to your terminal!")
      term.write("> ")


      // 🟢 Nur einmal starten
      if (!startedRef.current) {
        StartTerminal("hydra-container")
          .then(() => {
            term.writeln("[Shell gestartet]")
            startedRef.current = true
          })
          .catch((err) => {
            console.error("Shell konnte nicht gestartet werden:", err)
            term.writeln("[Fehler beim Starten der Shell]")
          })
      }

      // 🧠 Eingabe verarbeiten
      term.onData((data: string) => {
        if (!inputRef.current) inputRef.current = ""

        if (data === "\r") {
          term.write("\r\n")
          SendInput(inputRef.current)
          inputRef.current = ""
          term.write("> ")
        } else if (data === "\u007f") {
          if (inputRef.current.length > 0) {
            inputRef.current = inputRef.current.slice(0, -1)
            term.write("\b \b")
          }
        } else {
          inputRef.current += data
          term.write(data)
        }
      })

      // 🔁 Backend → Terminal
 

      EventsOn("terminal:data", (data) => {
  xtermRef.current?.write(data as string)
})

      xtermRef.current = term
    }
  }, 100)

  return () => {
    clearTimeout(timeout)
    //Events.Off("terminal:data")
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
