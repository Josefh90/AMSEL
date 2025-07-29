package app

import (
	"context"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"

	hydra "my-project/internal/services"

	gobox_utils "github.com/Josefh90/gobox"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	HydraService *hydra.Hydra
	ctx          context.Context
	cmd          *exec.Cmd
	stdin        io.WriteCloser
	ptyFile      io.Closer
}

func NewApp() *App {
	return &App{HydraService: hydra.NewHydra()}
}

func (a *App) WriteRaw(data string) {
	log.Println("🖥️ InputData:", data)
	io.WriteString(a.stdin, data)
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	runtime.EventsEmit(ctx, "terminal:data", "🎉 Terminal Ready\n")
	runtime.EventsOn(ctx, "terminal:input", func(data ...interface{}) {
		if input, ok := data[0].(string); ok {
			a.SendInput(input)
		}
	})
}

func (a *App) StopTerminal() error {
	if a.ptyFile != nil {
		a.ptyFile.Close()
	}
	if a.cmd != nil && a.cmd.Process != nil {
		return a.cmd.Process.Kill()
	}
	return nil
}

func (a *App) SendInput(input string) {
	if a.stdin == nil {
		return
	}
	if input == "ls" {
		input = "ls --color=always -C"
	}
	if _, err := io.WriteString(a.stdin, input+"\n"); err != nil {
		log.Println("stdin write error:", err)
	}
}

func getProjectRoot() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	dir := filepath.Dir(exePath)
	return filepath.Abs(filepath.Join(dir, "..", ".."))
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
