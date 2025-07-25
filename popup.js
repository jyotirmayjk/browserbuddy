document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const queryInput = document.getElementById('query-input');
    const submitQueryButton = document.getElementById('submit-query');
    const responseText = document.getElementById('response-text');
    const loading = document.getElementById('loading');

    // Load saved API key
    chrome.storage.sync.get(['openai_api_key'], function(result) {
        if (result.openai_api_key) {
            apiKeyInput.value = result.openai_api_key;
        }
    });

    // Save API key
    saveApiKeyButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            chrome.storage.sync.set({ 'openai_api_key': apiKey }, function() {
                alert('API key saved successfully!');
            });
        }
    });

    // Function to submit query
    async function submitQuery() {
        const query = queryInput.value.trim();
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            alert('Please enter your OpenAI API key first!');
            return;
        }

        if (!query) {
            alert('Please enter a query!');
            return;
        }

        loading.classList.remove('hidden');
        responseText.textContent = '';

        try {
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
                        content: query
                    }],
                    temperature: 0.7
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API request failed');
            }

            responseText.textContent = data.choices[0].message.content;
        } catch (error) {
            responseText.textContent = `Error: ${error.message}`;
        } finally {
            loading.classList.add('hidden');
        }
    }

    // Submit query on button click
    submitQueryButton.addEventListener('click', submitQuery);

    // Submit query on Enter key (without Shift)
    queryInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent new line
            submitQuery();
        }
    });
}); 