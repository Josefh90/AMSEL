// terminal_windows.go
//go:build windows
// +build windows

package app

import (
	"fmt"
	"log"
	"os/exec"
	"time"

	conpty "github.com/qsocket/conpty-go"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) StartTerminal(containerName string) error {
	log.Println("🔧 StartTerminal aufgerufen für Container:", containerName)

	imageName := "my-kali-image"
	projectRoot, err := getProjectRoot()
	if err != nil {
		return fmt.Errorf("konnte Projektordner nicht finden: %w", err)
	}

	// Docker-Image bauen, falls nötig
	buildCmd := exec.Command("docker", "build", "-t", imageName, ".")
	buildCmd.Dir = projectRoot
	buildOut, err := buildCmd.CombinedOutput()
	if err != nil {
		log.Println("Build output:", string(buildOut))
		runtime.EventsEmit(a.ctx, "terminal:data", string(buildOut))
		return fmt.Errorf("fehler beim Bauen des Images: %s\n%s", err, string(buildOut))
	}

	log.Println("📦 Docker-Command vorbereiten...")

	// docker run Befehl als String für conpty.Start (wichtig: -it Flag für interaktive Shell)
	cmdLine := fmt.Sprintf(`cmd.exe /C "winpty docker run --rm --name %s -it %s bash -l"`, containerName, imageName)
	ptyMaster, err := conpty.Start(cmdLine)

	log.Printf("🖥️ Starte ConPTY mit Befehl: %s\n", cmdLine)

	//ptyMaster, err := conpty.Start(cmdLine)
	if err != nil {
		log.Println("❌ ConPTY Start fehlgeschlagen:", err)
		return fmt.Errorf("ConPTY start error: %w", err)
	}

	a.ptyFile = ptyMaster
	a.stdin = ptyMaster

	log.Println("✅ ConPTY erfolgreich gestartet!")
	runtime.EventsEmit(a.ctx, "terminal:data", "[ConPTY erfolgreich gestartet!]")

	// Beispiel-Eingabe nach 2 Sekunden senden
	go func() {
		time.Sleep(2 * time.Second)
		_, _ = ptyMaster.Write([]byte("echo Hello from Kali\n"))
	}()

	// Ausgabe lesen und an UI senden
	go func() {
		log.Println("📡 Starte Ausgabe-Stream zur UI...")
		buf := make([]byte, 1024)
		for {
			n, err := ptyMaster.Read(buf)
			if err != nil {
				log.Println("❌ ConPTY read error:", err)
				return
			}
			data := string(buf[:n])
			log.Printf("📤 OUTPUT [%d bytes]: %s\n", n, data)
			runtime.EventsEmit(a.ctx, "terminal:data", data)
		}
	}()

	return nil
}
