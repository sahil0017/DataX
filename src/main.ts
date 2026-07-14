import './styles.css';
import { jobQueue, type JobStatus } from './jobQueue';

type Role = 'user' | 'assistant';

const promptForm = document.getElementById('promptForm') as HTMLFormElement;
const promptInput = document.getElementById('promptInput') as HTMLTextAreaElement;
const thread = document.getElementById('thread') as HTMLDivElement;
const conversationStream = document.getElementById('conversationStream') as HTMLDivElement;
const detailCard = document.getElementById('detailCard') as HTMLDivElement;
const newChatButton = document.getElementById('newChatButton') as HTMLButtonElement;
const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
const exampleButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.pill-btn'));

let pollInterval: number | null = null;

function resetConversation(): void {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
    pollInterval = null;
  }

  thread.innerHTML = '';
  detailCard.classList.add('hidden');
  detailCard.classList.remove('is-visible');
  detailCard.innerHTML = '';
  renderEmptyState();
  promptInput.value = '';
  promptInput.focus();
}

function renderEmptyState(): void {
  if (thread.children.length > 0) {
    return;
  }

  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';
  emptyState.innerHTML = `
    <div class="empty-icon">✦</div>
    <h3>What would you like help with?</h3>
    <p>Ask for a reply, a draft, or a structured work card.</p>
  `;
  thread.appendChild(emptyState);
}

function seedExampleConversation(): void {
  const prompt = "Create a patient chart summary with today's key updates.";
  const emptyState = thread.querySelector<HTMLElement>('.empty-state');
  emptyState?.remove();

  appendBubble('user', 'You', prompt);
  appendBubble('assistant', 'DataX', 'Here is a concise summary with the latest updates and a review-ready work card.');
  setDetailCard(createWorkCard(prompt));
}

function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function initializeTheme(): void {
  const savedTheme = window.localStorage.getItem('northstar-theme') as 'light' | 'dark' | null;
  const preferredTheme = savedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(preferredTheme);
}

function scrollConversationToBottom(): void {
  conversationStream.scrollTop = conversationStream.scrollHeight;
}

function appendBubble(role: Role, title: string, body: string): void {
  const bubble = document.createElement('article');
  bubble.className = `bubble ${role}`;
  const metaLabel = role === 'user' ? 'User' : 'DataX';
  bubble.innerHTML = `
    <div class="bubble-meta" title="${role === 'user' ? 'This is your prompt' : 'This is the DataX response'}">${metaLabel}</div>
    <h4>${title}</h4>
    <p>${body}</p>
  `;
  thread.appendChild(bubble);
  scrollConversationToBottom();
}

function setDetailCard(content: string): void {
  detailCard.classList.add('hidden');
  detailCard.classList.remove('is-visible');
  detailCard.innerHTML = content;

  window.requestAnimationFrame(() => {
    detailCard.classList.remove('hidden');
    detailCard.classList.add('is-visible');
    scrollConversationToBottom();
  });
}

function appendThinkingBubble(): void {
  const bubble = document.createElement('article');
  bubble.className = 'bubble assistant thinking';
  bubble.innerHTML = `
    <div class="bubble-meta" title="This is the DataX response">DataX reply</div>
    <h4>Assistant</h4>
    <div class="thinking-row" aria-live="polite">
      <span>Thinking carefully</span>
      <span class="thinking-dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </div>
  `;
  thread.appendChild(bubble);
  scrollConversationToBottom();
}

function revealFinalResponse(title: string, body: string): void {
  const bubbles = thread.querySelectorAll<HTMLElement>('.bubble');
  const lastBubble = bubbles[bubbles.length - 1];

  if (lastBubble?.classList.contains('thinking')) {
    lastBubble.innerHTML = `
      <div class="bubble-meta" title="This is the DataX response">DataX reply</div>
      <h4>${title}</h4>
      <p>${body}</p>
    `;
    lastBubble.classList.remove('thinking');
  } else {
    appendBubble('assistant', title, body);
  }
}

function createLoadingState(isLongRunning: boolean): void {
  const waitText = isLongRunning
    ? 'This may take longer than usual. We’ll show the result as soon as it is ready.'
    : 'This should finish shortly.';
  const estimateText = isLongRunning ? 'Usually a few minutes' : 'Usually a few seconds';

  setDetailCard(`
    <div class="card-top">
      <strong>Working on your request</strong>
      <span class="badge">Processing</span>
    </div>
    <div class="status-row"><span class="dot"></span> Preparing context</div>
    <div class="status-row"><span class="dot"></span> Running ML model</div>
    <div class="status-row"><span class="dot"></span> Polishing the response</div>
    <p class="background-note">${waitText}</p>
    <div id="progressContainer" class="progress-container">
      <div class="progress-info">
        <span>${estimateText}</span>
        <span id="statusLabel">Starting up</span>
      </div>
      <div class="progress-bar">
        <div id="progressFill" class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="progress-percent" id="progressPercent">0%</div>
    </div>
  `);
}

