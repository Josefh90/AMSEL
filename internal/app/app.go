package app

import (
	"context"
	"log"
	"os"
	"os/exec"
	"sync"
	"time"

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

type TerminalSession struct {
	Cmd    *exec.Cmd
	Stdin  io.WriteCloser
	Stdout io.ReadCloser
	Stderr io.ReadCloser
}

type App struct {
	HydraService *hydra.Hydra
	ctx          context.Context

	cmd       *exec.Cmd
	stdin     io.WriteCloser
	sessions  map[int]*TerminalSession
	sessionsM sync.Mutex
}

func MyApp() *App {
	return &App{
		HydraService: hydra.NewHydra(),
		sessions:     make(map[int]*TerminalSession),
	}
}

const (
	containerName = "hydra-container"
	imageName     = "my-kali-image"
)

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

func containerExists(name string) bool {
	check := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=^/%s$", name), "--format", "{{.Names}}")
	out, err := check.Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) == name
}

func removeContainer(name string) error {
	log.Printf("[Terminal] Container '%s' existiert bereits – wird entfernt", name)
	removeCmd := exec.Command("docker", "rm", "-f", name)
	out, err := removeCmd.CombinedOutput()
	if err != nil && strings.Contains(string(out), "removal of container") {
		log.Println("[Terminal] Container wird bereits entfernt – warte...")
		time.Sleep(2 * time.Second)
		out, err = removeCmd.CombinedOutput()
	}
	if err != nil {
		log.Println("❌ Fehler beim Entfernen:", err)
		log.Println("🧾 Output:", string(out))
		return err
	}
	return nil
}

// EnsureContainerRunning checks if container is running, starts if needed
func (a *App) EnsureContainerRunning(containerName string) error {
	if err := a.buildImageIfNeeded(); err != nil {
		return err
	}

	// 1. Check if container is running
	check := exec.Command("docker", "inspect", "-f", "{{.State.Running}}", containerName)
	out, err := check.Output()
	if err == nil && strings.TrimSpace(string(out)) == "true" {
		log.Println("✅ Container is already running:", containerName)
		return nil
	}

	// 2. Remove stale container if exists
	existsCmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=^/%s$", containerName), "--format", "{{.ID}}")
	existsOut, err := existsCmd.Output()
	existing := strings.TrimSpace(string(existsOut))

	if existing != "" {
		log.Printf("⚠️ Container '%s' exists but not running — removing...\n", containerName)
		rm := exec.Command("docker", "rm", "-f", containerName)
		if rmOut, err := rm.CombinedOutput(); err != nil {
			log.Println("❌ Could not remove container:", err)
			log.Println("Output:", string(rmOut))
			return fmt.Errorf("could not remove existing container: %w", err)
		}
		log.Println("🧹 Removed stale container.")
	}

	// 3. Start container
	log.Println("🚀 Starting container:", containerName)
	startCmd := exec.Command("docker", "run", "--pull=never", "-d", "--name", containerName, imageName, "sleep", "infinity")
	startOut, err := startCmd.CombinedOutput()
	log.Printf("📤 Run output: %s", string(startOut)) // optional, helps debugging

	if err != nil {
		if strings.Contains(string(startOut), "Unable to find image") {
			log.Println("❌ Image not found locally. Did buildImageIfNeeded() succeed?")
		}
		log.Printf("❌ Failed to start container: %v\nOutput: %s\n", err, startOut)
		return fmt.Errorf("failed to start container: %w", err)
	}

	log.Println("✅ Container started:", containerName)
	return nil
}

// StartTerminalSession launches a new `docker exec` shell
func (a *App) StartTerminalSession(terminalId int) error {
	containerName := fmt.Sprintf("hydra-container-%d", terminalId)
	if err := a.EnsureContainerRunning(containerName); err != nil {
		return err
	}

	cmd := exec.Command("docker", "exec", "-i", containerName, "bash", "-i")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		return err
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return err
	}

	session := &TerminalSession{
		Cmd:    cmd,
		Stdin:  stdin,
		Stdout: stdout,
		Stderr: stderr,
	}

	a.sessionsM.Lock()
	a.sessions[terminalId] = session
	a.sessionsM.Unlock()

	go a.streamOutput(terminalId, stdout)
	go a.streamOutput(terminalId, stderr)
	return nil
}

// CloseTerminal kills the exec session
func (a *App) CloseTerminal(terminalId int) {
	a.sessionsM.Lock()
	session, ok := a.sessions[terminalId]
	if ok {
		delete(a.sessions, terminalId)
	}
	a.sessionsM.Unlock()

	if ok && session.Cmd != nil {
		_ = session.Cmd.Process.Kill()
		log.Printf("🛑 Terminal session %d closed\n", terminalId)
	}
}

