// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

// Ensure context menus are created when extension starts
chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

function createContextMenus() {
  // Remove existing menu items first
  chrome.contextMenus.removeAll(() => {
    console.log('Previous context menus removed');
    
    // Create new menu items
    chrome.contextMenus.create({
      id: "queryWithText",
      title: "Ask about selected text",
      contexts: ["selection"]
    });
    
    chrome.contextMenus.create({
      id: "queryWithImage",
      title: "Ask about this image",
      contexts: ["image"]
    });
    console.log('Context menu items created');
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  
  let context = '';
  if (info.menuItemId === "queryWithText") {
    context = info.selectionText;
    console.log('Selected text:', context);
  } else if (info.menuItemId === "queryWithImage") {
    context = info.srcUrl;
    console.log('Image URL:', context);
  }

  try {
    // Prepare message for content script
    const message = {
      action: "showQueryDialog",
      context: context,
      contextType: info.menuItemId
    };

    console.log('Sending message to content script:', message);
    
    // Try to send message to content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, message);
      console.log('Message sent successfully:', response);
    } catch (error) {
      console.log('Content script not ready, injecting...', error);
      
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Wait a moment for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try sending message again
      await chrome.tabs.sendMessage(tab.id, message);
    }
  } catch (error) {
    console.error('Failed to show dialog:', error);
    
    // Show user-friendly error
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (errorMsg) => {
        alert('Failed to show dialog. Please refresh the page and try again.\nError: ' + errorMsg);
      },
      args: [error.message]
    });
  }
});