// src/components/terminal/TerminalContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Terminal-Typ: basiert jetzt auf groupId statt parentId
export type TerminalTab = {
    id: number;
    name: string;
    startTime: number;
    groupId: number;
    isActive: boolean;
};

type TerminalContextType = {
    terminals: TerminalTab[];
    selectedTerminal: number;
    height: number;
    isVisible: boolean;

    // Aktionen / Setter
    addTerminal: (groupId?: number) => void;
    removeTerminal: (index: number) => void;
    selectTerminal: (id: number) => void;
    setHeight: (height: number) => void;
    setIsVisible: (visible: boolean) => void;
    hideTerminal: () => void;
    showTerminal: () => void;
    showAlert: (message: string) => void;
};

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export function useTerminal() {
    const context = useContext(TerminalContext);
    if (!context) {
        throw new Error("useTerminal must be used within a TerminalProvider");
    }
    return context;
}

export function TerminalProvider({ children }: { children: ReactNode }) {
    const [terminals, setTerminals] = useState<TerminalTab[]>([
        {
            id: 1,
            name: "Terminal 1",
            startTime: Date.now(),
            groupId: 1,
            isActive: true,
        },
    ]);
    const [selectedTerminal, setSelectedTerminal] = useState(1); // ID statt Index
    const [height, setHeight] = useState(300);
    const [isVisible, setIsVisible] = useState(true);

    const hideTerminal = () => setIsVisible(false);
    const showTerminal = () => setIsVisible(true);

    const showAlert = (message: string) => {
        window.alert(message);
    };

    const addTerminal = (baseGroupId?: number) => {
        setTerminals((prev) => {
            const nextId = prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1;
            const newGroupId =
                baseGroupId ?? (prev.length ? Math.max(...prev.map((t) => t.groupId)) + 1 : 1);

            const newTerminal: TerminalTab = {
                id: nextId,
                name: `Terminal ${nextId}`,
                startTime: Date.now(),
                groupId: newGroupId,
                isActive: true,
            };

            return [...prev, newTerminal];
        });

        // Direkt als aktiv markieren
        setSelectedTerminal(() => {
            const next = terminals.length ? Math.max(...terminals.map((t) => t.id)) + 1 : 1;
            return next;
        });
    };

    const removeTerminal = (index: number) => {
        setTerminals((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            return updated;
        });

        setSelectedTerminal(() => {
            const remaining = terminals.filter((_, i) => i !== index);
            return remaining.length > 0 ? remaining[0].id : 0;
        });
    };

    const selectTerminal = (id: number) => {
        setSelectedTerminal(id);
    };

    return (
        <TerminalContext.Provider
            value={{
                terminals,
                selectedTerminal,
                height,
                isVisible,
                addTerminal,
                removeTerminal,
                selectTerminal,
                setHeight,
                setIsVisible,
                hideTerminal,
                showTerminal,
                showAlert,
            }}
        >
            {children}
        </TerminalContext.Provider>
    );
}
