// Job Queue System for handling long-running ML model requests

export interface JobStatus {
  id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: number;
  estimatedDuration: number; // in milliseconds
  result?: {
    type: 'text' | 'work' | 'error';
    title: string;
    body: string;
  };
  error?: string;
}

export class JobQueue {
  private jobs: Map<string, JobStatus> = new Map();

  generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createJob(prompt: string, estimatedDuration: number = 30 * 60 * 1000): JobStatus {
    const job: JobStatus = {
      id: this.generateJobId(),
      prompt,
      status: 'pending',
      progress: 0,
      startTime: Date.now(),
      estimatedDuration,
    };
    this.jobs.set(job.id, job);
    this.startProcessing(job.id);
    return job;
  }

  private startProcessing(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'processing';

    const effectiveDuration = job.estimatedDuration >= 30 * 60 * 1000
      ? 10000
      : Math.min(job.estimatedDuration, 2000);

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - job.startTime;
      const progress = Math.min(
        (elapsed / effectiveDuration) * 100,
        99
      );

      job.progress = Math.round(progress);

      if (progress >= 99) {
        clearInterval(progressInterval);
        this.completeJob(jobId);
      }
    }, 400);
  }

  private completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Mock a response based on the prompt
    const response = this.generateMockResponse(job.prompt);
    job.status = 'completed';
    job.progress = 100;
    job.result = response;
  }

  private generateMockResponse(prompt: string) {
    const lower = prompt.toLowerCase();

    if (lower.includes('error')) {
      return {
        type: 'error' as const,
        title: 'A draft issue appeared',
        body: 'This is a mocked failure state to show how the UI handles a retry.',
      };
    }

    if (
      lower.includes('patient') ||
      lower.includes('chart') ||
      lower.includes('consult') ||
      lower.includes('note') ||
      lower.includes('clinical')
    ) {
      return {
        type: 'work' as const,
        title: 'Structured work card',
        body: 'Here is a reviewable work card with a clear structure and next steps.',
      };
    }

    if (
      lower.includes('document') ||
      lower.includes('brief') ||
      lower.includes('proposal')
    ) {
      return {
        type: 'work' as const,
        title: 'Document draft',
        body: 'Here is a practical work card for drafting or sharing with collaborators.',
      };
    }

    return {
      type: 'text' as const,
      title: 'Text response',
      body: 'A clear, friendly answer is ready. This mocked response focuses on clarity and usefulness rather than excess detail.',
    };
  }

  getJob(jobId: string): JobStatus | undefined {
    return this.jobs.get(jobId);
  }

  getJobProgress(jobId: string): number {
    return this.getJob(jobId)?.progress ?? 0;
  }

  isJobComplete(jobId: string): boolean {
    return this.getJob(jobId)?.status === 'completed';
  }

  clearJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  clearAllJobs(): void {
    this.jobs.clear();
  }
}

export const jobQueue = new JobQueue();
