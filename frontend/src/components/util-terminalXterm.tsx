import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
//import { backend } from "@wailsio/runtime";

export default function TerminalXterm() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const inputBuffer = useRef<string>("");

  useEffect(() => {
    if (terminalRef.current && !term.current) {
      term.current = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff",
        },
      });

      term.current.open(terminalRef.current);
      term.current.write("Willkommen im Terminal!\r\n$ ");

      term.current.onData(async (data) => {
        const char = data;

        // Enter gedrückt?
        if (char === "\r") {
          const input = inputBuffer.current.trim();
          inputBuffer.current = "";

          if (input.length === 0) {
            term.current?.write("\r\n$ ");
            return;
          }

          try {
           // const response = await backend.RunCommand({ input });
           // term.current?.write(`\r\n${response}\r\n$ `);
          } catch (err) {
            term.current?.write(`\r\n[Fehler]: ${String(err)}\r\n$ `);
          }
        } else if (char === "\u007f") {
          // Backspace
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.current?.write("\b \b");
          }
        } else {
          inputBuffer.current += char;
          term.current?.write(char);
        }
      });
    }
  }, []);

  return <div ref={terminalRef} style={{ width: "100%", height: "100%" }} />;
}
