import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import {
    StartTerminalSession,
    SendInput,
    GetCompletion,
} from "../../../wailsjs/go/app/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";

const terminalMap = new Map<number, Terminal>();

type Props = {
    terminalId: number;
};

export function XTermInstance({ terminalId }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const inputRef = useRef("");

    useEffect(() => {
        let term = terminalMap.get(terminalId);
        const fitAddon = new FitAddon();

        if (!term) {
            term = new Terminal({
                theme: { background: "#1e1e1e", foreground: "#cccccc" },
                fontSize: 14,
                cursorBlink: true,
                convertEol: true,
                fontFamily: "monospace",
                scrollback: 1000,
            });

            term.loadAddon(fitAddon);
            terminalMap.set(terminalId, term);

            StartTerminalSession(terminalId)
                .then(() => term?.writeln("[shell session ready]"))
                .catch((err) => {
                    console.error("Terminal start failed:", err);
                    term?.writeln("[error starting shell session]");
                });

            term.onData((data) => {
                switch (data) {
                    case "\r":
                        SendInput(terminalId, inputRef.current);
                        inputRef.current = "";
                        break;
                    case "\t":
                        if (inputRef.current.trim()) {
                            GetCompletion(terminalId, inputRef.current.trim()).then((suggestion) => {
                                if (suggestion && suggestion !== inputRef.current) {
                                    const diff = suggestion.slice(inputRef.current.length);
                                    inputRef.current = suggestion;
                                    if (diff && term) term.write(diff);
                                }
                            });
                        }
                        break;
                    case "\u007f":
                        if (inputRef.current.length > 0) {
                            inputRef.current = inputRef.current.slice(0, -1);
                            term?.write("\b \b");
                        }
                        break;
                    default:
                        inputRef.current += data;
                        term?.write(data);
                        break;
                }
            });

            EventsOn("terminal:data", (payload: any) => {
                if (!payload || payload.id !== terminalId) return;
                const output = String(payload.output);
                if (
                    output.includes("cannot set terminal process group") ||
                    output.includes("no job control") ||
                    output.trim() === ""
                )
                    return;
                term?.write(output);
            });
        }

        terminalRef.current = term;
        fitAddonRef.current = fitAddon;

        if (containerRef.current && term && !term.element) {
            term.open(containerRef.current);

            requestAnimationFrame(() => {
                fitAddon.fit();
                term.focus();
            });

            // ✅ optional: robust resize listener
            const observer = new ResizeObserver(() => {
                fitAddon.fit();
            });
            observer.observe(containerRef.current);

            return () => {
                observer.disconnect();
            };
        }
    }, [terminalId]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{
                overflow: "hidden",
            }}
        />
    );
}
