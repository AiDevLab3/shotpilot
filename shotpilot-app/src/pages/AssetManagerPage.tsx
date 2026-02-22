import React, { useState, useEffect, useCallback } from 'react';
import { useProjectContext } from '../components/ProjectLayout';
import {
  getProjectAssets,
  updateAsset,
  analyzeAsset,
  analyzeAllAssets,
  getRefinementPlan,
  setAssetSource,
  getAssetIterations,
  generateFromPlan,
  getFilmStocks,
  transformPrompt,
  runPipeline,
  deleteAsset,
  type Asset,
  type AssetAnalysis,
  type RefinementPlan,
  type GenerateResult,
  type FilmStock,
  type PipelineResult,
  type TransformPromptResult,
  type ReferenceImage,
} from '../services/assetApi';
import { getCostSummary, type CostSummary } from '../services/costApi';
import {
  Loader2, Search, SlidersHorizontal, Sparkles, Eye, CheckCircle, XCircle,
  AlertTriangle, Camera, Cpu, ImageIcon, ChevronDown, ChevronUp, RefreshCw,
  Filter, X,
} from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  approved: { bg: '#052e16', text: '#4ade80', icon: <CheckCircle size={12} /> },
  needs_work: { bg: '#422006', text: '#fbbf24', icon: <AlertTriangle size={12} /> },
  rejected: { bg: '#450a0a', text: '#f87171', icon: <XCircle size={12} /> },
  unreviewed: { bg: '#1e1b4b', text: '#a78bfa', icon: <Eye size={12} /> },
};

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  real_ref: { label: 'Real Photo', icon: <Camera size={12} /> },
  ai_generated: { label: 'AI Generated', icon: <Cpu size={12} /> },
  style_ref: { label: 'Style Ref', icon: <Sparkles size={12} /> },
  unclassified: { label: 'Unclassified', icon: <ImageIcon size={12} /> },
};

const CATEGORY_LABELS: Record<string, string> = {
  hero: '🦸 Hero',
  property_manager: '👩‍💼 Property Manager',
  vehicle: '🚛 Vehicle',
  environment: '🏙️ Environment',
  dome: '🏟️ Dome/Astrodome',
  equipment: '🔧 Equipment',
  character_other: '👤 Character',
  scene_composite: '🎬 Scene Composite',
  other: '📦 Other',
};