function updateProgressState(job: JobStatus): void {
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const statusLabel = document.getElementById('statusLabel');

  if (progressFill && progressPercent && statusLabel) {
    const progress = job.progress;
    const stage = progress < 30
      ? 'Starting up'
      : progress < 70
        ? 'Running model'
        : progress < 95
          ? 'Polishing output'
          : 'Finishing up';

    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${progress}%`;
    statusLabel.textContent = stage;
  }
}

function createErrorState(prompt: string): void {
  const message = prompt.toLowerCase().includes('error')
    ? 'The draft hit a snag. A short retry with clearer context will usually recover it.'
    : 'The request needs a bit more context to produce a reliable draft.';

  setDetailCard(`
    <div class="card-top">
      <strong>We need a clearer prompt</strong>
      <span class="badge error">Needs refinement</span>
    </div>
    <p>${message}</p>
    <div class="work-grid">
      <div class="work-block">
        <strong>Try this instead</strong>
        <span>“Draft a clear summary with the main facts, next steps, and a short recommendation.”</span>
      </div>
    </div>
  `);
}

function startPolling(jobId: string): void {
  if (pollInterval !== null) {
    clearInterval(pollInterval);
  }

  pollInterval = window.setInterval(() => {
    const job = jobQueue.getJob(jobId);
    if (!job) {
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      return;
    }

    updateProgressState(job);

    if (job.status === 'completed') {
      if (pollInterval !== null) {
        clearInterval(pollInterval);
        pollInterval = null;
      }

      if (job.result?.type === 'error') {
        revealFinalResponse(job.result.title, job.result.body);
        createErrorState(job.prompt);
        return;
      }

      revealFinalResponse(job.result?.title ?? 'Response', job.result?.body ?? '');
      setDetailCard(createWorkCard(job.prompt));
    }
  }, 500);
}

function createWorkCard(prompt: string): string {
  const lower = prompt.toLowerCase();
  const isClinical = lower.includes('patient') || lower.includes('chart') || lower.includes('consult') || lower.includes('note') || lower.includes('clinical');
  const isDocument = lower.includes('document') || lower.includes('brief') || lower.includes('proposal');

  if (isClinical) {
    return `
      <div class="card-top">
        <strong>Clinical summary card</strong>
        <span class="badge success">Ready to review</span>
      </div>
      <p>A structured card is now available for quick review and handoff.</p>
      <div class="work-grid">
        <div class="work-block">
          <strong>Patient snapshot</strong>
          <span>Follow-up visit completed. Symptoms improved with continued monitoring.</span>
        </div>
        <div class="work-block">
          <strong>Key findings</strong>
          <span>Blood pressure stable, medication adherence improved, and no new concerns reported.</span>
        </div>
        <div class="work-block">
          <strong>Next steps</strong>
          <span>Recheck in one week and confirm medication plan.</span>
        </div>
      </div>
      <div class="meta-list">
        <span class="meta-chip">Chart-ready</span>
        <span class="meta-chip">Concise</span>
        <span class="meta-chip">Actionable</span>
      </div>
    `;
  }

  if (isDocument) {
    return `
      <div class="card-top">
        <strong>Document draft</strong>
        <span class="badge success">Draft prepared</span>
      </div>
      <p>The workspace has turned your prompt into a polished document outline.</p>
      <div class="work-grid">
        <div class="work-block">
          <strong>Overview</strong>
          <span>Clear objective, target audience, and a concise recommendation section.</span>
        </div>
        <div class="work-block">
          <strong>Suggested structure</strong>
          <span>Context, priorities, next actions, and owners.</span>
        </div>
      </div>
      <div class="meta-list">
        <span class="meta-chip">Structured</span>
        <span class="meta-chip">Review-friendly</span>
      </div>
    `;
  }

  return `
    <div class="card-top">
      <strong>Text response</strong>
      <span class="badge success">Delivered</span>
    </div>
    <p>The assistant drafted a clear answer that fits naturally into the conversation stream.</p>
    <div class="work-grid">
      <div class="work-block">
        <strong>Key takeaway</strong>
        <span>Your prompt was interpreted as a general request for a thoughtful, concise response.</span>
      </div>
    </div>
  `;
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    promptInput.focus();
    return;
  }

  const emptyState = thread.querySelector<HTMLElement>('.empty-state');
  emptyState?.remove();

  appendBubble('user', 'You', prompt);
  appendThinkingBubble();

  // Check if this is a quick response or long-running job based on keywords
  const lower = prompt.toLowerCase();
  const isLongRunning =
    lower.includes('analyze') ||
    lower.includes('deep') ||
    lower.includes('comprehensive') ||
    lower.includes('detailed') ||
    lower.includes('model') ||
    lower.includes('train') ||
    lower.includes('optimize') ||
    lower.includes('process large') ||
    lower.includes('30 minutes') ||
    lower.includes('long running');

  const duration = isLongRunning ? 30 * 60 * 1000 : 2000;

  const job = jobQueue.createJob(prompt, duration);

  createLoadingState(isLongRunning);
  startPolling(job.id);

  promptForm.reset();
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  window.localStorage.setItem('northstar-theme', currentTheme);
  applyTheme(currentTheme);
});

initializeTheme();
renderEmptyState();
seedExampleConversation();

exampleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.prompt ?? '';
    promptInput.focus();
  });
});

promptInput.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    promptForm.requestSubmit();
  }
});

newChatButton.addEventListener('click', () => {
  resetConversation();
});

promptForm.addEventListener('submit', handleSubmit);
