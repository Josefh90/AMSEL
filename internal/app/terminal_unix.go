//go:build !windows
// +build !windows

package app

import (
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/creack/pty"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) StartTerminal(containerName string) error {
	// (build-image logic stays here…)
	imageName := "my-kali-image"

	// Prepare `docker run … bash -i`
	a.cmd = exec.Command(
		"docker", "run", "--rm", "--name", containerName,
		"-i", imageName, "bash", "-l",
	)
	a.cmd.Env = append(os.Environ(), "COLUMNS=120", "LINES=40")

	// Only this file builds on non‑Windows, so we can import creack/pty safely
	ptmx, err := pty.Start(a.cmd)
	if err != nil {
		return fmt.Errorf("pty start error: %w", err)
	}
	a.ptyFile = ptmx
	a.stdin = ptmx

	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := ptmx.Read(buf)
			if err != nil {
				log.Println("Unix PTY read error:", err)
				return
			}
			runtime.EventsEmit(a.ctx, "terminal:data", string(buf[:n]))
		}
	}()
	return nil
}
