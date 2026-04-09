import { useState, useEffect } from 'react';
import './demos.css';

interface ToolJob { id: number; name: string; parallel: boolean; duration: number; status: 'waiting' | 'running' | 'done'; }

const JOBS: ToolJob[] = [
  { id: 1, name: 'Read("src/auth.ts")',    parallel: true,  duration: 2200, status: 'waiting' },
  { id: 2, name: 'Read("src/utils.ts")',   parallel: true,  duration: 1800, status: 'waiting' },
  { id: 3, name: 'Glob("**/*.test.ts")',   parallel: true,  duration: 1400, status: 'waiting' },
  { id: 4, name: 'Grep("TODO", "src/")',   parallel: true,  duration: 2600, status: 'waiting' },
  { id: 5, name: 'Edit("src/auth.ts")',    parallel: false, duration: 2400, status: 'waiting' },
  { id: 6, name: 'Bash("npm test")',       parallel: false, duration: 3000, status: 'waiting' },
];

export function ParallelToolsDemo() {
  const [jobs, setJobs] = useState<ToolJob[]>(JOBS.map((j) => ({ ...j })));
  const [phase, setPhase] = useState<'batch1' | 'serial' | 'done' | 'idle'>('idle');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setJobs(JOBS.map((j) => ({ ...j })));
        setPhase('idle');
        await new Promise<void>((r) => setTimeout(r, 1600));

        // Phase 1: parallel reads
        setPhase('batch1');
        const reads = JOBS.filter((j) => j.parallel);
        setJobs((prev) => prev.map((j) => j.parallel ? { ...j, status: 'running' } : j));
        const maxDur = Math.max(...reads.map((j) => j.duration));
        // settle reads one by one
        for (const j of reads) {
          const delay = j.duration;
          setTimeout(() => {
            if (!cancelled) setJobs((prev) => prev.map((p) => p.id === j.id ? { ...p, status: 'done' } : p));
          }, delay);
        }
        await new Promise<void>((r) => setTimeout(r, maxDur + 400));

        // Phase 2: serial writes
        setPhase('serial');
        const writes = JOBS.filter((j) => !j.parallel);
        for (const w of writes) {
          if (cancelled) return;
          setJobs((prev) => prev.map((j) => j.id === w.id ? { ...j, status: 'running' } : j));
          await new Promise<void>((r) => setTimeout(r, w.duration));
          if (cancelled) return;
          setJobs((prev) => prev.map((j) => j.id === w.id ? { ...j, status: 'done' } : j));
          await new Promise<void>((r) => setTimeout(r, 300));
        }
        setPhase('done');
        await new Promise<void>((r) => setTimeout(r, 4000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="pdemo">
      <div className="pdemo__header">
        <div className="pdemo__label pdemo__label--parallel">
          <div className="pdemo__dot" style={{ background: '#2563EB' }} />
          Parallel batch (read-only — up to 10×)
        </div>
        <div className="pdemo__label pdemo__label--serial">
          <div className="pdemo__dot" style={{ background: '#f59e0b' }} />
          Serial (write tools)
        </div>
      </div>
      <div className="pdemo__rows">
        {jobs.map((job) => (
          <div key={job.id} className={`pdemo__row pdemo__row--${job.status} pdemo__row--${job.parallel ? 'par' : 'ser'}`}>
            <div className="pdemo__row-bar"
              style={{
                width: job.status === 'running' ? '100%' : job.status === 'done' ? '100%' : '0%',
                background: job.parallel ? '#2563EB22' : '#f59e0b22',
                transition: job.status === 'running' ? `width ${job.duration}ms linear` : 'none',
              }}
            />
            <div className="pdemo__row-content">
              <span className="pdemo__row-icon">
                {job.status === 'waiting' ? '○' : job.status === 'running' ? '◎' : '✓'}
              </span>
              <span className="pdemo__row-name">{job.name}</span>
              {job.status === 'running' && <span className="pdemo__row-tag">running</span>}
              {job.status === 'done' && <span className="pdemo__row-done">done</span>}
            </div>
          </div>
        ))}
      </div>
      {phase === 'done' && (
        <div className="pdemo__result">
          ✓ partitionToolCalls: [batch×4 parallel] → [Edit serial] → [Bash serial]
        </div>
      )}
    </div>
  );
}
