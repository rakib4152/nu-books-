import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { PdfProcessingJob } from '../../lib/types';

interface JobsTableProps {
  jobs: PdfProcessingJob[];
  onRetryJob: (jobId: string) => Promise<void>;
  onSelectBook: (bookId: string) => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({ jobs, onRetryJob, onSelectBook }) => {
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredJobs = jobs.filter(j => statusFilter === 'ALL' || j.status === statusFilter);

  const handleRetry = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      await onRetryJob(jobId);
    } catch (err) {
      console.error(err);
    } finally {
      setRetryingJobId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            PDF Processing Queue & Extraction Jobs
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Monitor asynchronous PDF parsing, outline extraction jobs, errors, and automated retry policies.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-900 rounded-md text-xs">
          {['ALL', 'COMPLETED', 'PROCESSING', 'FAILED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="py-2.5 px-4 font-medium">Book & File</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Attempts</th>
              <th className="py-2.5 px-3 font-medium">Started At</th>
              <th className="py-2.5 px-3 font-medium">Completed At</th>
              <th className="py-2.5 px-4 font-medium">Message / Error Log</th>
              <th className="py-2.5 px-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-400">
                  No processing jobs recorded in queue.
                </td>
              </tr>
            ) : (
              filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onSelectBook(job.bookId)}
                      className="font-semibold text-neutral-900 dark:text-neutral-100 hover:underline text-left block"
                    >
                      {job.bookTitle || job.bookId}
                    </button>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      {job.pdfFileName || 'Source PDF'}
                    </p>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : job.status === 'FAILED'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                    {job.attempts}
                  </td>

                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-500 text-[11px]">
                    {job.startedAt ? new Date(job.startedAt).toLocaleTimeString() : '—'}
                  </td>

                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-500 text-[11px]">
                    {job.completedAt ? new Date(job.completedAt).toLocaleTimeString() : 'In Progress'}
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p
                      className={`text-[11px] line-clamp-2 leading-snug ${
                        job.status === 'FAILED'
                          ? 'text-rose-600 dark:text-rose-400 font-mono'
                          : 'text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      {job.errorMessage || 'No error details reported.'}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {job.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(job.id)}
                        disabled={retryingJobId === job.id}
                        className="flex items-center gap-1 ml-auto px-2.5 py-1 text-xs font-medium rounded border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      >
                        <RotateCcw className={`w-3 h-3 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                        <span>Retry</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
