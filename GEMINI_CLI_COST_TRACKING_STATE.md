# Gemini CLI Cost Tracking - Current State

## Objective
Integrate real-time API cost tracking and display directly into the Gemini CLI application.

## Current Approach
The implementation is being done directly within the `@google/gemini-cli` source code, rather than using an external proxy. The cost is calculated after each API response and displayed in the UI's footer.

## Work Completed
1.  **Core Cost-Tracking Logic:**
    *   A `CostTrackingContentGenerator` class has been created in `packages/core/src/core/costTrackingContentGenerator.ts`. This class wraps the actual content generator to intercept API responses.
    *   It calculates the cost based on the model and token usage (`promptTokenCount` and `candidatesTokenCount`) from the response metadata.
2.  **Callback Mechanism:**
    *   The `GeminiClient` (`packages/core/src/core/client.ts`) was modified. Its `initialize` method now accepts an `onCostUpdate` callback function.
    *   The `Config` class (`packages/core/src/config/config.ts`) was updated to accept this `onCostUpdate` callback in its constructor and pass it down during the `GeminiClient` initialization.
3.  **UI Integration:**
    *   The main React component (`packages/cli/src/ui/App.tsx`) now manages a `totalCost` state.
    *   A callback function (`handleCostUpdate`) is passed through the `loadCliConfig` function to the `Config` object, which ultimately provides it to the `GeminiClient`.
    *   The `Footer` component (`packages/cli/src/ui/components/Footer.tsx`) was updated to receive and display the `totalCost`.

## Current Blocker: Build Errors
The last attempt to build the project (`npm run build`) failed with several TypeScript errors. The errors indicate that function and method calls across the application have not been correctly updated to match the new signatures that include the `onCostUpdate` callback.

**Error Summary:**
- `packages/core/src/core/client.test.ts`: The `client.initialize` call in the test setup is missing the new `onCostUpdate` callback argument.
- `packages/cli/src/gemini.tsx`: The `loadCliConfig` call in the `loadNonInteractiveConfig` function is missing the `onCostUpdate` argument.
- `packages/cli/src/ui/hooks/useGeminiStream.ts`: A reference to a now-removed `onCostUpdate` parameter is causing a "Cannot find name" error.
- `packages/cli/src/ui/hooks/useGeminiStream.test.tsx`: Multiple calls to the `useGeminiStream` hook in the test file are now incorrect because the hook's signature has changed.

## Next Steps
To resolve the issue, the following files need to be corrected to fix the build errors:

1.  **`/Users/mattzeiger/Developer/gemini-cli/packages/core/src/core/client.test.ts`**: Update the `client.initialize` call in the `beforeEach` block to include a dummy callback function.
2.  **`/Users/mattzeiger/Developer/gemini-cli/packages/cli/src/gemini.tsx`**: Update the `loadCliConfig` call inside the `loadNonInteractiveConfig` function to pass a dummy callback.
3.  **`/Users/mattzeiger/Developer/gemini-cli/packages/cli/src/ui/hooks/useGeminiStream.ts`**: Remove the final reference to the `onCostUpdate` variable that was deleted from the function signature.
4.  **`/Users/mattzeiger/Developer/gemini-cli/packages/cli/src/ui/hooks/useGeminiStream.test.tsx`**: Update all calls to the `useGeminiStream` hook to match its new, shorter signature.

After these files are corrected, running `npm run build` from the `/Users/mattzeiger/Developer/gemini-cli/` directory should succeed.