// Cost Banner Component
const CostBanner: React.FC<{
  costSummary: CostSummary | null;
  loading: boolean;
  onRefresh: () => void;
  projectId: number;
}> = ({ costSummary, loading, onRefresh, projectId }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCostColor = (cost: number, type: 'action' | 'daily') => {
    if (type === 'action') {
      if (cost < 0.10) return '#4ade80'; // green
      if (cost < 1) return '#fbbf24'; // yellow
      return '#f87171'; // red
    } else {
      if (cost < 5) return '#4ade80'; // green
      if (cost < 20) return '#fbbf24'; // yellow
      return '#f87171'; // red
    }
  };

  const formatCost = (cost: number) => `$${cost.toFixed(cost >= 1 ? 2 : 4)}`;

  if (loading) {
    return (
      <div style={s.costBanner}>
        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!costSummary) return null;

  const projectTotal = costSummary.project_totals.find(p => p.project_id === projectId);
  const lastActionCost = costSummary.last_action?.cost || 0;
  const dailyCost = costSummary.daily_total.total_cost;
  const projectCost = projectTotal?.total_cost || 0;

  return (
    <div style={s.costBanner}>
      <div style={s.costPills}>
        {/* Last Action */}
        <div style={{
          ...s.costPill,
          borderColor: getCostColor(lastActionCost, 'action'),
          color: getCostColor(lastActionCost, 'action')
        }}>
          💰 Last: {formatCost(lastActionCost)}
        </div>

        {/* Daily Total */}
        <div style={{
          ...s.costPill,
          borderColor: getCostColor(dailyCost, 'daily'),
          color: getCostColor(dailyCost, 'daily')
        }}>
          📅 Today: {formatCost(dailyCost)}
        </div>

        {/* Project Total */}
        <div style={{
          ...s.costPill,
          borderColor: '#8b5cf6',
          color: '#8b5cf6'
        }}>
          📁 Project: {formatCost(projectCost)}
        </div>
      </div>

      {/* Refresh Button */}
      <button 
        onClick={onRefresh}
        style={{...s.iconBtn, padding: '4px'}}
        title="Refresh cost data"
      >
        <RefreshCw size={10} />
      </button>

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{...s.iconBtn, padding: '4px'}}
        title="Cost breakdown"
      >
        {showDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
      </button>

      {/* Dropdown Details */}
      {showDetails && (
        <div style={s.costDetails}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#e5e7eb', marginBottom: '6px' }}>
            Today's Breakdown
          </div>
          {costSummary.daily_total.breakdown_by_action.slice(0, 4).map(action => (
            <div key={action.action} style={s.costDetailRow}>
              <span>{action.action}</span>
              <span>{formatCost(action.cost)} ({action.count}x)</span>
            </div>
          ))}
          {costSummary.daily_total.breakdown_by_action.length === 0 && (
            <div style={{ fontSize: '10px', color: '#6b7280' }}>No activity today</div>
          )}
        </div>
      )}
    </div>
  );
};

export const AssetManagerPage: React.FC = () => {
  const { projectId } = useProjectContext();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<Set<number>>(new Set());
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('id');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [pollTimer, setPollTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [costLoading, setCostLoading] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      const data = await getProjectAssets(projectId);
      setAssets(data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadCostSummary = useCallback(async () => {
    setCostLoading(true);
    try {
      const summary = await getCostSummary();
      setCostSummary(summary);
    } catch (err) {
      console.error('Failed to load cost summary:', err);
    } finally {
      setCostLoading(false);
    }
  }, []);

  useEffect(() => { loadAssets(); }, [loadAssets]);
  useEffect(() => { loadCostSummary(); }, [loadCostSummary]);

  // Cleanup poll timer
  useEffect(() => () => { if (pollTimer) clearInterval(pollTimer); }, [pollTimer]);

  const handleAnalyze = async (id: number) => {
    setAnalyzing(prev => new Set(prev).add(id));
    try {
      const { asset } = await analyzeAsset(id);
      setAssets(prev => prev.map(a => a.id === id ? asset : a));
      if (selectedAsset?.id === id) setSelectedAsset(asset);
      // Refresh cost data after analysis
      loadCostSummary();
    } catch (err: any) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleAnalyzeAll = async () => {
    setBatchAnalyzing(true);
    try {
      const { queued } = await analyzeAllAssets(projectId);
      if (queued > 0) {
        // Poll for updates every 3 seconds
        const timer = setInterval(async () => {
          const data = await getProjectAssets(projectId);
          setAssets(data);
          const stillUnreviewed = data.filter(a => !a.status || a.status === 'unreviewed').length;
          if (stillUnreviewed === 0) {
            clearInterval(timer);
            setBatchAnalyzing(false);
            setPollTimer(null);
            // Refresh cost data after batch analysis
            loadCostSummary();
          }
        }, 3000);
        setPollTimer(timer);
      } else {
        setBatchAnalyzing(false);
      }
    } catch (err: any) {
      console.error('Batch analysis failed:', err);
      setBatchAnalyzing(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    const updated = await updateAsset(id, { status } as any);
    setAssets(prev => prev.map(a => a.id === id ? updated : a));
    if (selectedAsset?.id === id) setSelectedAsset(updated);
  };

  const handleSceneAssign = async (id: number, sceneId: string) => {
    const updated = await updateAsset(id, { scene_id: sceneId || null } as any);
    setAssets(prev => prev.map(a => a.id === id ? updated : a));
    if (selectedAsset?.id === id) setSelectedAsset(updated);
  };

  // Filtering & sorting
  const filtered = assets.filter(a => {
    if (searchTerm && !(a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(a.notes || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus !== 'all' && (a.status || 'unreviewed') !== filterStatus) return false;
    if (filterType !== 'all' && (a.asset_type || 'unclassified') !== filterType) return false;
    if (filterCategory !== 'all' && a.subject_category !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'realism') return (b.realism_score || 0) - (a.realism_score || 0);
    if (sortBy === 'style') return (b.style_score || 0) - (a.style_score || 0);
    if (sortBy === 'status') return (a.status || 'z').localeCompare(b.status || 'z');
    return a.id - b.id;
  });

  // Stats
  const stats = {
    total: assets.length,
    reviewed: assets.filter(a => a.status && a.status !== 'unreviewed').length,
    approved: assets.filter(a => a.status === 'approved').length,
    needsWork: assets.filter(a => a.status === 'needs_work').length,
    rejected: assets.filter(a => a.status === 'rejected').length,
  };

  // Active categories
  const activeCategories = [...new Set(assets.map(a => a.subject_category).filter(Boolean))];

  if (loading) {
    return <div style={s.center}><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading assets...</div>;
  }

  return (
    <div style={s.container}>
      {/* Header bar */}
      <div style={s.topBar}>
        <div>
          <h2 style={s.title}>Asset Manager</h2>
          <div style={s.statsRow}>
            <span style={s.stat}>{stats.total} assets</span>
            <span style={{ ...s.stat, color: '#4ade80' }}>✓ {stats.approved} approved</span>
            <span style={{ ...s.stat, color: '#fbbf24' }}>⚠ {stats.needsWork} needs work</span>
            <span style={{ ...s.stat, color: '#f87171' }}>✗ {stats.rejected} rejected</span>
            <span style={{ ...s.stat, color: '#a78bfa' }}>◎ {stats.total - stats.reviewed} unreviewed</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <CostBanner 
            costSummary={costSummary}
            loading={costLoading}
            onRefresh={loadCostSummary}
            projectId={projectId}
          />
          <button onClick={loadAssets} style={s.iconBtn} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleAnalyzeAll}
            disabled={batchAnalyzing}
            style={{ ...s.primaryBtn, opacity: batchAnalyzing ? 0.6 : 1 }}
          >
            {batchAnalyzing ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={14} /> Analyze All Unreviewed</>}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={s.filterBar}>
        <div style={s.searchBox}>
          <Search size={14} color="#6b7280" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search assets..."
            style={s.searchInput}
          />
          {searchTerm && <X size={14} color="#6b7280" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm('')} />}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.filterSelect}>
          <option value="all">All Status</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="approved">Approved</option>
          <option value="needs_work">Needs Work</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={s.filterSelect}>
          <option value="all">All Types</option>
          <option value="real_ref">Real Photo</option>
          <option value="ai_generated">AI Generated</option>
          <option value="style_ref">Style Ref</option>
          <option value="unclassified">Unclassified</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={s.filterSelect}>
          <option value="all">All Categories</option>
          {activeCategories.map(c => (
            <option key={c} value={c!}>{CATEGORY_LABELS[c!] || c}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={s.filterSelect}>
          <option value="id">Sort: Default</option>
          <option value="realism">Sort: Cinematic Realism ↓</option>
          <option value="style">Sort: Style Match ↓</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Main content: grid + detail panel */}
      <div style={s.mainContent}>
        {/* Image grid */}
        <div style={s.gridContainer}>
          <div style={s.grid}>
            {filtered.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={selectedAsset?.id === asset.id}
                isAnalyzing={analyzing.has(asset.id)}
                onSelect={() => setSelectedAsset(selectedAsset?.id === asset.id ? null : asset)}
                onAnalyze={() => handleAnalyze(asset.id)}
                onImageClick={() => setLightboxImg(asset.image_url)}
                onDelete={async () => {
                  if (!confirm(`Delete "${asset.title || 'Asset #' + asset.id}"?`)) return;
                  try {
                    await deleteAsset(asset.id);
                    if (selectedAsset?.id === asset.id) setSelectedAsset(null);
                    loadAssets();
                  } catch (err: any) { console.error('Delete failed:', err); }
                }}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ ...s.center, height: '200px', color: '#6b7280' }}>
              No assets match your filters
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedAsset && (
          <DetailPanel
            asset={selectedAsset}
            isAnalyzing={analyzing.has(selectedAsset.id)}
            onAnalyze={() => handleAnalyze(selectedAsset.id)}
            onStatusChange={(status) => handleStatusChange(selectedAsset.id, status)}
            onSceneAssign={(sceneId) => handleSceneAssign(selectedAsset.id, sceneId)}
            onClose={() => setSelectedAsset(null)}
            onImageClick={() => setLightboxImg(selectedAsset.image_url)}
            onAssetUpdate={(updated) => {
              // If this is a new asset (from generation), reload the whole list
              if (!assets.find(a => a.id === updated.id)) {
                loadAssets().then(() => setSelectedAsset(updated));
              } else {
                setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
                setSelectedAsset(updated);
              }
            }}
            onCostRefresh={loadCostSummary}
            projectAssets={assets}
            onDelete={async () => {
              if (!confirm(`Delete "${selectedAsset.title || 'Asset #' + selectedAsset.id}"? This also removes its iterations.`)) return;
              try {
                await deleteAsset(selectedAsset.id);
                setSelectedAsset(null);
                loadAssets();
              } catch (err: any) {
                console.error('Delete failed:', err);
              }
            }}
          />
        )}
      </div>

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

// Asset card in the grid — hover overlay with action icons
const AssetCard: React.FC<{
  asset: Asset;
  isSelected: boolean;
  isAnalyzing: boolean;
  onSelect: () => void;
  onAnalyze: () => void;
  onImageClick: () => void;
  onDelete: () => void;
}> = ({ asset, isSelected, isAnalyzing, onSelect, onAnalyze, onImageClick, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const status = asset.status || 'unreviewed';
  const statusInfo = STATUS_COLORS[status] || STATUS_COLORS.unreviewed;
  const typeInfo = TYPE_LABELS[asset.asset_type || 'unclassified'] || TYPE_LABELS.unclassified;

  return (
    <div
      style={{
        ...s.card,
        borderColor: isSelected ? '#8b5cf6' : '#27272a',
        boxShadow: isSelected ? '0 0 0 1px #8b5cf6' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image with hover overlay */}
      <div style={s.cardImage}>
        <img src={asset.image_url} alt={asset.title || ''} style={s.cardImg}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />

        {/* Status badge — always visible */}
        <div style={{ ...s.statusBadge, backgroundColor: statusInfo.bg, color: statusInfo.text }}>
          {statusInfo.icon} {status.replace('_', ' ')}
        </div>
        {/* Type badge — always visible */}
        <div style={s.typeBadge}>
          {typeInfo.icon} {typeInfo.label}
        </div>

        {/* Hover overlay with action icons */}
        {hovered && (
          <div style={s.cardOverlay}>
            <div style={s.overlayActions}>
              <button
                onClick={e => { e.stopPropagation(); onImageClick(); }}
                style={s.overlayBtn}
                title="View full size"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onSelect(); }}
                style={{ ...s.overlayBtn, backgroundColor: '#7c3aed' }}
                title={status === 'unreviewed' ? 'Analyze & Review' : 'Open details / Refine'}
              >
                {status === 'unreviewed' ? <Sparkles size={16} /> : <SlidersHorizontal size={16} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(); }}
                style={{ ...s.overlayBtn, backgroundColor: '#7f1d1d' }}
                title="Delete asset"
              >
                <X size={16} />
              </button>
            </div>
            {/* Quick action label */}
            <div style={s.overlayLabel}>
              {status === 'unreviewed' ? 'Click to analyze' : 'Click to review'}
            </div>
          </div>
        )}
      </div>

      {/* Info — click to open detail panel */}
      <div style={s.cardInfo} onClick={onSelect}>
        <div style={s.cardTitle}>{asset.title || `Asset #${asset.id}`}</div>
        {asset.subject_category && (
          <div style={s.categoryTag}>{CATEGORY_LABELS[asset.subject_category] || asset.subject_category}</div>
        )}
        {/* Scores */}
        {asset.realism_score != null && (
          <div style={s.scoreRow}>
            <ScorePill label="Realism" value={asset.realism_score} />
            <ScorePill label="Style" value={asset.style_score!} />
          </div>
        )}
        {/* Analyzing indicator */}
        {isAnalyzing && (
          <div style={{ ...s.analyzeBtn, pointerEvents: 'none' as const }}>
            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...
          </div>
        )}
      </div>
    </div>
  );
};

// Score pill
const ScorePill: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 8 ? '#4ade80' : value >= 6 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ ...s.scorePill, borderColor: color }}>
      <span style={{ color: '#6b7280', fontSize: '9px' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
};

// Detail panel
const DetailPanel: React.FC<{
  asset: Asset;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onStatusChange: (status: string) => void;
  onSceneAssign: (sceneId: string) => void;
  onClose: () => void;
  onImageClick: () => void;
  onAssetUpdate: (asset: Asset) => void;
  onCostRefresh: () => void;
  onDelete: () => void;
  projectAssets: Asset[];
}> = ({ asset, isAnalyzing, onAnalyze, onStatusChange, onSceneAssign, onClose, onImageClick, onAssetUpdate, onCostRefresh, onDelete, projectAssets }) => {
  let analysis: any = null;
  let existingPlan: RefinementPlan | null = null;
  try { analysis = asset.analysis_json ? JSON.parse(typeof asset.analysis_json === 'string' ? asset.analysis_json : JSON.stringify(asset.analysis_json)) : null; } catch {}
  try { existingPlan = asset.refinement_json ? JSON.parse(typeof asset.refinement_json === 'string' ? asset.refinement_json : JSON.stringify(asset.refinement_json)) : null; } catch {}
  const [plan, setPlan] = useState<RefinementPlan | null>(existingPlan);
  const [planLoading, setPlanLoading] = useState(false);
  const [showSourceEdit, setShowSourceEdit] = useState(false);
  const [sourceModel, setSourceModel] = useState(asset.source_model || '');
  const [sourcePrompt, setSourcePrompt] = useState(asset.source_prompt || '');
  const [iterations, setIterations] = useState<Asset[]>([]);
  const [showIterations, setShowIterations] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'analysis' | 'refine'>('analysis');
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  
  // New state for enhanced features
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [filmStocks, setFilmStocks] = useState<FilmStock[]>([]);
  const [selectedFilmStock, setSelectedFilmStock] = useState<string>('');
  const [realismLock, setRealismLock] = useState(true);
  const [batchSize, setBatchSize] = useState(4);
  const [transformedPrompt, setTransformedPrompt] = useState<string>('');
  const [transformLoading, setTransformLoading] = useState(false);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  
  // Reference images state
  const [selectedRefs, setSelectedRefs] = useState<ReferenceImage[]>([]);
  const [showRefPicker, setShowRefPicker] = useState(false);
  
  const status = asset.status || 'unreviewed';

  // Load film stocks on mount
  useEffect(() => {
    const loadFilmStocks = async () => {
      try {
        const stocks = await getFilmStocks();
        setFilmStocks(stocks);
      } catch (err) {
        console.error('Failed to load film stocks:', err);
      }
    };
    loadFilmStocks();
  }, []);

  // Reset state when asset changes
  useEffect(() => {
    let p: RefinementPlan | null = null;
    try { p = asset.refinement_json ? JSON.parse(typeof asset.refinement_json === 'string' ? asset.refinement_json : JSON.stringify(asset.refinement_json)) : null; } catch {}
    setPlan(p);
    setSourceModel(asset.source_model || '');
    setSourcePrompt(asset.source_prompt || '');
    setShowSourceEdit(false);
    setSelectedRefs([]);  // Clear references when switching assets
    setShowIterations(false);
    setCopied(false);
    setSelectedModel(p?.recommended_model || '');
    setTransformedPrompt('');
    setSelectedFilmStock('');
    setRealismLock(true);
    setBatchSize(4);
    setGenerateResult(null);
    setPipelineResult(null);
  }, [asset.id]);

  const handleGetPlan = async () => {
    setPlanLoading(true);
    try {
      // Convert selectedRefs to the API format
      const referenceImages = selectedRefs.map(ref => ({
        asset_id: ref.assetId,
        role: ref.role,
        image_url: ref.imageUrl
      }));
      
      const { plan: newPlan, asset: updated } = await getRefinementPlan(asset.id, {
        source_model: sourceModel || undefined,
        source_prompt: sourcePrompt || undefined,
        reference_images: referenceImages.length > 0 ? referenceImages : undefined,
      });
      setPlan(newPlan);
      onAssetUpdate(updated);
      // Refresh cost data after plan generation
      onCostRefresh();
    } catch (err: any) {
      console.error('Refinement plan failed:', err);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleSaveSource = async () => {
    const updated = await setAssetSource(asset.id, sourceModel, sourcePrompt);
    onAssetUpdate(updated);
    setShowSourceEdit(false);
  };

  // Reference image handlers
  const handleAddReference = (asset: Asset, role: string) => {
    if (selectedRefs.length >= 6) return; // Max 6 references
    const newRef: ReferenceImage = {
      assetId: asset.id,
      imageUrl: asset.image_url,
      title: asset.title || `Asset #${asset.id}`,
      role
    };
    setSelectedRefs(prev => [...prev, newRef]);
    setShowRefPicker(false);
    // Clear the plan since it was built without these references
    setPlan(null);
    console.log(`[refs] Added reference: ${newRef.title} (${role})`);
  };

  const handleRemoveReference = (index: number) => {
    setSelectedRefs(prev => prev.filter((_, i) => i !== index));
    // Clear the plan since it was built with different references
    setPlan(null);
    console.log(`[refs] Removed reference at index ${index}`);
  };

  const handleUpdateReferenceRole = (index: number, newRole: string) => {
    setSelectedRefs(prev => prev.map((ref, i) => 
      i === index ? { ...ref, role: newRole } : ref
    ));
    // Clear the plan since the reference roles changed
    setPlan(null);
    console.log(`[refs] Updated reference role at index ${index} to ${newRole}`);
  };

  const handleLoadIterations = async () => {
    const iters = await getAssetIterations(asset.id);
    setIterations(iters);
    setShowIterations(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateResult(null);
    try {
      // Convert selectedRefs to the API format
      const referenceImages = selectedRefs.map(ref => ({
        image_url: ref.imageUrl,
        role: ref.role
      }));
      
      const result = await generateFromPlan(asset.id, { 
        model: selectedModel || 'flux-2',
        film_stock: selectedFilmStock || undefined,
        realism_lock: realismLock,
        num_images: batchSize,
        reference_images: referenceImages.length > 0 ? referenceImages : undefined
      });
      setGenerateResult(result);
      // Notify parent to refresh asset list
      if (result.generated?.length > 0) {
        result.generated.forEach(a => onAssetUpdate(a));
      }
      // Refresh cost data after generation
      onCostRefresh();
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerateResult({ generated: [], requestId: '', useReference: false, prompt: '', model: err.message } as any);
    } finally {
      setGenerating(false);
    }
  };

  const handleTransformPrompt = async () => {
    if (!plan?.refined_prompt || !selectedModel) return;
    
    setTransformLoading(true);
    try {
      // Convert selectedRefs to the API format
      const referenceImages = selectedRefs.map(ref => ({
        image_url: ref.imageUrl,
        role: ref.role
      }));
      
      const result = await transformPrompt(asset.id, {
        prompt: plan.refined_prompt,
        target_model: selectedModel,
        source_model: plan.estimated_source_model,
        reference_images: referenceImages.length > 0 ? referenceImages : undefined
      });
      setTransformedPrompt(result.transformed_prompt);
      // Refresh cost data after prompt transformation
      onCostRefresh();
    } catch (err: any) {
      console.error('Transform prompt failed:', err);
    } finally {
      setTransformLoading(false);
    }
  };

  const handlePipeline = async () => {
    if (!plan?.refined_prompt) return;
    
    setPipelineLoading(true);
    setPipelineResult(null);
    try {
      // Convert selectedRefs to the API format
      const referenceImages = selectedRefs.map(ref => ({
        image_url: ref.imageUrl,
        role: ref.role
      }));
      
      const result = await runPipeline(asset.id, {
        prompt: transformedPrompt || plan.refined_prompt,
        model: selectedModel || 'flux-2',
        film_stock: selectedFilmStock || undefined,
        realism_lock: realismLock,
        num_images: 1, // Pipeline generates one through each step
        upscale: true,
        reference_images: referenceImages.length > 0 ? referenceImages : undefined
      });
      setPipelineResult(result);
      // Notify parent to refresh asset list
      if (result.iterations?.length > 0) {
        result.iterations.forEach(a => onAssetUpdate(a));
      }
      // Refresh cost data after pipeline
      onCostRefresh();
    } catch (err: any) {
      console.error('Pipeline failed:', err);
      setPipelineResult({ 
        step1_generate: { error: err.message },
        step2_refine: null,
        step3_upscale: null,
        iterations: [],
        completed_steps: 0,
        prompt: '',
        model: '',
        pipeline_id: ''
      });
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SCENES = [
    { id: 'scene-1', name: '1: Crisis Discovery' },
    { id: 'scene-2', name: '2: The Signal' },
    { id: 'scene-3', name: '3: Astrodome Reveal' },
    { id: 'scene-4', name: '4: Tactical Pursuit' },
    { id: 'scene-5', name: '5: The Arrival' },
    { id: 'scene-6', name: '6: The Deployment' },
    { id: 'scene-7', name: '7: The Resolution' },
  ];

  return (
    <div style={s.detailPanel}>
      <div style={s.detailHeader}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb', margin: 0 }}>
          {asset.title || `Asset #${asset.id}`}
        </h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={onDelete} style={{ ...s.closeBtn, color: '#f87171' }} title="Delete asset">🗑</button>
          <button onClick={onClose} style={s.closeBtn}><X size={16} /></button>
        </div>
      </div>

      {/* Preview */}
      <div style={s.detailPreview} onClick={onImageClick}>
        <img src={asset.image_url} alt="" style={{ width: '100%', borderRadius: '6px', cursor: 'pointer' }} />
      </div>

      {/* Actions */}
      <div style={s.detailActions}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['approved', 'needs_work', 'rejected'].map(st => {
            const info = STATUS_COLORS[st];
            return (
              <button
                key={st}
                onClick={() => onStatusChange(st)}
                style={{
                  ...s.statusBtn,
                  backgroundColor: status === st ? info.bg : 'transparent',
                  color: status === st ? info.text : '#6b7280',
                  borderColor: status === st ? info.text : '#3f3f46',
                }}
              >
                {info.icon} {st.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs: Analysis | Refine */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        <button
          onClick={() => setActiveDetailTab('analysis')}
          style={{ ...s.detailTab, ...(activeDetailTab === 'analysis' ? s.detailTabActive : {}) }}
        >
          🔍 Analysis
        </button>
        <button
          onClick={() => setActiveDetailTab('refine')}
          style={{ ...s.detailTab, ...(activeDetailTab === 'refine' ? s.detailTabActive : {}) }}
        >
          🎯 Refine
        </button>
      </div>

      {/* ===== ANALYSIS TAB ===== */}
      {activeDetailTab === 'analysis' && (
        <>
          <button onClick={onAnalyze} disabled={isAnalyzing} style={{ ...s.analyzeBtn, marginBottom: '12px' }}>
            {isAnalyzing ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />}
            {isAnalyzing ? 'Analyzing...' : status === 'unreviewed' ? 'Analyze' : 'Re-analyze'}
          </button>

          {/* Scene Assignment */}
          <div style={s.detailSection}>
            <div style={s.detailLabel}>Assign to Scene</div>
            <select
              value={asset.scene_id || ''}
              onChange={e => onSceneAssign(e.target.value)}
              style={s.filterSelect}
            >
              <option value="">— Unassigned —</option>
              {SCENES.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
            {analysis?.scene_suggestions && analysis.scene_suggestions.length > 0 && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                AI suggests: {analysis.scene_suggestions.join(', ')}
              </div>
            )}
          </div>

          {/* Scores */}
          {asset.realism_score != null && (
            <div style={s.detailSection}>
              <div style={s.detailLabel}>Scores</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ScoreBar label="Cinematic Realism" value={asset.realism_score} />
                <ScoreBar label="Style Match" value={asset.style_score!} />
              </div>
            </div>
          )}

          {/* Analysis */}
          {analysis && (
            <>
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Summary</div>
                <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>{analysis.summary}</div>
              </div>

              {/* New schema: style_match + cinematic_realism + improvement_plan */}
              {analysis.style_match && (
                <div style={s.detailSection}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6', marginBottom: '4px' }}>STYLE MATCH — {analysis.style_match.score}/10</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>{analysis.style_match.verdict}</div>
                </div>
              )}

              {analysis.cinematic_realism && (
                <div style={s.detailSection}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>CINEMATIC REALISM — {analysis.cinematic_realism.score}/10</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>{analysis.cinematic_realism.verdict}</div>
                </div>
              )}

              {analysis.improvement_plan && (
                <div style={s.detailSection}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>WHAT TO DO NEXT</div>
                  <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: 1.5 }}>{analysis.improvement_plan.next_steps}</div>
                </div>
              )}

              {/* Legacy schema fallback */}
              {analysis.technical_breakdown && (
                <div style={s.detailSection}>
                  <div style={s.detailLabel}>Technical Breakdown</div>
                  {analysis.technical_breakdown.strengths?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>STRENGTHS</div>
                      {analysis.technical_breakdown.strengths.map((str: string, i: number) => (
                        <div key={i} style={{ fontSize: '11px', color: '#9ca3af', padding: '2px 0' }}>• {str}</div>
                      ))}
                    </div>
                  )}
                  {analysis.technical_breakdown.issues?.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>ISSUES</div>
                      {analysis.technical_breakdown.issues.map((iss: string, i: number) => (
                        <div key={i} style={{ fontSize: '11px', color: '#9ca3af', padding: '2px 0' }}>• {iss}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!analysis && (
            <div style={{ ...s.center, height: '100px', color: '#6b7280', fontSize: '12px' }}>
              Click "Analyze" to get expert assessment
            </div>
          )}
        </>
      )}

      {/* ===== REFINE TAB ===== */}
      {activeDetailTab === 'refine' && (
        <>
          {/* Source info */}
          <div style={s.detailSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={s.detailLabel}>Source Info</div>
              <button onClick={() => setShowSourceEdit(!showSourceEdit)} style={{ ...s.miniBtn, fontSize: '10px' }}>
                {showSourceEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {!showSourceEdit ? (
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                <div>Model: <span style={{ color: asset.source_model ? '#e5e7eb' : '#6b7280' }}>{asset.source_model || 'Unknown (AI will estimate)'}</span></div>
                <div style={{ marginTop: '2px' }}>Prompt: <span style={{ color: asset.source_prompt ? '#e5e7eb' : '#6b7280' }}>{asset.source_prompt ? (asset.source_prompt.length > 80 ? asset.source_prompt.slice(0, 80) + '...' : asset.source_prompt) : 'Unknown (AI will reverse-engineer)'}</span></div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <select value={sourceModel} onChange={e => setSourceModel(e.target.value)} style={s.filterSelect}>
                  <option value="">Unknown</option>
                  <option value="midjourney">Midjourney</option>
                  <option value="flux-2">Flux 2</option>
                  <option value="gpt-image">GPT Image / DALL-E</option>
                  <option value="stable-diffusion">Stable Diffusion</option>
                  <option value="ideogram">Ideogram</option>
                  <option value="leonardo">Leonardo</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={sourcePrompt}
                  onChange={e => setSourcePrompt(e.target.value)}
                  placeholder="Paste original prompt if you have it..."
                  style={{ ...s.filterSelect, minHeight: '60px', resize: 'vertical' as const, fontFamily: 'monospace', fontSize: '10px' }}
                />
                <button onClick={handleSaveSource} style={s.primaryBtn}>Save Source Info</button>
              </div>
            )}
          </div>

          {/* Reference Images Section */}
          <div style={{...s.detailSection, position: 'relative'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={s.detailLabel}>📎 Reference Images</div>
              <button 
                onClick={() => setShowRefPicker(!showRefPicker)} 
                disabled={selectedRefs.length >= 6}
                style={{ 
                  ...s.miniBtn, 
                  fontSize: '10px',
                  opacity: selectedRefs.length >= 6 ? 0.5 : 1 
                }}
              >
                {showRefPicker ? 'Cancel' : 'Add'}
              </button>
            </div>
            
            {/* Selected References List */}
            {selectedRefs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                {selectedRefs.map((ref, index) => (
                  <div key={`${ref.assetId}-${index}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px',
                    backgroundColor: '#18181b',
                    borderRadius: '4px',
                    border: '1px solid #3f3f46'
                  }}>
                    <img 
                      src={ref.imageUrl} 
                      alt="" 
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#e5e7eb', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.title}
                      </div>
                      <select 
                        value={ref.role} 
                        onChange={e => handleUpdateReferenceRole(index, e.target.value)}
                        style={{ ...s.filterSelect, fontSize: '10px', padding: '2px', marginTop: '2px' }}
                      >
                        <option value="style">Style</option>
                        <option value="lighting">Lighting</option>
                        <option value="composition">Composition</option>
                        <option value="texture">Texture</option>
                        <option value="character">Character</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => handleRemoveReference(index)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reference Picker Dropdown */}
            {showRefPicker && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#0f0f11',
                border: '1px solid #3f3f46',
                borderRadius: '6px',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '8px'
              }}>
                <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px' }}>
                  Select assets for reference (approved + needs_work only)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {projectAssets
                    .filter(a => 
                      a.id !== asset.id && // Not the current asset
                      (a.status === 'approved' || a.status === 'needs_work') && // Only good assets
                      !selectedRefs.some(ref => ref.assetId === a.id) // Not already selected
                    )
                    .sort((a, b) => (b.pipeline_score || 0) - (a.pipeline_score || 0)) // Best pipeline scores first
                    .map(a => (
                      <div key={a.id} style={{ position: 'relative' }}>
                        <img 
                          src={a.image_url} 
                          alt="" 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '4px', 
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: '1px solid #3f3f46'
                          }}
                          onClick={() => {
                            // Show role picker for this asset
                            const role = prompt('Choose reference role:', 'style') || 'style';
                            if (role) {
                              handleAddReference(a, role);
                            }
                          }}
                          title={`${a.title || `Asset #${a.id}`} (Pipeline: ${a.pipeline_score || 0}/10)`}
                        />
                      </div>
                    ))
                  }
                </div>
                {projectAssets.filter(a => 
                  a.id !== asset.id && 
                  (a.status === 'approved' || a.status === 'needs_work') &&
                  !selectedRefs.some(ref => ref.assetId === a.id)
                ).length === 0 && (
                  <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                    No suitable reference assets available
                  </div>
                )}
              </div>
            )}
            
            {selectedRefs.length === 0 && (
              <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                No reference images selected. Click "Add" to pick from your project assets.
              </div>
            )}
            
            {selectedRefs.length >= 6 && (
              <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '4px' }}>
                Maximum 6 references reached (model limit)
              </div>
            )}
          </div>

          {/* Get Refinement Plan button */}
          <button
            onClick={handleGetPlan}
            disabled={planLoading}
            style={{ ...s.primaryBtn, width: '100%', justifyContent: 'center', marginBottom: '12px', opacity: planLoading ? 0.6 : 1 }}
          >
            {planLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Building Refinement Plan...</> : <><Sparkles size={14} /> {plan ? 'Regenerate Plan' : 'Get Refinement Plan'}</>}
          </button>

          {/* Refinement Plan Display */}
          {plan && (
            <>
              {/* Reference Strategy Decision — THE KEY DECISION */}
              <div style={{ ...s.detailSection, padding: '12px', backgroundColor: plan.reference_strategy.use_as_reference ? '#0a1a0a' : '#1a0a0a', borderRadius: '8px', border: `1px solid ${plan.reference_strategy.use_as_reference ? '#166534' : '#7f1d1d'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  {plan.reference_strategy.use_as_reference ?
                    <CheckCircle size={16} color="#4ade80" /> :
                    <XCircle size={16} color="#f87171" />
                  }
                  <span style={{ fontSize: '13px', fontWeight: 700, color: plan.reference_strategy.use_as_reference ? '#4ade80' : '#f87171' }}>
                    {plan.reference_strategy.use_as_reference ? 'USE as reference image' : 'DO NOT use as reference — generate fresh'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>
                  {plan.reference_strategy.reasoning}
                </div>
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ fontSize: '10px', color: '#6b7280', cursor: 'pointer' }}>Risk analysis</summary>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    <div><strong style={{ color: '#f87171' }}>If used as ref:</strong> {plan.reference_strategy.risk_if_used_as_ref}</div>
                    <div style={{ marginTop: '4px' }}><strong style={{ color: '#fbbf24' }}>If NOT used as ref:</strong> {plan.reference_strategy.risk_if_not_used_as_ref}</div>
                  </div>
                </details>
              </div>

              {/* Model Selector */}
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Recommended Model: {plan.recommended_model}</div>
                <select
                  value={selectedModel || plan.recommended_model || 'flux-2'}
                  onChange={e => setSelectedModel(e.target.value)}
                  style={s.filterSelect}
                >
                  <option value="flux-2">Flux 2 (API ✅)</option>
                  <option value="gpt-image">GPT Image 1.5 (API ✅)</option>
                  <option value="midjourney">Midjourney (Manual 📋)</option>
                  <option value="nano-banana-pro">Nano Banana Pro (Manual 📋)</option>
                  <option value="higgsfield">Higgsfield (Manual 📋)</option>
                </select>
                {plan.model_reasoning && (
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{plan.model_reasoning}</div>
                )}
                
                {/* Transform Prompt Button - show when model differs from recommended */}
                {selectedModel && selectedModel !== plan.recommended_model && (
                  <button
                    onClick={handleTransformPrompt}
                    disabled={transformLoading}
                    style={{ ...s.miniBtn, marginTop: '6px', width: '100%' }}
                  >
                    {transformLoading ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : '🔄'} 
                    Transform Prompt for {selectedModel}
                  </button>
                )}
              </div>

              {/* Film Stock Preset */}
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Film Stock Preset</div>
                <select
                  value={selectedFilmStock}
                  onChange={e => setSelectedFilmStock(e.target.value)}
                  style={s.filterSelect}
                >
                  <option value="">None</option>
                  {filmStocks.map(stock => (
                    <option key={stock.id} value={stock.id}>{stock.name}</option>
                  ))}
                </select>
                {selectedFilmStock && (
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                    Adds: {filmStocks.find(f => f.id === selectedFilmStock)?.inject}
                  </div>
                )}
              </div>

              {/* Realism Lock Toggle */}
              <div style={s.detailSection}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={realismLock} 
                    onChange={e => setRealismLock(e.target.checked)}
                    style={{ accentColor: '#8b5cf6' }}
                  />
                  <label style={s.detailLabel}>Realism Lock</label>
                </div>
                {realismLock && (
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                    Injects: cinematic still frame, raw photographed realism, natural DOF, realistic skin texture...
                  </div>
                )}
              </div>

              {/* Batch Size Selector */}
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Batch Size</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[2, 4, 8].map(size => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size)}
                      style={{
                        ...s.miniBtn,
                        backgroundColor: batchSize === size ? '#8b5cf6' : 'transparent',
                        borderColor: batchSize === size ? '#8b5cf6' : '#3f3f46',
                        color: batchSize === size ? '#ffffff' : '#6b7280'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Prompt — THE MAIN OUTPUT */}
              <div style={s.detailSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={s.detailLabel}>
                    {transformedPrompt ? `${selectedModel} Prompt` : 'Refined Prompt'}
                    {transformedPrompt && <span style={{ color: '#4ade80', fontSize: '10px' }}> (Transformed)</span>}
                  </div>
                  <button 
                    onClick={() => handleCopyPrompt(transformedPrompt || plan.refined_prompt)} 
                    style={s.miniBtn}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div style={{
                  fontSize: '11px', color: '#e5e7eb', lineHeight: 1.6,
                  padding: '10px', backgroundColor: '#0f0f11', borderRadius: '6px',
                  border: '1px solid #27272a', fontFamily: 'monospace',
                  maxHeight: '200px', overflow: 'auto', whiteSpace: 'pre-wrap' as const,
                  wordBreak: 'break-word' as const,
                }}>
                  {transformedPrompt || plan.refined_prompt}
                </div>
                {plan.prompt_notes && !transformedPrompt && (
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                    {plan.prompt_notes}
                  </div>
                )}
              </div>

              {/* Generation Settings */}
              {plan.generation_settings && (
                <div style={s.detailSection}>
                  <div style={s.detailLabel}>Settings</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                    {plan.generation_settings.aspect_ratio && <span style={s.settingPill}>📐 {plan.generation_settings.aspect_ratio}</span>}
                    {plan.generation_settings.guidance_scale && <span style={s.settingPill}>🎛️ CFG: {plan.generation_settings.guidance_scale}</span>}
                    {plan.generation_settings.steps && <span style={s.settingPill}>🔄 Steps: {plan.generation_settings.steps}</span>}
                    {plan.generation_settings.other_settings && <span style={s.settingPill}>⚙️ {plan.generation_settings.other_settings}</span>}
                  </div>
                </div>
              )}

              {/* Expected Results */}
              <div style={s.detailSection}>
                <div style={s.detailLabel}>Expected Improvement</div>
                <div style={{ fontSize: '11px', color: '#d1d5db', lineHeight: 1.5 }}>{plan.expected_improvement}</div>
              </div>

              {plan.iteration_tips && (
                <div style={s.detailSection}>
                  <div style={s.detailLabel}>💡 If It's Not Right Yet</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.5 }}>{plan.iteration_tips}</div>
                </div>
              )}

              {/* GENERATE BUTTONS */}
              <div style={{ ...s.detailSection, padding: '12px', backgroundColor: '#0a0a1a', borderRadius: '8px', border: '1px solid #1e1b4b' }}>
                {/* For manual-only models, show copy prompt button */}
                {selectedModel && ['midjourney', 'nano-banana-pro', 'higgsfield'].includes(selectedModel) ? (
                  <button
                    onClick={() => handleCopyPrompt(transformedPrompt || plan.refined_prompt)}
                    style={{
                      ...s.primaryBtn, width: '100%', justifyContent: 'center',
                      padding: '12px', fontSize: '14px',
                      backgroundColor: '#2563eb'
                    }}
                  >
                    📋 Copy Prompt for {selectedModel}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      onClick={handleGenerate}
                      disabled={generating || pipelineLoading}
                      style={{
                        ...s.primaryBtn, flex: 1, justifyContent: 'center',
                        padding: '12px', fontSize: '13px',
                        backgroundColor: generating ? '#4c1d95' : '#7c3aed',
                        opacity: (generating || pipelineLoading) ? 0.6 : 1,
                      }}
                    >
                      {generating ? (
                        <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                      ) : (
                        <><Sparkles size={14} /> Generate {batchSize}</>
                      )}
                    </button>
                    <button
                      onClick={handlePipeline}
                      disabled={generating || pipelineLoading}
                      style={{
                        ...s.primaryBtn, flex: 1, justifyContent: 'center',
                        padding: '12px', fontSize: '13px',
                        backgroundColor: pipelineLoading ? '#dc2626' : '#ef4444',
                        opacity: (generating || pipelineLoading) ? 0.6 : 1,
                      }}
                    >
                      {pipelineLoading ? (
                        <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Pipeline...</>
                      ) : (
                        <>🚀 Generate → Refine → Upscale</>
                      )}
                    </button>
                  </div>
                )}
                
                <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                  {plan.reference_strategy.use_as_reference ? '📎 Will use current image as reference' : '🆕 Fresh generation (no reference)'}
                  {' • '}{selectedModel || plan.recommended_model || 'Flux 2'}
                  {selectedFilmStock && ` • ${filmStocks.find(f => f.id === selectedFilmStock)?.name}`}
                  {realismLock && ' • Realism Lock ON'}
                </div>

                {/* Generation Results */}
                {generateResult && generateResult.generated?.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                      ✅ {generateResult.generated.length} variations generated
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: batchSize <= 2 ? '1fr 1fr' : '1fr 1fr 1fr', gap: '6px' }}>
                      {generateResult.generated.map(gen => (
                        <div key={gen.id} style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #27272a', cursor: 'pointer' }}
                          onClick={() => onAssetUpdate(gen)}
                        >
                          <img src={gen.image_url} alt={gen.title || ''} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                          <div style={{ padding: '4px 6px', fontSize: '10px', color: '#9ca3af', backgroundColor: '#18181b' }}>
                            {gen.title} • Click to review
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pipeline Results */}
                {pipelineResult && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                      🚀 Pipeline completed ({pipelineResult.completed_steps}/3 steps)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {pipelineResult.iterations.map((iter, idx) => (
                        <div key={iter.id} style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '6px', backgroundColor: '#18181b', borderRadius: '6px', border: '1px solid #27272a'
                        }}>
                          <img 
                            src={iter.image_url} 
                            alt={iter.title || ''} 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => onAssetUpdate(iter)}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#e5e7eb', fontWeight: 700 }}>
                              Step {idx + 1}: {iter.title?.includes('Step 1') ? 'Generate' : 
                                            iter.title?.includes('Step 2') ? 'Refine' : 
                                            iter.title?.includes('Step 3') ? 'Upscale' : 'Result'}
                            </div>
                            <div style={{ fontSize: '9px', color: '#6b7280' }}>
                              {iter.source_model} • Click to review
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(generateResult && generateResult.generated?.length === 0) || (generateResult && !generateResult.apiAvailable) && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#f87171' }}>
                    {generateResult.message || `Generation failed: ${generateResult.model}`}
                  </div>
                )}
              </div>

              {/* Reverse-engineered info */}
              {plan.reverse_engineered_prompt && !asset.source_prompt && (
                <details style={{ marginTop: '8px' }}>
                  <summary style={{ fontSize: '10px', color: '#6b7280', cursor: 'pointer' }}>Reverse-engineered original prompt</summary>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', fontFamily: 'monospace', lineHeight: 1.4 }}>
                    {plan.reverse_engineered_prompt}
                  </div>
                </details>
              )}
            </>
          )}

          {!plan && !planLoading && (
            <div style={{ ...s.center, height: '80px', color: '#6b7280', fontSize: '12px', flexDirection: 'column' }}>
              <div>Get a refinement plan to see:</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>• Ref image strategy • Model recommendation • Ready-to-use prompt</div>
            </div>
          )}

          {/* Iteration History */}
          {asset.parent_asset_id && (
            <div style={s.detailSection}>
              <button onClick={handleLoadIterations} style={s.miniBtn}>View iteration history</button>
              {showIterations && iterations.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' as const }}>
                  {iterations.map(iter => (
                    <div key={iter.id} style={{
                      padding: '4px 8px', fontSize: '10px', borderRadius: '4px',
                      backgroundColor: iter.id === asset.id ? '#1e1b4b' : '#27272a',
                      color: iter.id === asset.id ? '#a78bfa' : '#6b7280',
                      border: `1px solid ${iter.id === asset.id ? '#4c1d95' : '#3f3f46'}`,
                    }}>
                      v{iter.iteration} {iter.realism_score ? `(${iter.realism_score}/10)` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Score bar for detail panel
const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 8 ? '#4ade80' : value >= 6 ? '#fbbf24' : '#f87171';
  const pct = (value / 10) * 100;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '10px', color: '#6b7280' }}>{label}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color }}>{value}/10</span>
      </div>
      <div style={{ height: '4px', backgroundColor: '#27272a', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

// Styles
const s: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#0f0f11' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%', color: '#9ca3af', fontSize: '14px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 20px 8px', flexShrink: 0 },
  title: { fontSize: '18px', fontWeight: 800, color: '#e5e7eb', margin: 0 },
  statsRow: { display: 'flex', gap: '12px', marginTop: '4px' },
  stat: { fontSize: '11px', color: '#6b7280' },
  iconBtn: { padding: '8px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '6px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' },
  filterBar: { display: 'flex', gap: '8px', padding: '8px 20px', flexShrink: 0, flexWrap: 'wrap' as const },
  searchBox: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: '#1f1f23', border: '1px solid #3f3f46', borderRadius: '6px', flex: '1', minWidth: '150px' },
  searchInput: { background: 'none', border: 'none', color: '#e5e7eb', fontSize: '12px', outline: 'none', flex: 1, minWidth: '80px' },
  filterSelect: { padding: '6px 10px', backgroundColor: '#1f1f23', border: '1px solid #3f3f46', borderRadius: '6px', color: '#e5e7eb', fontSize: '11px', outline: 'none', cursor: 'pointer' },
  mainContent: { display: 'flex', flex: 1, overflow: 'hidden' },
  gridContainer: { flex: 1, overflow: 'auto', padding: '8px 20px 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  card: { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' },
  cardImage: { position: 'relative' as const, width: '100%', height: '160px', backgroundColor: '#27272a' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' as const },
  statusBadge: { position: 'absolute' as const, top: '6px', right: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' as const },
  typeBadge: { position: 'absolute' as const, bottom: '6px', left: '6px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#d1d5db' },
  cardOverlay: { position: 'absolute' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 2 },
  overlayActions: { display: 'flex', gap: '8px' },
  overlayBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', color: '#e5e7eb', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background-color 0.15s' },
  overlayLabel: { fontSize: '10px', color: '#9ca3af', fontWeight: 600 },
  cardInfo: { padding: '8px 10px', cursor: 'pointer' },
  cardTitle: { fontSize: '12px', fontWeight: 600, color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  categoryTag: { fontSize: '10px', color: '#8b5cf6', marginTop: '2px' },
  scoreRow: { display: 'flex', gap: '4px', marginTop: '6px' },
  scorePill: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', padding: '2px 6px', border: '1px solid', borderRadius: '4px', fontSize: '11px', flex: 1 },
  analyzeBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', color: '#a78bfa', fontSize: '10px', fontWeight: 600, cursor: 'pointer', marginTop: '6px', width: '100%', justifyContent: 'center' },
  detailPanel: { width: '360px', flexShrink: 0, borderLeft: '1px solid #27272a', backgroundColor: '#18181b', overflow: 'auto', padding: '16px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  closeBtn: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' },
  detailPreview: { marginBottom: '12px', borderRadius: '6px', overflow: 'hidden' },
  detailActions: { display: 'flex', flexDirection: 'column' as const, gap: '8px', marginBottom: '12px' },
  statusBtn: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: '1px solid', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' as const, background: 'none' },
  detailSection: { marginBottom: '14px' },
  detailLabel: { fontSize: '10px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '4px' },
  lightbox: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer' },
  lightboxImg: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' as const, borderRadius: '8px' },
  detailTab: { flex: 1, padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: '#6b7280', backgroundColor: 'transparent', border: '1px solid #27272a', borderRadius: '4px', cursor: 'pointer', textAlign: 'center' as const },
  detailTabActive: { color: '#e5e7eb', backgroundColor: '#27272a', borderColor: '#3f3f46' },
  miniBtn: { padding: '3px 8px', fontSize: '10px', fontWeight: 600, color: '#a78bfa', backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', cursor: 'pointer' },
  settingPill: { padding: '2px 8px', backgroundColor: '#27272a', borderRadius: '4px', fontSize: '10px', color: '#9ca3af' },
  
  // Cost Banner Styles
  costBanner: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    position: 'relative' as const,
    marginRight: '8px' 
  },
  costPills: { 
    display: 'flex', 
    gap: '4px' 
  },
  costPill: { 
    fontSize: '9px', 
    fontWeight: 600, 
    padding: '3px 6px', 
    backgroundColor: '#18181b', 
    border: '1px solid', 
    borderRadius: '4px', 
    whiteSpace: 'nowrap' as const 
  },
  costDetails: {
    position: 'absolute' as const,
    top: '100%',
    right: 0,
    zIndex: 10,
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '6px',
    padding: '8px',
    minWidth: '180px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
  },
  costDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#9ca3af',
    marginBottom: '3px'
  }
};

export default AssetManagerPage;
