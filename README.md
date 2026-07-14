# DataX

A small TypeScript + Vite project for building a data-driven application.

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project structure

- `index.html` - app entry point
- `src/main.ts` - application bootstrap
- `src/jobQueue.ts` - task queue logic
- `src/styles.css` - application styles
- `tsconfig.json` - TypeScript config
- `vite-env.d.ts` - Vite environment types

## Notes

- `node_modules/` and `dist/` are ignored in `.gitignore`
- This repo is configured for Vite and TypeScript

## System architecture

`DataX` is a frontend prototype that simulates an AI workflow in the browser. The app accepts a user prompt, creates a mocked job, displays progress, and then shows a response with either:

- a text reply,
- a structured work card, or
- an error guidance card.

### Core components

- `index.html` - page layout and UI structure.
- `src/main.ts` - handles app initialization, user input, UI rendering, theme toggling, and polling.
- `src/jobQueue.ts` - manages a mock job queue, simulates progress, and returns response objects.
- `src/styles.css` - defines the visual theme, layout, and component styles.

### Request flow

1. User submits a prompt.
2. The prompt is displayed as a user chat bubble.
3. A thinking bubble appears while the app creates a job.
4. `jobQueue` simulates processing and updates progress.
5. When complete, the assistant bubble is updated with the result.
6. A detail card is shown with a work-style summary.

### Response generation

The mock response logic checks the prompt for keywords and returns:

- clinical-style work cards for patient/chart prompts,
- document/draft cards for brief/proposal prompts,
- plain text replies for general queries,
- an error state if the prompt includes the word `error`.

### UI behavior

- Theme toggle saves preference to `localStorage`.
- Example prompt buttons let users quickly populate the prompt.
- `New chat` resets the conversation and clears the detail card.
- Long-running prompts are simulated with a longer progress animation.
