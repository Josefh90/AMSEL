package app

import (
	"context"

	hydra "my-project/internal/services"
	utils_git "my-project/internal/utils"
)

type App struct {
	HydraService *hydra.Hydra
}

func MyApp() *App {
	return &App{
		HydraService: hydra.NewHydra(),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.HydraService.Ctx = ctx
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
	opts := utils_git.GitFetchOptions{
		RepoURL:         "https://github.com/danielmiessler/SecLists",
		Branch:          "master",
		DestinationPath: "./seclists",
		Folders:         []string{},
		PullOnlyFolders: true,
		Overwrite:       false,
	}
	return utils_git.FetchRepoFolders(a.HydraService.Ctx, opts)
}
