const POPUP_SYSTEM_MESSAGE = 'You are the assistant accessible from the Chrome toolbar. Provide clear, helpful responses based on the user\'s question.';

document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('query-input');
    const submitQueryButton = document.getElementById('submit-query');
    const responseText = document.getElementById('response-text');
    const loading = document.getElementById('loading');
    const statusMessage = document.getElementById('status-message');

    function setStatus(message, tone = 'info') {
        if (!statusMessage) {
            return;
        }

        statusMessage.textContent = message;
        statusMessage.classList.remove('warning', 'error');

        if (tone === 'warning') {
            statusMessage.classList.add('warning');
        } else if (tone === 'error') {
            statusMessage.classList.add('error');
        }
    }

    async function checkAvailability() {
        if (typeof LanguageModel === 'undefined' || typeof LanguageModel.create !== 'function') {
            setStatus('Prompt API unavailable. Enable chrome://flags/#prompt-api in a supported Chrome build.', 'error');
            return false;
        }

        if (typeof LanguageModel.availability === 'function') {
            try {
                const availability = await LanguageModel.availability({});

                if (availability === 'unavailable') {
                    setStatus('Prompt API unavailable for this profile or context.', 'error');
                    return false;
                }

                if (availability === 'downloadable') {
                    setStatus('Chrome needs to download built-in model resources. This may take a moment.', 'warning');
                } else if (availability === 'downloading') {
                    setStatus('Chrome is downloading built-in model resources. Please wait...', 'warning');
                } else {
                    setStatus('Prompt API ready. Ask a question to get started.');
                }
            } catch (error) {
                setStatus(`Prompt API availability check failed: ${error.message}`, 'error');
                return false;
            }
        } else {
            setStatus('Prompt API ready. Ask a question to get started.');
        }

        return true;
    }

    async function promptLanguageModel(question) {
        if (typeof LanguageModel === 'undefined' || typeof LanguageModel.create !== 'function') {
            throw new Error('Prompt API unavailable. Enable chrome://flags/#prompt-api.');
        }

        let session;
        try {
            session = await LanguageModel.create({
                initialPrompts: [
                    { role: 'system', content: POPUP_SYSTEM_MESSAGE }
                ]
            });

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
            } catch (cleanupError) {
                console.log('Error destroying Prompt API session:', cleanupError);
            }
        }
    }

    async function submitQuery() {
        const query = queryInput.value.trim();

        if (!query) {
            alert('Please enter a question or prompt.');
            return;
        }

        loading.classList.remove('hidden');
        responseText.textContent = '';

        try {
            const available = await checkAvailability();
            if (!available) {
                throw new Error('Prompt API is not available.');
            }

            const answer = await promptLanguageModel(query);
            responseText.textContent = answer;
        } catch (error) {
            responseText.textContent = `Error: ${error.message}`;
        } finally {
            loading.classList.add('hidden');
        }
    }

    // Perform initial availability check
    checkAvailability();

    // Submit query on button click
    submitQueryButton.addEventListener('click', submitQuery);

    // Submit query on Enter key (without Shift)
    queryInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submitQuery();
        }
    });
});