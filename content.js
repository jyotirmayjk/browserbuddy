console.log('Prompt API content script loading...');

const PROMPT_SYSTEM_MESSAGE = 'You are a helpful assistant who answers questions about the content the user selects on this page. Focus on accurate, concise responses grounded in the provided context.';

window.promptApiExtension = window.promptApiExtension || {
  initialized: false,
  currentDialog: null
};

function ensureStyles() {
  if (document.getElementById('prompt-api-extension-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'prompt-api-extension-styles';
  style.textContent = `
    .prompt-api-dialog {
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
    .prompt-api-input {
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
    .prompt-api-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .prompt-api-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
    }
    .prompt-api-button:hover {
      opacity: 0.9;
    }
    .prompt-api-submit {
      background: #4CAF50;
      color: #fff;
    }
    .prompt-api-cancel {
      background: #f1f1f1;
      color: #333;
    }
    .prompt-api-response {
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
    .prompt-api-error {
      color: #d32f2f;
      margin-top: 8px;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);
}

function removeExistingDialog() {
  if (window.promptApiExtension.currentDialog) {
    try {
      window.promptApiExtension.currentDialog.remove();
    } catch (error) {
      console.warn('Unable to remove existing dialog', error);
    }
    window.promptApiExtension.currentDialog = null;
  }
}

function buildInitialPrompts(context, contextType) {
  const prompts = [
    { role: 'system', content: PROMPT_SYSTEM_MESSAGE }
  ];

  if (!context) {
    return prompts;
  }

  if (contextType === 'queryWithImage') {
    prompts.push({
      role: 'user',
      content: `The user is asking about an image on this page. If image analysis is available, summarize or answer questions about it. Image URL: ${context}`
    });
  } else {
    prompts.push({
      role: 'user',
      content: `The user highlighted the following text on this page:\n${context}`
    });
  }

  return prompts;
}

async function promptLanguageModel(question, context, contextType) {
  if (typeof LanguageModel === 'undefined' || typeof LanguageModel.create !== 'function') {
    throw new Error('Chrome\'s Prompt API is unavailable. Enable chrome://flags/#prompt-api in a compatible build of Chrome.');
  }

  const createOptions = {
    initialPrompts: buildInitialPrompts(context, contextType)
  };

  let session;
  try {
    session = await LanguageModel.create(createOptions);
    return await session.prompt(question);
  } catch (error) {
    if (error?.name === 'NotSupportedError') {
      throw new Error('Prompt API does not support the requested configuration.');
    }
    if (error?.name === 'AbortError') {
      throw new Error('The prompt was aborted.');
    }
    throw error;
  } finally {
    try {
      session?.destroy?.();
    } catch (destroyError) {
      console.warn('Failed to destroy Prompt API session', destroyError);
    }
  }
}

function createDialog(context, contextType) {
  removeExistingDialog();

  const dialog = document.createElement('div');
  dialog.className = 'prompt-api-dialog';

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const dialogWidth = 400;
  const dialogHeight = 300;

  const leftPos = Math.max(0, Math.floor((viewportWidth - dialogWidth) / 2));
  const topPos = Math.max(0, Math.floor((viewportHeight - dialogHeight) / 2));

  dialog.style.left = `${leftPos}px`;
  dialog.style.top = `${topPos}px`;

  dialog.innerHTML = `
    <textarea class="prompt-api-input" placeholder="Enter your question about the selected content..."></textarea>
    <div class="prompt-api-buttons">
      <button class="prompt-api-button prompt-api-cancel">Cancel</button>
      <button class="prompt-api-button prompt-api-submit">Ask AI</button>
    </div>
    <div class="prompt-api-response" style="display: none;"></div>
  `;

  const textarea = dialog.querySelector('.prompt-api-input');
  const submitButton = dialog.querySelector('.prompt-api-submit');
  const cancelButton = dialog.querySelector('.prompt-api-cancel');
  const responseBox = dialog.querySelector('.prompt-api-response');

  async function handleSubmit() {
    const question = textarea.value.trim();
    if (!question) {
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Loading...';
    responseBox.style.display = 'block';
    responseBox.textContent = 'Querying Chrome\'s Prompt API...';

    try {
      const answer = await promptLanguageModel(question, context, contextType);
      responseBox.textContent = answer;
    } catch (error) {
      console.error('Prompt API error', error);
      responseBox.innerHTML = `<div class="prompt-api-error">Error: ${error.message}</div>`;
    } finally {
      if (dialog.isConnected) {
        submitButton.disabled = false;
        submitButton.textContent = 'Ask AI';
      }
    }
  }

  submitButton.addEventListener('click', handleSubmit);
  cancelButton.addEventListener('click', removeExistingDialog);

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
    if (event.key === 'Escape') {
      removeExistingDialog();
    }
  });

  document.body.appendChild(dialog);
  window.promptApiExtension.currentDialog = dialog;

  setTimeout(() => {
    try {
      textarea.focus();
    } catch (error) {
      console.warn('Unable to focus textarea', error);
    }
  }, 50);
}

function handleMessage(message, sender, sendResponse) {
  if (message.action === 'showQueryDialog') {
    try {
      ensureStyles();
      createDialog(message.context, message.contextType);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to create Prompt API dialog', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  return false;
}

function initializeExtension() {
  if (window.promptApiExtension.initialized) {
    return;
  }

  ensureStyles();

  try {
    chrome.runtime.onMessage.removeListener(handleMessage);
  } catch (error) {
    // Listener may not exist yet; safe to ignore.
  }

  chrome.runtime.onMessage.addListener(handleMessage);
  window.promptApiExtension.initialized = true;
  console.log('Prompt API content script initialized');
}

initializeExtension();
document.addEventListener('DOMContentLoaded', initializeExtension);

const observer = new MutationObserver(() => {
  if (!window.promptApiExtension.initialized) {
    initializeExtension();
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });