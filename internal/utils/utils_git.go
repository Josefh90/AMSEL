package gitUtils

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx context.Context
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

type GitFetchOptions struct {
	RepoURL         string
	Branch          string
	DestinationPath string
	Folders         []string
	PullOnlyFolders bool
	Overwrite       bool
}

func (a *App) PullSecLists() error {
	opts := GitFetchOptions{
		RepoURL:         "https://github.com/danielmiessler/SecLists",
		Branch:          "master",
		DestinationPath: "./seclists",
		Folders:         []string{},
		PullOnlyFolders: true,
		Overwrite:       false,
	}
	return FetchRepoFolders(a.ctx, opts)
}

func FetchRepoFolders(ctx context.Context, opts GitFetchOptions) error {
	if opts.Branch == "" {
		opts.Branch = "master"
	}

	parts := strings.Split(strings.TrimPrefix(opts.RepoURL, "https://github.com/"), "/")
	if len(parts) < 2 {
		return fmt.Errorf("invalid repo URL: %s", opts.RepoURL)
	}
	user, repo := parts[0], parts[1]

	runtime.EventsEmit(ctx, "progress", map[string]interface{}{
		"progress": 5,
		"message":  "Fetching folder list...",
	})

	if len(opts.Folders) == 0 {
		allFolders, err := getTopLevelFolders(user, repo, opts.Branch, opts.PullOnlyFolders)
		if err != nil {
			return err
		}
		opts.Folders = allFolders
	}

	total := len(opts.Folders)
	for i, folder := range opts.Folders {
		msg := fmt.Sprintf("Downloading folder: %s", folder)
		pct := calcPercent(i, total)

		runtime.EventsEmit(ctx, "progress", map[string]interface{}{
			"progress": pct,
			"message":  msg,
		})

		err := downloadFolder(folder, user, repo, opts.Branch, opts.DestinationPath, opts.Overwrite)
		if err != nil {
			return err
		}
	}

	runtime.EventsEmit(ctx, "progress", map[string]interface{}{
		"progress": 100,
		"message":  "Download complete ✅",
	})

	return nil
}

func calcPercent(i, total int) int {
	if total == 0 {
		return 100
	}
	return int(float64(i+1) / float64(total) * 100)
}

func getTopLevelFolders(user, repo, branch string, onlyDirs bool) ([]string, error) {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/?ref=%s", user, repo, branch)

	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("GitHub API error: %s", resp.Status)
	}

	var contents []struct {
		Name string `json:"name"`
		Type string `json:"type"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&contents); err != nil {
		return nil, err
	}

	var results []string
	for _, item := range contents {
		if onlyDirs && item.Type != "dir" {
			continue
		}
		results = append(results, item.Name)
	}
	return results, nil
}

func downloadFolder(folder, user, repo, branch, destPath string, overwrite bool) error {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s?ref=%s", user, repo, folder, branch)

	resp, err := http.Get(apiURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("GitHub API error: %s", resp.Status)
	}

	var files []struct {
		Name        string `json:"name"`
		Path        string `json:"path"`
		Type        string `json:"type"`
		DownloadURL string `json:"download_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&files); err != nil {
		return err
	}

	for _, file := range files {
		if file.Type != "file" {
			continue
		}

		targetPath := filepath.Join(destPath, file.Path)
		if !overwrite {
			if _, err := os.Stat(targetPath); err == nil {
				fmt.Println("Skipping (already exists):", targetPath)
				continue
			}
		}

		if err := os.MkdirAll(filepath.Dir(targetPath), os.ModePerm); err != nil {
			return err
		}

		out, err := os.Create(targetPath)
		if err != nil {
			return err
		}
		defer out.Close()

		res, err := http.Get(file.DownloadURL)
		if err != nil {
			return err
		}
		defer res.Body.Close()

		_, err = io.Copy(out, res.Body)
		if err != nil {
			return err
		}

		fmt.Println("Downloaded:", file.Path)
	}
	return nil
}
