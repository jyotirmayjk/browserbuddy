# Chrome Prompt API Query Extension

A Chrome extension that uses the experimental Prompt API to tap into the browser’s built-in language model. Ask questions about any selected text or images on a page without managing cloud API keys.

## 🌟 Features

- **Context-aware dialogs**: Right-click highlighted text or images to open a floating dialog that already includes the selected content.
- **Toolbar popup**: Ask ad-hoc questions from the extension icon—no setup or API key required.
- **On-device / Chrome-managed models**: Uses `LanguageModel.create()` and `session.prompt()` instead of external HTTP requests.
- **Keyboard friendly**: `Enter` submits prompts (use `Shift+Enter` for a newline) and `Esc` closes dialogs.

## 🚀 Requirements & Installation

- Use a Chrome build that exposes the Prompt API (currently Canary/Dev with `chrome://flags/#prompt-api` enabled). See the [Prompt API explainer](https://webmachinelearning.github.io/prompt-api/) for the latest status.
- Clone or download this repository.
- Visit `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the project folder.

## 📖 Usage

### Context menu (recommended)
1. Highlight text or right-click an image on any webpage.
2. Choose **“Ask about selected text”** or **“Ask about this image.”**
3. Type your question; the dialog automatically references the selected content.

### Toolbar popup
1. Click the extension icon in Chrome’s toolbar.
2. Enter any question and click **Ask Chrome AI**.
3. Responses appear directly in the popup.

## 🔧 Technical Details

- **Manifest V3** service worker (`background.js`) registers context menus and injects `content.js` as needed.
- **`content.js`** uses `LanguageModel.create()` / `session.prompt()` to query Chrome’s built-in model, weaving in selected text or image URLs.
- **`popup.js`** mirrors that flow in the popup UI and surfaces availability/download status via `LanguageModel.availability()` when supported.
- **Permissions** are minimal: `contextMenus`, `activeTab`, and `scripting`, plus `<all_urls>` so the content script can operate across pages. No storage of API keys.

## 📁 Project Structure

```
chrome-openai-extension/
├── manifest.json      # Extension configuration and permissions
├── background.js      # Context menu + messaging logic
├── content.js         # In-page dialog powered by the Prompt API
├── popup.html/js      # Toolbar UI for ad-hoc prompts
└── styles.css         # Popup styling
```

## 🐛 Troubleshooting

- **“Prompt API unavailable”**: Make sure you’re on a supported Chrome build and enable the flag mentioned above.
- **“Content script not ready”**: Refresh the page so the background script can reinject `content.js`.
- **“Model download needed”**: Chrome may report `downloadable` or `downloading`; give it time to cache the on-device model.

## 📄 License & Contributions

This project is open source—see `LICENSE` for details. Contributions are welcome; open an issue or submit a pull request with improvements or bug fixes.

---

**Happy browsing with Chrome’s Prompt API! 🚀**