package utils

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

// App struct holds the Wails app context
type App struct {
	ctx context.Context
}

// Startup initializes the app with the given context
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// GitFetchOptions defines options for fetching a GitHub repository
type GitFetchOptions struct {
	RepoURL         string   // The GitHub repository URL
	Branch          string   // The branch to fetch (default is "master")
	DestinationPath string   // Local path to save downloaded content
	Folders         []string // Specific folders to download
	PullOnlyFolders bool     // Whether to only pull folders (ignore files)
	Overwrite       bool     // Whether to overwrite existing files
}

// PullSecLists initializes a fetch for the SecLists repo using default options
func (a *App) PullSecLists() {
	opts := GitFetchOptions{
		RepoURL:         "https://github.com/danielmiessler/SecLists",
		Branch:          "master",
		DestinationPath: "./seclists",
		PullOnlyFolders: true,
		Overwrite:       false,
	}

	// Run fetch in a separate goroutine
	//go func() {
	err := FetchRepoFolders(a.ctx, opts)
	if err != nil {
		runtime.EventsEmit(a.ctx, "progress", map[string]interface{}{
			"progress": 100,
			"message":  "Download failed: " + err.Error(),
		})
	}
	//}()
}

// FetchRepoFolders fetches and downloads specified folders from a GitHub repo
func FetchRepoFolders(ctx context.Context, opts GitFetchOptions) error {
	fmt.Println("⚙️ Starting FetchRepoFolders...")

	// Set default branch if empty
	if opts.Branch == "" {
		opts.Branch = "main"
		fmt.Println("No branch specified. Defaulting to 'main'")
	}

	fmt.Printf("Repo URL: %s\n", opts.RepoURL)

	// Extract user and repo name from URL
	parts := strings.Split(strings.TrimPrefix(opts.RepoURL, "https://github.com/"), "/")
	if len(parts) < 2 {
		err := fmt.Errorf("invalid repo URL: %s", opts.RepoURL)
		fmt.Println("Error:", err)
		return err
	}
	user, repo := parts[0], parts[1]
	fmt.Printf("Parsed user: %s, repo: %s, branch: %s\n", user, repo, opts.Branch)

	// Notify frontend of progress
	runtime.EventsEmit(ctx, "progress", map[string]interface{}{
		"progress": 5,
		"message":  "Fetching folder list...",
	})

	// If no folders are specified, fetch all top-level folders
	if len(opts.Folders) == 0 {
		fmt.Println("No folders specified, fetching top-level folders...")
		allFolders, err := getTopLevelFolders(user, repo, opts.Branch, opts.PullOnlyFolders)
		if err != nil {
			fmt.Println("Error fetching folders:", err)
			return err
		}
		opts.Folders = allFolders
		fmt.Printf("Found folders: %v\n", opts.Folders)
	} else {
		fmt.Printf("Using specified folders: %v\n", opts.Folders)
	}

	total := len(opts.Folders)
	fmt.Printf("Starting folder download (%d folders)\n", total)
	for i, folder := range opts.Folders {
		// Progress message
		msg := fmt.Sprintf("Downloading folder: %s", folder)
		pct := calcPercent(i, total)

		fmt.Printf("⬇️ [%d/%d] %s (%d%%)\n", i+1, total, folder, pct)

		// Download folder
		err := downloadFolder(folder, user, repo, opts.Branch, opts.DestinationPath, opts.Overwrite)
		runtime.EventsEmit(ctx, "progress", map[string]interface{}{
			"progress": pct,
			"message":  msg,
		})

		if err != nil {
			fmt.Printf("Error downloading folder %s: %v\n", folder, err)
			return err
		}
	}

	fmt.Println("✅ All folders downloaded successfully!")

	// Final progress event
	runtime.EventsEmit(ctx, "progress", map[string]any{
		"progress": 100,
		"message":  "Download complete",
	})

	return nil
}

// calcPercent calculates a percentage for progress display
func calcPercent(i, total int) int {
	if total == 0 {
		return 100
	}
	return int(float64(i+1) / float64(total) * 100)
}

// getTopLevelFolders queries the GitHub API for top-level folders of a repo
func getTopLevelFolders(user, repo, branch string, onlyDirs bool) ([]string, error) {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/?ref=%s", user, repo, branch)

	// Send GET request to GitHub API
	resp, err := http.Get(apiURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Handle non-200 status codes
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("GitHub API error: %s", resp.Status)
	}

	// Decode JSON response
	var contents []struct {
		Name string `json:"name"`
		Type string `json:"type"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&contents); err != nil {
		return nil, err
	}

	// Collect folder names (skip files if onlyDirs is true)
	var results []string
	for _, item := range contents {
		if onlyDirs && item.Type != "dir" {
			continue
		}
		results = append(results, item.Name)
	}
	return results, nil
}

// downloadFolder downloads all files in a given folder from GitHub
func downloadFolder(folder, user, repo, branch, destPath string, overwrite bool) error {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s?ref=%s", user, repo, folder, branch)

	// Fetch folder content metadata from GitHub
	resp, err := http.Get(apiURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("GitHub API error: %s", resp.Status)
	}

	// Parse response JSON
	var files []struct {
		Name        string `json:"name"`
		Path        string `json:"path"`
		Type        string `json:"type"`
		DownloadURL string `json:"download_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&files); err != nil {
		return err
	}

	// Download each file
	for _, file := range files {
		if file.Type != "file" {
			continue // skip directories
		}

		targetPath := filepath.Join(destPath, file.Path)

		// Skip if file exists and overwrite is false
		if !overwrite {
			if _, err := os.Stat(targetPath); err == nil {
				fmt.Println("Skipping (already exists):", targetPath)
				continue
			}
		}

		// Ensure target folder exists
		if err := os.MkdirAll(filepath.Dir(targetPath), os.ModePerm); err != nil {
			return err
		}

		// Create file on disk
		out, err := os.Create(targetPath)
		if err != nil {
			return err
		}
		defer out.Close()

		// Download file content
		res, err := http.Get(file.DownloadURL)
		if err != nil {
			return err
		}
		defer res.Body.Close()

		// Copy data into file
		_, err = io.Copy(out, res.Body)
		if err != nil {
			return err
		}

		fmt.Println("Downloaded:", file.Path)
	}
	return nil
}
