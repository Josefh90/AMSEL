// src/wails.d.ts
export {}

declare global {
  interface Window {
    backend: {
      App: {
        SendInput(data: string): void
        // ggf. weitere Methoden hier deklarieren
      }
    }

    runtime: {
      EventsOn(event: string, callback: (data: any) => void): void
      EventsOff(event: string): void
      EventsEmit(event: string, data: any): void
    }
  }
}
