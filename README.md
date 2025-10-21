# Jira Optimizer Extension

Chrome and Firefox extension that enhances Jira Cloud and Server with expandable modals, linked issue viewing, and image expansion.

View on [Chrome Web Store](https://chromewebstore.google.com/detail/occanfpdiglllenbekgbnhijeoincilf) | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/jira-optimizer/).

## Features

- **Collapse right panel**: Reduces the right sidebar in Jira
- **Expand create modal**: Increases the size of issue creation modals
- **View linked issues**: Shows linked issues directly in the interface
- **Expand images**: Allows expanding attached images in tickets

## Compatibility

This extension has been tested and is compatible with:

- Latest versions of Google Chrome
- Latest versions of Mozilla Firefox

## Development

### What's in this directory

- `config/`: Webpack configuration for this project.
- `public/`: Popup files and static assets (icons, locales).
- `src/`: Source files for the extension, including features, background scripts, and content scripts.
- `build-chrome/`: Chrome build output (created after `npm run build`).
- `build-firefox/`: Firefox build output (created after `npm run build`).
- `.gitignore`: Lists files to be ignored in your Git repo.
- `package.json`: Contains project configuration, scripts, and dependencies.

### Test the extension

#### For Chrome

1. `npm run watch` (starts development mode with watch)
2. Open [chrome://extensions](chrome://extensions)
3. Enable developer mode (top right corner)
4. Click "Load unpacked extension" (top left corner)
5. Select the `build-chrome` directory

#### For Firefox

1. `npm run watch` (starts development mode with watch)
2. Open [about:debugging](about:debugging)
3. Click "This Firefox" (sidebar menu)
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file in the `build-firefox` directory

### Bundle the extension

To package the source code into static files for the stores, run:

- `npm run build` (generates builds for Chrome and Firefox simultaneously)

The builds will be created in the directories:

- `build-chrome/` - For Chrome Web Store
- `build-firefox/` - For Firefox Add-ons

### Documentation

Refer to [Chrome developer documentation](https://developer.chrome.com/docs/extensions/mv3/getstarted/) to get started.

For Firefox, see [Firefox extensions documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions).

### VSCode developer tools

Refer to [github.com/gadhagod/vscode-chrome-extension-developer-tools/blob/master/README.md#commands](https://github.com/gadhagod/vscode-chrome-extension-developer-tools/blob/master/README.md#commands).

## Contributions

Contributions are welcome! Feel free to fork the repository and submit your pull requests.

---

By [box4.dev](https://box4.dev).
