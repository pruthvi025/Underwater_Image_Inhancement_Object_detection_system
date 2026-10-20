import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ScanSearch, Video, BarChart3,
  ImageIcon, Layers, Clock, Activity,
  ArrowRight, Waves, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { StatCard } from '@/components/feedback/MetricCard';
import { EmptyState, DemoLabel, StatusBadge } from '@/components/feedback/StatusStates';
import { formatDate, formatDuration, formatRelativeTime, capitalize } from '@/utils';
import { generateDemoSessions } from '@/services/adapters/mock-adapter';

export const DashboardPage: React.FC = () => {
  const { sessions, isDemo } = useAppStore();

  // Use demo sessions if no real sessions exist and in demo mode
  const displaySessions = useMemo(() => {
    if (sessions.length > 0) return sessions;
    if (isDemo) return generateDemoSessions();
    return [];
  }, [sessions, isDemo]);

  const stats = useMemo(() => {
    const completed = displaySessions.filter((s) => s.status === 'completed');
    return {
      total: displaySessions.length,
      images: displaySessions.filter((s) => s.type !== 'video').length,
      detected: completed.reduce((sum, s) => sum + (s.detectionResult?.totalObjects ?? 0), 0),
      avgTime: completed.length > 0
        ? Math.round(completed.reduce((sum, s) => sum + (s.processingTimeMs ?? 0), 0) / completed.length)
        : 0,
    };
  }, [displaySessions]);

  const recentSessions = displaySessions.slice(0, 5);

  return (
    <div>
      {/* Demo Banner */}
      {isDemo && (
        <div className="demo-banner" style={{ marginBottom: 20 }}>
          <Activity size={16} />
          <span>
            <strong>Demo Mode</strong> — You are viewing the application with sample data. Connect a backend to process real images.
          </span>
        </div>
      )}

      {/* Welcome Section */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #19B5A5, #58D6E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Waves size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
              AquaVision AI
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
              Intelligent Underwater Image Enhancement & Marine Object Detection
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
        <Link to="/enhancement" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.15s', borderColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-teal-400)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Sparkles size={20} color="var(--color-teal-500)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Enhance Image</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Improve underwater visibility</div>
              </div>
              <ArrowRight size={16} color="var(--color-surface-400)" style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        </Link>
        <Link to="/detection" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-teal-400)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ScanSearch size={20} color="#3B82F6" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Detect Objects</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Identify marine organisms</div>
              </div>
              <ArrowRight size={16} color="var(--color-surface-400)" style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        </Link>
        <Link to="/video-analysis" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-teal-400)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Video size={20} color="#8B5CF6" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Analyze Video</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Frame-by-frame processing</div>
              </div>
              <ArrowRight size={16} color="var(--color-surface-400)" style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        </Link>
        <Link to="/evaluation" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-teal-400)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BarChart3 size={20} color="#F59E0B" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>View Evaluation</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Research metrics & charts</div>
              </div>
              <ArrowRight size={16} color="var(--color-surface-400)" style={{ marginLeft: 'auto' }} />
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard
          label="Analysis Sessions"
          value={stats.total}
          icon={<Layers size={20} />}
          color="var(--color-teal-500)"
          subtitle={isDemo && sessions.length === 0 ? 'Demo data' : undefined}
        />
        <StatCard
          label="Images Analyzed"
          value={stats.images}
          icon={<ImageIcon size={20} />}
          color="#3B82F6"
          subtitle={isDemo && sessions.length === 0 ? 'Demo data' : undefined}
        />
        <StatCard
          label="Objects Detected"
          value={stats.detected}
          icon={<ScanSearch size={20} />}
          color="#8B5CF6"
          subtitle={isDemo && sessions.length === 0 ? 'Demo data' : undefined}
        />
        <StatCard
          label="Avg. Processing"
          value={stats.avgTime > 0 ? formatDuration(stats.avgTime) : '—'}
          icon={<Clock size={20} />}
          color="#F59E0B"
          subtitle={isDemo && sessions.length === 0 ? 'Demo data' : undefined}
        />
      </div>

      {/* Two-column: Recent Analysis + Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent Analysis */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Analysis</h2>
            <Link to="/history" style={{ fontSize: 13, color: 'var(--color-teal-500)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <div className="card-body">
              <EmptyState
                icon={<ImageIcon size={40} />}
                title="No analyses yet"
                description="Upload an underwater image to get started with enhancement or detection."
                action={
                  <Link to="/enhancement" className="btn btn-primary btn-sm">
                    <Sparkles size={14} /> Start Analysis
                  </Link>
                }
              />
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {session.fileName}
                          </span>
                          {session.isDemo && <DemoLabel compact />}
                        </div>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{session.type}</td>
                      <td><StatusBadge status={session.status} /></td>
                      <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        {formatRelativeTime(session.createdAt)}
                      </td>
                      <td>
                        <Link to={`/history/${session.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pipeline Status + Research Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Pipeline Status */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Pipeline Status</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {([
                { name: 'Input Acquisition', status: 'ready', desc: 'Image or video upload' },
                { name: 'Image Enhancement', status: isDemo ? 'unavailable' : 'ready', desc: isDemo ? 'No model connected' : 'Enhancement model ready' },
                { name: 'Object Detection', status: isDemo ? 'unavailable' : 'ready', desc: isDemo ? 'No model connected' : 'Detection model ready' },
                { name: 'Evaluation', status: 'ready', desc: 'Metrics computation' },
              ] as Array<{ name: string; status: string; desc: string }>).map((stage) => (
                <div key={stage.name} className={`pipeline-stage ${stage.status === 'ready' ? '' : stage.status}`}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: stage.status === 'ready' ? 'var(--color-success)' :
                      stage.status === 'unavailable' ? 'var(--color-text-muted)' : 'var(--color-warning)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{stage.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{stage.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Overview */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Research Overview</h2>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
                This system integrates underwater image enhancement with real-time marine object detection using a YOLO-family detector.
              </p>
              <div style={{ fontSize: 13 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluation</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['PSNR', 'SSIM', 'UIQM', 'UCIQE', 'Precision', 'Recall', 'F1', 'mAP'].map((m) => (
                    <span key={m} className="badge badge-neutral" style={{ fontSize: 11 }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override for the two-column grid */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
