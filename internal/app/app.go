package app

import (
	"context"

	hydra "my-project/internal/services"
	//utils_git "my-project/internal/utils"
	testfunc "my-project/internal"

	gobox_utils "github.com/Josefh90/gobox"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	HydraService *hydra.Hydra
	ctx          context.Context
}

func MyApp() *App {
	return &App{
		HydraService: hydra.NewHydra(),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.HydraService.Ctx = ctx
	a.ctx = ctx
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
		DestinationPath: "./seclists",
		Folders:         []string{},
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
	node, err := testfunc.DirToJSON(root)
	if err != nil {
		return nil, err
	}
	return node, nil
}
