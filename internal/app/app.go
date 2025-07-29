package app

import (
	"context"
	"log"
	"os"
	"os/exec"

	hydra "my-project/internal/services"
	//utils_git "my-project/internal/utils"
	//testfunc "my-project/internal"
	//"github.com/creack/pty"

	"strings"

	gobox_utils "github.com/Josefh90/gobox"

	"fmt"
	"io"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	HydraService *hydra.Hydra
	ctx          context.Context

	cmd   *exec.Cmd
	stdin io.WriteCloser // ⬅️ HIER hinzufügen!
}

func MyApp() *App {
	return &App{
		HydraService: hydra.NewHydra(),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.HydraService.Ctx = ctx
	a.ctx = ctx
	log.Println("✅ Context gesetzt in startup")
	runtime.EventsEmit(ctx, "terminal:data", "🎉 Terminal Ready\n")

	// Listen to input events and write to terminal
	runtime.EventsOn(ctx, "terminal:input", func(data ...interface{}) {
		if len(data) == 0 {
			return
		}
		input, ok := data[0].(string)
		if ok {
			gobox_utils.WriteToTerminal(input)
		}
	})
}

func (a *App) DockerBuild() (string, error) {
	return a.HydraService.DockerBuild()
}

func (a *App) RunDockerContainer() error {
	return a.HydraService.RunDockerContainer()
}

func (a *App) RunCommand(input string) string {
	return a.HydraService.RunCommand(input)
}

func (a *App) PullSecLists() error {
	opts := gobox_utils.GitFetchOptions{
		RepoURL:         "https://github.com/danielmiessler/SecLists",
		Branch:          "master",
		DestinationPath: "./wordlists",
		Folders:         []string{"Discovery", "Fuzzing", "Passwords", "Web-Shells", "Miscellaneous", "Pattern-Matching", "Payloads", "Usernames", "Ai/LLM_Testing"},
		PullOnlyFolders: true,
		Overwrite:       false,
		OnProgress: func(p int, msg string) {
			runtime.EventsEmit(a.ctx, "progress", map[string]interface{}{
				"progress": p,
				"message":  msg,
			})
		},
	}
	return gobox_utils.FetchRepoFolders(opts)
}

func (a *App) TestFunction(root string) (interface{}, error) {
	//node, err := gobox_utils.DirToJSON(root)
	//if err != nil {
	//	return nil, err
	//}
	return root, nil
}

func getProjectRoot() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	// zurück vom build/bin zur Projektwurzel
	return filepath.Abs(filepath.Join(filepath.Dir(exePath), "..", ".."))
}

func (a *App) StartTerminal(containerName string) error {
	//dockerRun := fmt.Sprintf("docker run --rm --name %s -i kali", containerName)
	imageName := "my-kali-image"
	projectRoot, err := getProjectRoot()

	// ✅ Baue das Docker-Image, falls es nicht da ist
	buildCmd := exec.Command("docker", "build", "-t", imageName, ".")
	buildCmd.Dir = projectRoot // Ordner, wo dein Dockerfile liegt
	buildOut, err := buildCmd.CombinedOutput()
	if err != nil {
		log.Println("Build output:", string(buildOut))
		runtime.EventsEmit(a.ctx, "terminal:data", string(buildOut))
		return fmt.Errorf("fehler beim Bauen des Images: %s\n%s", err, string(buildOut))
	}

	//a.cmd = exec.Command("docker", "run", "--rm", "--name", containerName, "-i", "my-kali-image")
	a.cmd = exec.Command("docker", "run", "--rm", "--name", containerName, "-i", "my-kali-image", "bash", "-i")
	a.cmd.Env = append(os.Environ(),
		"COLUMNS=120",
		"LINES=40",
	)

	stdout, err := a.cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe error: %w", err)
	}

	stderr, err := a.cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("stderr pipe error: %w", err)
	}

	stdin, err := a.cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("stdin pipe error: %w", err)
	}
	a.stdin = stdin

	// Starte Container
	if err := a.cmd.Start(); err != nil {
		return fmt.Errorf("cmd start error: %w", err)
	}

	// Kombiniere stdout + stderr
	go a.streamOutput(stdout)
	go a.streamOutput(stderr)

	return nil
}

func (a *App) streamOutput(reader io.ReadCloser) {
	log.Println("📡 Starting streamOutput...") // <---

	buf := make([]byte, 1024)
	for {
		n, err := reader.Read(buf)
		if err != nil {
			log.Println("❌ Read error:", err)
			break
		}
		//data := string(buf[:n])
		data := string(buf[:n]) // raw output including ANSI codes
		log.Println(">", data)
		runtime.EventsEmit(a.ctx, "terminal:data", data)

		//runtime.EventsEmit(a.ctx, "terminal:data", buf[:n])
	}
}

// Empfängt Eingaben vom Frontend
func (a *App) SendInput(input string) {
	if a.stdin != nil {
		// ls automatisch erweitern
		if input == "ls" {
			input = "ls --color=always -C"
		}
		_, err := io.WriteString(a.stdin, input+"\n")
		if err != nil {
			log.Println("Fehler beim Schreiben an stdin:", err)
		}
	}
}

func (a *App) GetCompletion(fullInput string) string {
	containerName := "hydra-container"

	// Extrahiere das letzte Argument (z. B. "cd v" → "v")
	parts := strings.Fields(fullInput)
	if len(parts) == 0 {
		return ""
	}
	lastArg := parts[len(parts)-1]

	cmd := exec.Command("docker", "exec", containerName,
		"bash", "-c", fmt.Sprintf("compgen -A file -o dirnames -- '%s'", lastArg),
	)

	out, err := cmd.Output()
	if err != nil {
		log.Println("compgen error:", err)
		return ""
	}

	// Treffer auswerten
	lines := strings.Split(string(out), "\n")
	if len(lines) == 0 || lines[0] == "" {
		return fullInput
	}
	suggestion := lines[0]

	// Rekonstruiere ursprünglichen Befehl mit Autocomplete
	parts[len(parts)-1] = suggestion
	return strings.Join(parts, " ")
}
