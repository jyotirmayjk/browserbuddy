<!-- 2e00ae7c-ab50-4839-9941-ae135fe842ac 08a15ca9-bb01-432c-8c4c-d9ecc4764d8f -->
# Switch Extension to Chrome Prompt API

## Steps

1. Inventory current OpenAI usage

- Inspect `content.js` and `popup.js` fetch flows and key storage so we know every call to `https://api.openai.com`.

2. Implement Prompt API session in content dialog

- In `content.js`, detect `navigator.languageModel`, create a `LanguageModel` session via `LanguageModel.create()`, and feed the combined context/question into `session.prompt()`; mirror spec guidance for errors and downloads.

3. Update popup workflow to use Prompt API

- Revise `popup.js` to drop key storage, call the same `LanguageModel.create()`/`session.prompt()` flow, and surface availability or download status per the spec.

4. Clean up leftover OpenAI references

- Remove unused key storage logic, adjust labels/help text if needed, and update `README.md` to document the new dependency on Chrome’s Prompt API support.

## Todos

- audit-openai-usage: note all OpenAI-specific patterns in `content.js` and `popup.js`
- migrate-content-dialog: swap the content script’s fetch logic for Prompt API session usage
- migrate-popup-flow: replace popup fetch logic with Prompt API usage
- update-docs-cleanup: remove obsolete OpenAI references and document the new setup

### To-dos

- [x] Inventory existing OpenAI-specific calls and key storage in content.js and popup.js.
- [x] Replace content.js dialog fetch flow with Chrome Prompt API session usage.
- [x] Switch popup.js to use Chrome Prompt API instead of OpenAI fetch and remove API key dependency.
- [x] Remove OpenAI references and document Prompt API requirements in README.md and related copy.

