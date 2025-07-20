package hydra

import (
	"context"
	"fmt"
	"log"
	"os/exec"
	"runtime"
	"time"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// Hydra is a simple service struct (could later hold config etc.)
type Hydra struct {
	Ctx context.Context
}

// NewHydra creates a new Hydra service instance
func NewHydra() *Hydra {
	return &Hydra{}
}

// DockerBuild builds the Docker image
func (h *Hydra) DockerBuild() (string, error) {
	cmd := exec.Command("docker", "build", "-t", "kali", ".")

	cmd.Dir = "internal/services"
	log.Println("Running Docker build command:", cmd.String())
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func (a *Hydra) RunDockerContainer() error {
	timestamp := time.Now().Format("20060102-150405")
	containerName := "hydra-" + timestamp

	var cmd *exec.Cmd
	dockerRunCmd := fmt.Sprintf("docker run --rm --name %s -it kali", containerName)

	log.Default().Println("[Hydra] Starte Container mit Name:", containerName)

	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/C", "start", "cmd.exe", "/K", dockerRunCmd)
	case "linux":
		cmd = exec.Command("gnome-terminal", "--", "bash", "-c", dockerRunCmd+"; exec bash")
	case "darwin":
		cmd = exec.Command("osascript", "-e", `tell application "Terminal" to do script "`+dockerRunCmd+`"`)
	default:
		return fmt.Errorf("unsupported OS")
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start terminal: %w", err)
	}

	wailsRuntime.EventsEmit(a.Ctx, "docker-exit", "Docker container '"+containerName+"' exited.")

	return nil
}

func (a *Hydra) RunCommand(input string) string {
	cmd := exec.Command("bash", "-c", input) // oder "cmd", "/C", input auf Windows
	output, err := cmd.CombinedOutput()
	if err != nil {
		return err.Error() + "\n" + string(output)
	}
	return string(output)
}
