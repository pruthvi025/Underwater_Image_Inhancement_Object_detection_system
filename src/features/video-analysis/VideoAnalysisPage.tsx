import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Video, Upload, Play, Pause, SkipForward, SkipBack,
  AlertTriangle, Settings2, Info, Film,
} from 'lucide-react';
import { DemoLabel, ProcessingState, EmptyState } from '@/components/feedback/StatusStates';
import { useAppStore } from '@/lib/store';
import { validateVideoFile, formatFileSize, createPreviewUrl, generateId } from '@/utils';
import type { AnalysisStatus } from '@/types';

export const VideoAnalysisPage: React.FC = () => {
  const { isDemo, addSession } = useAppStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revokeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => { revokeRef.current?.(); };
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid video file');
      return;
    }

    revokeRef.current?.();
    const { url, revoke } = createPreviewUrl(file);
    revokeRef.current = revoke;
    setSelectedFile(file);
    setPreviewUrl(url);
    setError(null);
    setStatus('idle');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, []);

  const handleRemoveFile = useCallback(() => {
    revokeRef.current?.();
    revokeRef.current = null;
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setStatus('idle');
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;
    setStatus('processing');
    setError(null);

    const sessionId = generateId();
    addSession({
      id: sessionId,
      type: 'video',
      status: 'processing',
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo,
    });

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (isDemo) {
      setStatus('completed');
      setError(null);
    } else {
      setStatus('failed');
      setError('Backend not connected. Video processing requires a connected backend with model support.');
    }
  }, [selectedFile, isDemo, addSession]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Video size={22} color="#8B5CF6" />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Video Analysis</h1>
          {isDemo && <DemoLabel />}
        </div>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
          Frame-by-frame underwater video processing with enhancement and detection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Main area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Upload / Preview */}
          {!selectedFile ? (
            <div className="card">
              <div className="card-header">
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Video Input</h2>
              </div>
              <div className="card-body">
                <div
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload a video file"
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                >
                  <Film size={32} color="var(--color-surface-400)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
                    Upload an underwater video
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    MP4, WebM, AVI · Max 100 MB
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/avi,video/quicktime"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {error && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-error)', fontSize: 13 }}>
                    <AlertTriangle size={14} />
                    {error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Video Player */}
              <div className="card">
                <div className="card-header">
                  <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Video Preview</h2>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {selectedFile.name} · {formatFileSize(selectedFile.size)}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={handleRemoveFile}>Remove</button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="image-viewer" style={{ position: 'relative' }}>
                    <video
                      ref={videoRef}
                      src={previewUrl ?? undefined}
                      style={{ width: '100%', maxHeight: 400, display: 'block' }}
                      onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                      onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>

                  {/* Playback controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--color-surface-50)' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 5); }}>
                      <SkipBack size={16} />
                    </button>
                    <button className="btn btn-primary btn-icon btn-sm" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 5); }}>
                      <SkipForward size={16} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <input
                        type="range"
                        className="range-slider"
                        min={0}
                        max={duration || 1}
                        step={0.1}
                        value={currentTime}
                        onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value); }}
                        aria-label="Video position"
                      />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', minWidth: 80, textAlign: 'right' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing state */}
              {status === 'processing' && (
                <div className="card"><div className="card-body">
                  <ProcessingState
                    title="Processing video..."
                    description={isDemo ? 'Simulating frame-by-frame analysis (demo)' : 'Analyzing video frames'}
                  />
                </div></div>
              )}

              {/* Completed state */}
              {status === 'completed' && (
                <div className="card">
                  <div className="card-header">
                    <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Processing Complete</h2>
                    {isDemo && <span className="badge badge-demo" style={{ fontSize: 11 }}>Demo Result</span>}
                  </div>
                  <div className="card-body">
                    <div style={{
                      display: 'flex', gap: 8, alignItems: 'flex-start',
                      padding: '10px 14px', borderRadius: 6, background: '#FEF3C7',
                      fontSize: 13, color: '#92400E',
                    }}>
                      <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        Video processing is architecturally prepared but requires a connected backend for actual frame-by-frame inference.
                        In demo mode, no real analysis was performed on the video frames.
                      </span>
                    </div>
                    <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div className="metric-card">
                        <div className="metric-label">Total Frames</div>
                        <div className="metric-value small">{Math.round(duration * 30)}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>estimated @ 30fps</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Duration</div>
                        <div className="metric-value small">{formatTime(duration)}</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Status</div>
                        <div className="metric-value small" style={{ color: 'var(--color-success)' }}>Ready</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>awaiting backend</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'failed' && error && (
                <div className="card"><div className="card-body">
                  <div style={{
                    display: 'flex', gap: 8, alignItems: 'flex-start',
                    padding: '10px 14px', borderRadius: 6, background: '#FEE2E2',
                    fontSize: 13, color: '#991B1B',
                  }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{error}</span>
                  </div>
                </div></div>
              )}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings2 size={16} /> Processing Options
              </h2>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <label className="label">Processing Mode</label>
                <select className="input select" disabled={status === 'processing'}>
                  <option>Full Pipeline (Enhance + Detect)</option>
                  <option>Enhancement Only</option>
                  <option>Detection Only</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Frame Sampling</label>
                <select className="input select" disabled={status === 'processing'}>
                  <option>Every frame</option>
                  <option>Every 5th frame</option>
                  <option>Every 10th frame</option>
                  <option>Key frames only</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleProcess}
                disabled={!selectedFile || status === 'processing'}
              >
                <Play size={16} />
                {status === 'processing' ? 'Processing...' : 'Process Video'}
              </button>

              {isDemo && (
                <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'var(--color-teal-50)', fontSize: 12, color: 'var(--color-teal-600)' }}>
                  <strong>Demo Mode:</strong> Video processing requires backend integration. The UI demonstrates the intended workflow.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Capabilities</h2>
            </div>
            <div className="card-body" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li>Frame-by-frame enhancement</li>
                <li>Object detection per frame</li>
                <li>Temporal detection tracking</li>
                <li>Processing progress reporting</li>
                <li>Frame-level result inspection</li>
              </ul>
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'var(--color-surface-50)', fontSize: 12 }}>
                Live camera streaming is not currently supported. This workspace processes recorded video files.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
