package main

import (
	"embed"

	"my-project/internal/app"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	wailsApp := app.MyApp()

	err := wails.Run(&options.App{
		Title:  "my-project",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        wailsApp.Startup, // <- Kontext wird dort gesetzt
		Bind: []interface{}{
			wailsApp,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
