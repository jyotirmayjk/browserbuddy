# OpenAI Query Extension

A powerful Chrome extension that seamlessly integrates OpenAI's GPT-3.5-turbo API into your browsing experience, allowing you to query AI about any selected text or images on web pages.

## 🌟 Features

### 🔍 Context-Aware AI Queries
- **Text Selection**: Right-click on any selected text to ask AI questions about it
- **Image Analysis**: Right-click on images to ask questions about visual content
- **Smart Context**: Automatically includes selected content as context for more relevant responses

### 🎯 Multiple Interaction Methods
- **Popup Interface**: Quick access through the extension popup for general queries
- **Context Menu**: Right-click integration for content-specific questions
- **Keyboard Shortcuts**: Enter key to submit queries, Escape to cancel

### 🔒 Secure API Key Management
- **Local Storage**: API keys are securely stored in Chrome's sync storage
- **Password Field**: API keys are masked for privacy
- **One-Time Setup**: Save your API key once and use it across all features

### 💬 Real-Time AI Responses
- **Live Chat Interface**: Modern dialog boxes that appear directly on web pages
- **Loading States**: Visual feedback during API requests
- **Error Handling**: Clear error messages for troubleshooting

## 🚀 Installation

### Prerequisites
- Google Chrome browser
- OpenAI API key (get one at [OpenAI Platform](https://platform.openai.com/))

### Installation Steps

1. **Download the Extension**
   - Clone or download this repository to your local machine
   - Extract the files to a folder

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the extension folder

3. **Set Up API Key**
   - Click the extension icon in your Chrome toolbar
   - Enter your OpenAI API key in the popup
   - Click "Save API Key"

## 📖 Usage Guide

### Method 1: Popup Interface
1. Click the extension icon in your Chrome toolbar
2. Enter your query in the text area
3. Click "Submit Query" or press Enter
4. View the AI response in the popup

### Method 2: Context Menu (Recommended)
1. **For Text**: Select any text on a webpage, right-click, and choose "Ask about selected text"
2. **For Images**: Right-click on any image and choose "Ask about this image"
3. A dialog box will appear with the selected content as context
4. Enter your question and click "Ask AI"
5. The response appears directly on the page

### Keyboard Shortcuts
- **Enter**: Submit query (without Shift key)
- **Shift + Enter**: New line in text area
- **Escape**: Close dialog box

## 🔧 Technical Details

### Architecture
- **Manifest V3**: Built with the latest Chrome extension manifest version
- **Service Worker**: Background script handles context menu creation and message routing
- **Content Scripts**: Injected into web pages for seamless integration
- **Popup Interface**: Standalone interface for general queries

### API Integration
- **Model**: GPT-3.5-turbo
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Context Preservation**: Selected content is automatically included in prompts
- **Error Handling**: Comprehensive error handling for API failures

### Security Features
- **API Key Protection**: Keys are stored securely in Chrome's sync storage
- **No Data Collection**: Extension doesn't collect or store user data
- **Local Processing**: All queries are processed locally before API calls

## 📁 File Structure

```
chrome-openai-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface HTML
├── popup.js              # Popup functionality
├── content.js            # Content script for web page integration
├── background.js         # Service worker for background tasks
└── styles.css            # Extension styling
```

### Key Components

- **`manifest.json`**: Defines permissions, scripts, and extension metadata
- **`popup.html/js`**: Provides a standalone interface for AI queries
- **`content.js`**: Creates floating dialog boxes on web pages
- **`background.js`**: Manages context menus and message routing
- **`styles.css`**: Consistent styling across all interfaces

## ⚙️ Configuration

### Permissions
- `storage`: For API key management
- `contextMenus`: For right-click menu integration
- `activeTab`: For accessing current page content
- `scripting`: For dynamic content script injection
- `host_permissions`: For API calls to OpenAI

### Customization
The extension uses GPT-3.5-turbo by default, but you can modify the model in the code:
- Change `model: "gpt-3.5-turbo"` to other available models
- Adjust `temperature` value (0.0-2.0) for different response styles

## 🐛 Troubleshooting

### Common Issues

**"API key not found"**
- Ensure you've saved your API key in the popup interface
- Check that the key is valid and has sufficient credits

**"Content script not ready"**
- Refresh the webpage and try again
- The extension automatically injects content scripts as needed

**"API request failed"**
- Verify your OpenAI API key is correct
- Check your internet connection
- Ensure you have sufficient API credits

### Debug Mode
Open Chrome DevTools and check the console for detailed error messages and extension logs.

## 🔄 Updates and Maintenance

### Version History
- **v1.0**: Initial release with text and image query support

### Future Enhancements
- Support for additional AI models
- Custom prompt templates
- Response history
- Export functionality
- Dark mode support

## 📄 License

This project is open source. Please refer to the license file for detailed terms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## ⚠️ Disclaimer

This extension requires an OpenAI API key and will incur costs based on your usage. Please review OpenAI's pricing and terms of service before use.

## 📞 Support

For issues, questions, or feature requests, please open an issue in the project repository.

---

**Happy AI-powered browsing! 🚀** 