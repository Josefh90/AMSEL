package main

import (
	"context"
	"fmt"
	"os/exec"
	"runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

/*Func (a *App) DockerBuild() (string, error) {
	cmd := exec.Command("docker", "build", "-t", "kali", ".")
	output, err := cmd.CombinedOutput()
	return string(output), err
} */

// After build, open terminal and run the docker container interactively
func (a *App) RunDockerContainer() error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		// Open cmd and run: docker run -it kali-hydra
		cmd = exec.Command("cmd", "/C", "start", "cmd.exe", "/K", "docker run -it kali")
	case "linux":
		// gnome-terminal example; adjust for your terminal emulator
		cmd = exec.Command("gnome-terminal", "--", "bash", "-c", "docker run -it kali; exec bash")
	case "darwin":
		cmd = exec.Command("osascript", "-e", `tell application "Terminal" to do script "docker run -it kali"`)
	default:
		return fmt.Errorf("unsupported OS")
	}

	return cmd.Start()
}