// Build image if not found
func (a *App) buildImageIfNeeded() error {
	check := exec.Command("docker", "images", "-q", imageName)
	out, err := check.Output()
	if err != nil || strings.TrimSpace(string(out)) == "" {
		log.Println("📦 Image not found locally. Building image:", imageName)

		projectRoot, err := getProjectRoot() // make sure this function is correct
		if err != nil {
			return fmt.Errorf("could not find project root: %w", err)
		}

		build := exec.Command("docker", "build", "-t", imageName, ".")
		build.Dir = projectRoot
		buildOut, err := build.CombinedOutput()
		if err != nil {
			log.Printf("❌ Failed to build image:\n%s", string(buildOut))
			return fmt.Errorf("docker build failed: %w", err)
		}

		log.Println("✅ Docker image built successfully.")
	}
	return nil
}

func (a *App) StartTerminal(containerName string) error {
	imageName := "my-kali-image"
	projectRoot, err := getProjectRoot()
	if err != nil {
		return err
	}

	if containerExists(containerName) {
		if err := removeContainer(containerName); err != nil {
			return fmt.Errorf("container existiert und konnte nicht entfernt werden: %w", err)
		}
	}

	// Image bauen (optional – falls noch nicht vorhanden)
	buildCmd := exec.Command("docker", "build", "-t", imageName, ".")
	buildCmd.Dir = projectRoot
	buildOut, err := buildCmd.CombinedOutput()
	if err != nil {
		log.Println("📦 Build output:", string(buildOut))
		runtime.EventsEmit(a.ctx, "terminal:data", string(buildOut))
		return fmt.Errorf("fehler beim Bauen: %w", err)
	}

	// Container starten
	a.cmd = exec.Command("docker", "run", "--rm", "--name", containerName, "-i", imageName, "bash", "-i")
	a.cmd.Env = append(os.Environ(), "COLUMNS=120", "LINES=40")

	//stdout, err := a.cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("stdout pipe error: %w", err)
	}
	//stderr, err := a.cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("stderr pipe error: %w", err)
	}
	stdin, err := a.cmd.StdinPipe()
	if err != nil {
		return fmt.Errorf("stdin pipe error: %w", err)
	}
	a.stdin = stdin

	if err := a.cmd.Start(); err != nil {
		return fmt.Errorf("cmd start error: %w", err)
	}

	// Stream Output
	//go a.streamOutput(1, stdout)
	//go a.streamOutput(1, stderr)

	return nil
}

func (a *App) streamOutput(terminalId int, pipe io.ReadCloser) {
	log.Printf("📡 Streaming output for terminal ID %d", terminalId)

	buf := make([]byte, 1024)
	for {
		n, err := pipe.Read(buf)
		if err != nil {
			if err != io.EOF {
				log.Printf("❌ Terminal %d read error: %v", terminalId, err)
			}
			break
		}
		output := string(buf[:n])
		log.Printf("📤 Terminal %d output: %s", terminalId, output) // ✅ <-- add this
		runtime.EventsEmit(a.ctx, "terminal:data", map[string]interface{}{
			"id":     terminalId,
			"output": output,
		})
	}
}

// Empfängt Eingaben vom Frontend
func (a *App) SendInput(terminalId int, input string) {
	log.Printf("📥 Sending input to terminal %d: %s", terminalId, input)

	a.sessionsM.Lock()
	session, ok := a.sessions[terminalId]
	a.sessionsM.Unlock()

	if !ok || session.Stdin == nil {
		log.Printf("❌ Kein gültiger Input-Stream für Terminal %d", terminalId)
		return
	}

	// Optional: automatisches ls-format
	if strings.HasPrefix(input, "ls") && !strings.Contains(input, "--color") {
		input = strings.Replace(input, "ls", "ls --color=always -C", 1)
	}

	_, err := io.WriteString(session.Stdin, input+"\n")
	if err != nil {
		log.Println("❌ Fehler beim Schreiben an stdin:", err)
	}
}

func (a *App) GetCompletion(terminalId int, fullInput string) string {
	containerName := fmt.Sprintf("hydra-container-%d", terminalId)

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

	lines := strings.Split(string(out), "\n")
	if len(lines) == 0 || lines[0] == "" {
		return fullInput
	}
	suggestion := lines[0]

	parts[len(parts)-1] = suggestion
	return strings.Join(parts, " ")
}
