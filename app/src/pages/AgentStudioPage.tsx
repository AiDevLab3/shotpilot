import React, { useState, useEffect } from 'react';
import {
  getAgentModels,
  getAgentProject,
  getAgentProjectScenes,
  generateShot,
  generateScene,
  type AgentModel,
  type AgentScene,
} from '../services/agentApi';
import { Zap, Play, Loader2, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react';

// Previous generation results (from yesterday's test runs)
const PREVIOUS_GENERATIONS = [
  { name: 'Astrodome Reveal', file: 'astrodome_reveal_v1.jpg', standalone: '6.5/10', pipeline: '4.5/10', verdict: 'REJECTED', note: 'Concept art feel — not photorealistic enough' },
  { name: 'Hero Tactical', file: 'hero_tactical_v1.jpg', standalone: '5.5/10', pipeline: '4/10', verdict: 'REJECTED', note: 'Video game shader look, waxy skin' },
  { name: 'Hero Visor Closeup', file: 'hero_visor_closeup_v1.jpg', standalone: '7.5/10', pipeline: '5.2/10', verdict: 'REJECTED', note: 'Best of batch — macro hides AI weaknesses' },
  { name: 'Interceptor Motorcycle', file: 'interceptor_motorcycle_v1.jpg', standalone: '6/10', pipeline: '4/10', verdict: 'REJECTED', note: 'Mechanically incoherent geometry' },
  { name: 'Property Manager', file: 'property_manager_v1.jpg', standalone: '7.5/10', pipeline: '4.5/10', verdict: 'REJECTED', note: 'Hand issues, waxy skin texture' },
  { name: 'Resolution Mist', file: 'resolution_mist_v1.jpg', standalone: '7/10', pipeline: '4/10', verdict: 'REJECTED', note: 'Atmospheric but concept-art quality' },
  { name: 'Signal Scene', file: 'signal_scene_v1.jpg', standalone: '7/10', pipeline: '4/10', verdict: 'REJECTED', note: 'Garbled symbol detail' },
  { name: 'Tactical Pursuit', file: 'tactical_pursuit_v1.jpg', standalone: '5.5/10', pipeline: '4/10', verdict: 'REJECTED', note: 'Multi-vehicle complexity failure' },
];

export const AgentStudioPage: React.FC = () => {
  const [models, setModels] = useState<AgentModel[]>([]);
  const [scenes, setScenes] = useState<AgentScene[]>([]);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generation state
  const [selectedScene, setSelectedScene] = useState<string>('');
  const [freeformDesc, setFreeformDesc] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'previous' | 'scenes'>('generate');

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [modelsRes, projectRes, scenesRes] = await Promise.all([
        getAgentModels(),
        getAgentProject('tcpw-dark-knight'),
        getAgentProjectScenes('tcpw-dark-knight'),
      ]);
      setModels(modelsRes.models || []);
      setProjectInfo(projectRes);
      setScenes(scenesRes.scenes || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!freeformDesc && !selectedScene) return;
    setGenerating(true);
    try {
      let result;
      if (selectedScene) {
        result = await generateScene({
          project_id: 'tcpw-dark-knight',
          scene_id: selectedScene,
          model_preference: selectedModel || undefined,
        });
      } else {
        result = await generateShot({
          description: freeformDesc,
          project_id: 'tcpw-dark-knight',
          model_preference: selectedModel || undefined,
        });
      }
      setResults(prev => [{ ...result, timestamp: new Date().toISOString(), input: freeformDesc || `Scene: ${selectedScene}` }, ...prev]);
    } catch (err: any) {
      setResults(prev => [{ error: err.message, timestamp: new Date().toISOString(), input: freeformDesc || `Scene: ${selectedScene}` }, ...prev]);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={s.container}>
        <div style={s.center}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading Agent Studio...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={s.container}>
        <div style={{ ...s.center, color: '#ef4444' }}>
          <AlertTriangle size={24} /> {error}
          <button onClick={loadData} style={s.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}><Sparkles size={20} /> Agent Studio</h1>
          <p style={s.subtitle}>
            {projectInfo?.project?.name || 'TCPW Dark Knight'} • {models.length} models • {scenes.length} scenes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {(['generate', 'previous', 'scenes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
          >
            {tab === 'generate' ? '⚡ Generate' : tab === 'previous' ? '🖼️ Previous Outputs' : '🎬 Scenes'}
          </button>
        ))}
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div style={s.content}>
          {/* Input Section */}
          <div style={s.card}>
            <div style={s.cardTitle}>Generate a Shot</div>
            <div style={s.formGrid}>
              <div style={s.formGroup}>
                <label style={s.label}>Scene (optional)</label>
                <select
                  value={selectedScene}
                  onChange={e => { setSelectedScene(e.target.value); if (e.target.value) setFreeformDesc(''); }}
                  style={s.select}
                >
                  <option value="">— Freeform description —</option>
                  {scenes.map(sc => (
                    <option key={sc.id} value={sc.id}>Scene {sc.number}: {sc.name}</option>
                  ))}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Model Preference</label>
                <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} style={s.select}>
                  <option value="">Auto (CD picks best)</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}{m.hasAPI ? '' : ' (no API)'}</option>
                  ))}
                </select>
              </div>
            </div>
            {!selectedScene && (
              <div style={s.formGroup}>
                <label style={s.label}>Shot Description</label>
                <textarea
                  value={freeformDesc}
                  onChange={e => setFreeformDesc(e.target.value)}
                  placeholder="e.g. Wide shot of the TCPW truck emerging from fog in a dark parking garage, headlights cutting through mist..."
                  style={s.textarea}
                />
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating || (!freeformDesc && !selectedScene)}
              style={{ ...s.generateBtn, opacity: (generating || (!freeformDesc && !selectedScene)) ? 0.5 : 1 }}
            >
              {generating ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Zap size={16} /> Generate</>}
            </button>
          </div>

          {/* Results */}
          {results.map((r, i) => (
            <ResultCard key={i} result={r} />
          ))}
        </div>
      )}

      {/* Previous Outputs Tab */}
      {activeTab === 'previous' && (
        <div style={s.content}>
          <div style={{ ...s.card, padding: '16px' }}>
            <div style={s.cardTitle}>Test Generations (Feb 19) — Flux 2 via fal.ai</div>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
              All generated through the agent pipeline. QG calibrated for downstream pipeline contamination.
              Pipeline score = "would this poison future generations if used as a reference?"
            </p>
            <div style={s.imageGrid}>
              {PREVIOUS_GENERATIONS.map((gen, i) => (
                <div key={i} style={s.imageCard}>
                  <div
                    style={{ ...s.imageThumb, cursor: 'pointer' }}
                    onClick={() => setLightboxImg(`/uploads/images/${gen.file}`)}
                  >
                    <img
                      src={`/uploads/images/${gen.file}`}
                      alt={gen.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div style={s.imageInfo}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#e5e7eb' }}>{gen.name}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span style={s.scoreBadge}>Standalone: {gen.standalone}</span>
                      <span style={{ ...s.scoreBadge, backgroundColor: '#7f1d1d' }}>Pipeline: {gen.pipeline}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{gen.note}</div>
                    <div style={{ ...s.verdictBadge, backgroundColor: '#7f1d1d', color: '#fca5a5' }}>
                      <XCircle size={12} /> {gen.verdict}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...s.card, padding: '16px', marginTop: '12px' }}>
            <div style={s.cardTitle}>Key Findings</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <div style={s.findingCard}>
                <CheckCircle size={16} color="#22c55e" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#e5e7eb' }}>AI Excels At</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Environments, silhouettes, macro/insert shots, atmospheric mood
                  </div>
                </div>
              </div>
              <div style={s.findingCard}>
                <XCircle size={16} color="#ef4444" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#e5e7eb' }}>AI Fails At</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Characters (waxy skin, hands), vehicles (impossible geometry), tactical gear
                  </div>
                </div>
              </div>
              <div style={s.findingCard}>
                <Sparkles size={16} color="#8b5cf6" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#e5e7eb' }}>Strategy</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    AI for environments/mood, real photography for characters & TCPW vehicles
                  </div>
                </div>
              </div>
              <div style={s.findingCard}>
                <AlertTriangle size={16} color="#eab308" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#e5e7eb' }}>QG Pipeline Score</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Measures contamination risk — refs scoring &lt;7 poison downstream generations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenes Tab */}
      {activeTab === 'scenes' && (
        <div style={s.content}>
          {scenes.map((scene, _i) => (
            <SceneCard key={scene.id} scene={scene} onGenerate={(sceneId) => {
              setSelectedScene(sceneId);
              setActiveTab('generate');
            }} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div style={s.lightbox} onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} style={s.lightboxImg} alt="Full size" />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// Result card for new generations
const ResultCard: React.FC<{ result: any }> = ({ result }) => {
  const [expanded, setExpanded] = useState(true);

  if (result.error) {
    return (
      <div style={{ ...s.card, borderColor: '#7f1d1d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
          <XCircle size={16} /> Generation Failed
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{result.input}</div>
        <pre style={s.errorPre}>{result.error}</pre>
      </div>
    );
  }

  return (
    <div style={s.card}>
      <button onClick={() => setExpanded(!expanded)} style={s.resultHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={14} color="#8b5cf6" />
          <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '13px' }}>
            {result.input}
          </span>
          {result.model_selected && (
            <span style={{ ...s.scoreBadge, backgroundColor: '#1e1b4b' }}>
              {result.model_selected}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
      </button>
      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {/* Brief */}
          {result.brief && (
            <div style={s.resultSection}>
              <div style={s.resultLabel}>Creative Brief</div>
              <pre style={s.resultPre}>{typeof result.brief === 'string' ? result.brief : JSON.stringify(result.brief, null, 2)}</pre>
            </div>
          )}
          {/* Prompt */}
          {result.prompt && (
            <div style={s.resultSection}>
              <div style={s.resultLabel}>Generated Prompt</div>
              <pre style={s.resultPre}>{typeof result.prompt === 'string' ? result.prompt : JSON.stringify(result.prompt, null, 2)}</pre>
            </div>
          )}
          {/* Quality Gate */}
          {result.quality_gate && (
            <div style={s.resultSection}>
              <div style={s.resultLabel}>Quality Gate</div>
              <pre style={s.resultPre}>{JSON.stringify(result.quality_gate, null, 2)}</pre>
            </div>
          )}
          {/* Full JSON toggle */}
          <details style={{ marginTop: '8px' }}>
            <summary style={{ fontSize: '11px', color: '#6b7280', cursor: 'pointer' }}>Full JSON Response</summary>
            <pre style={{ ...s.resultPre, maxHeight: '400px' }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

// Scene card
const SceneCard: React.FC<{ scene: AgentScene; onGenerate: (id: string) => void }> = ({ scene, onGenerate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={s.card}>
      <button onClick={() => setExpanded(!expanded)} style={s.resultHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#8b5cf6', minWidth: '24px' }}>
            {scene.number}
          </span>
          <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '13px' }}>{scene.name}</span>
          {scene.location && <span style={{ ...s.scoreBadge, backgroundColor: '#1a2332' }}>{scene.location}</span>}
          {scene.time_of_day && <span style={{ ...s.scoreBadge, backgroundColor: '#1a2332' }}>{scene.time_of_day}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onGenerate(scene.id); }}
            style={s.sceneGenBtn}
          >
            <Play size={12} /> Generate
          </button>
          {expanded ? <ChevronUp size={14} color="#6b7280" /> : <ChevronDown size={14} color="#6b7280" />}
        </div>
      </button>
      {expanded && (
        <div style={{ marginTop: '8px', paddingLeft: '32px' }}>
          {scene.description && <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>{scene.description}</p>}
          {scene.mood && <div style={{ fontSize: '12px', color: '#6b7280' }}>Mood: <span style={{ color: '#9ca3af' }}>{scene.mood}</span></div>}
          {scene.shots && scene.shots.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Shots</div>
              {scene.shots.map((shot, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#9ca3af', padding: '4px 0', borderBottom: '1px solid #27272a' }}>
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{shot.shot_type || 'Shot'}</span>: {shot.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#0f0f11',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '100%',
    color: '#9ca3af',
    fontSize: '14px',
  },
  header: {
    padding: '16px 20px 8px',
    flexShrink: 0,
  },
  title: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '8px 20px',
    flexShrink: 0,
  },
  tab: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: '1px solid #27272a',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#e5e7eb',
    backgroundColor: '#27272a',
    borderColor: '#3f3f46',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '8px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    padding: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e5e7eb',
    marginBottom: '12px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#e5e7eb',
    fontSize: '13px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#e5e7eb',
    fontSize: '13px',
    minHeight: '80px',
    resize: 'vertical' as const,
    outline: 'none',
    fontFamily: 'sans-serif',
    lineHeight: '1.5',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  generateBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 24px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  retryBtn: {
    padding: '8px 16px',
    backgroundColor: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#e5e7eb',
    fontSize: '12px',
    cursor: 'pointer',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '12px',
  },
  imageCard: {
    backgroundColor: '#1f1f23',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #27272a',
  },
  imageThumb: {
    width: '100%',
    height: '180px',
    backgroundColor: '#27272a',
    position: 'relative' as const,
  },
  imageInfo: {
    padding: '10px 12px',
  },
  scoreBadge: {
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
  },
  verdictBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    marginTop: '6px',
  },
  findingCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#1f1f23',
    borderRadius: '6px',
    border: '1px solid #27272a',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  resultSection: {
    marginBottom: '12px',
  },
  resultLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  resultPre: {
    backgroundColor: '#0f0f11',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '11px',
    color: '#9ca3af',
    overflow: 'auto',
    maxHeight: '200px',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    margin: 0,
    fontFamily: 'monospace',
  },
  errorPre: {
    backgroundColor: '#1a0000',
    border: '1px solid #7f1d1d',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '11px',
    color: '#fca5a5',
    marginTop: '8px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
  },
  sceneGenBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  lightbox: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'pointer',
  },
  lightboxImg: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  },
};

export default AgentStudioPage;
