import { useState, useEffect } from "react";

export function formatElapsedTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TerminalTimer({ startTime }: { startTime: number }) {
    const [elapsed, setElapsed] = useState(Date.now() - startTime);

    useEffect(() => {
        // Update immediately when startTime changes
        setElapsed(Date.now() - startTime);

        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [startTime]);

    return <div className="text-xs text-neutral-400">{formatElapsedTime(elapsed)}</div>;
}
