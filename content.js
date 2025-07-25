console.log('Content script loading...');

// Store state in window object to persist across reloads
window.openAiExtension = window.openAiExtension || {
  initialized: false,
  currentDialog: null
};

function initializeExtension() {
  if (window.openAiExtension.initialized) {
    console.log('Extension already initialized');
    return;
  }

  console.log('Initializing extension...');

  // Create styles if they don't exist
  if (!document.getElementById('openai-extension-styles')) {
    const style = document.createElement('style');
    style.id = 'openai-extension-styles';
    style.textContent = `
      .openai-query-dialog {
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        min-width: 300px;
        max-width: 500px;
      }
      .openai-query-input {
        width: 100%;
        height: 80px;
        margin-bottom: 10px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: inherit;
        font-size: 14px;
      }
      .openai-query-buttons {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .openai-query-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .openai-query-button:hover {
        opacity: 0.9;
      }
      .openai-query-submit {
        background: #4CAF50;
        color: white;
      }
      .openai-query-cancel {
        background: #f1f1f1;
        color: #333;
      }
      .openai-response-box {
        margin-top: 12px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;
        max-height: 300px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      .openai-error {
        color: #d32f2f;
        margin-top: 8px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
    console.log('Styles injected');
  }

  function removeExistingDialog() {
    if (window.openAiExtension.currentDialog) {
      try {
        window.openAiExtension.currentDialog.remove();
      } catch (e) {
        console.log('Error removing existing dialog:', e);
      }
      window.openAiExtension.currentDialog = null;
    }
  }

  function createDialog(x, y, context) {
    removeExistingDialog();

    const dialog = document.createElement('div');
    dialog.className = 'openai-query-dialog';
    
    // Position dialog in the center of the viewport by default
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dialogWidth = 400; // Approximate width
    const dialogHeight = 300; // Approximate height
    
    const leftPos = Math.max(0, Math.floor((viewportWidth - dialogWidth) / 2));
    const topPos = Math.max(0, Math.floor((viewportHeight - dialogHeight) / 2));
    
    dialog.style.left = `${leftPos}px`;
    dialog.style.top = `${topPos}px`;

    dialog.innerHTML = `
      <textarea 
        class="openai-query-input" 
        placeholder="Enter your question about the selected text..."
      ></textarea>
      <div class="openai-query-buttons">
        <button class="openai-query-button openai-query-cancel">Cancel</button>
        <button class="openai-query-button openai-query-submit">Ask AI</button>
      </div>
      <div class="openai-response-box" style="display: none;"></div>
    `;

    const textarea = dialog.querySelector('.openai-query-input');
    const submitButton = dialog.querySelector('.openai-query-submit');
    const cancelButton = dialog.querySelector('.openai-query-cancel');
    const responseBox = dialog.querySelector('.openai-response-box');

    async function handleSubmit() {
      const query = textarea.value.trim();
      if (!query) return;

      submitButton.disabled = true;
      submitButton.textContent = 'Loading...';
      responseBox.style.display = 'block';
      responseBox.textContent = 'Getting response...';

      try {
        const result = await chrome.storage.sync.get(['openai_api_key']);
        const apiKey = result.openai_api_key;

        if (!apiKey) {
          throw new Error('Please set your OpenAI API key in the extension popup first.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "user",
              content: `Context: "${context}"\nQuestion: ${query}`
            }],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'API request failed');
        }

        const data = await response.json();
        responseBox.textContent = data.choices[0].message.content;
      } catch (error) {
        console.error('Error in handleSubmit:', error);
        responseBox.innerHTML = `<div class="openai-error">Error: ${error.message}</div>`;
      } finally {
        if (dialog.isConnected) {
          submitButton.disabled = false;
          submitButton.textContent = 'Ask AI';
        }
      }
    }

    submitButton.addEventListener('click', handleSubmit);
    cancelButton.addEventListener('click', removeExistingDialog);
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') {
        removeExistingDialog();
      }
    });

    document.body.appendChild(dialog);
    window.openAiExtension.currentDialog = dialog;

    // Focus the textarea after a short delay
    setTimeout(() => {
      try {
        textarea.focus();
      } catch (e) {
        console.log('Could not focus textarea:', e);
      }
    }, 50);
  }

  // Handle messages from background script
  function handleMessage(message, sender, sendResponse) {
    if (message.action === "showQueryDialog") {
      try {
        createDialog(
          window.innerWidth / 2,
          window.innerHeight / 2,
          message.context
        );
        sendResponse({ success: true });
      } catch (error) {
        console.error('Error showing dialog:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }
  }

  // Remove any existing listeners and add new one
  try {
    chrome.runtime.onMessage.removeListener(handleMessage);
  } catch (e) {
    console.log('No existing message listener to remove');
  }

  chrome.runtime.onMessage.addListener(handleMessage);
  
  window.openAiExtension.initialized = true;
  console.log('Extension initialized successfully');
}

// Initialize on load
initializeExtension();

// Re-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initializeExtension);

// Re-initialize on dynamic page updates
const observer = new MutationObserver(() => {
  if (!window.openAiExtension.initialized) {
    initializeExtension();
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
}); 