import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import {
    StartTerminalSession,
    SendInput,
    GetCompletion,
    CloseTerminal,
} from "../../../wailsjs/go/app/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";

type Props = {
    terminalId: number;
};

export function XTermInstance({ terminalId }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const inputRef = useRef(""); // buffered input line#

    useEffect(() => {
        const term = new Terminal({
            theme: { background: "#1e1e1e", foreground: "#cccccc" },
            fontSize: 14,
            cursorBlink: true,
            convertEol: true,
            fontFamily: "monospace",
            scrollback: 1000,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        terminalRef.current = term;
        fitAddonRef.current = fitAddon;

        if (containerRef.current) {
            term.open(containerRef.current);
            fitAddon.fit();
            // term.writeln(`🖥️ Terminal ${terminalId} started`);
            //  term.write("> ");
        }


        // 🟢 Dynamisch anpassen bei Fenstergrößenänderung
        const handleResize = () => fitAddonRef.current?.fit();
        window.addEventListener("resize", handleResize);

        // Start backend session
        StartTerminalSession(terminalId)
            .then(() => {
                term.writeln("[shell session ready]");
            })
            .catch((err) => {
                console.error("Terminal start failed:", err);
                term.writeln("[error starting shell session]");
            });

        term.onData((data) => {
            switch (data) {
                case "\r": // ENTER
                    SendInput(terminalId, inputRef.current);
                    inputRef.current = "";
                    break;

                case "\t": // TAB – Autocomplete
                    if (inputRef.current.trim()) {
                        GetCompletion(terminalId, inputRef.current.trim()).then((suggestion) => {
                            if (suggestion && suggestion !== inputRef.current) {
                                const diff = suggestion.slice(inputRef.current.length);
                                inputRef.current = suggestion;
                                if (diff) term.write(diff);
                            }
                        });
                    }
                    break;

                case "\u007f": // BACKSPACE
                    if (inputRef.current.length > 0) {
                        inputRef.current = inputRef.current.slice(0, -1);
                        term.write("\b \b");
                    }
                    break;

                default:
                    inputRef.current += data;
                    term.write(data); // ✅ Nur hier!
                    break;
            }
        });


        // Output from backend
        EventsOn("terminal:data", (payload: any) => {
            if (!payload || payload.id !== terminalId) return;

            const output = String(payload.output);

            // Filter again: don't duplicate prompts
            if (
                output.includes("cannot set terminal process group") ||
                output.includes("no job control") ||
                output.trim() === ""
            ) {
                return;
            }

            term.write(output);
        });

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            CloseTerminal(terminalId);
            term.dispose();
        };
    }, [terminalId]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
            }}
        />
    );
}
