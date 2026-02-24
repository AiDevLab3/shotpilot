/**
 * DnD Scene Workshop — drag & drop wrapper for the scene content area.
 * 
 * Supports:
 * - Drag staged image → drop on shot card to assign
 * - Drag shot card → reorder sequence
 * - Drop image on staging area to unassign from shot
 * - Inline edit shot description
 * - Remove image from shot (back to staging)
 */
import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sparkles, X, GripVertical, Edit3, Check } from 'lucide-react';
import type { Shot, ImageVariant, Scene } from '../types/schema';

// Types
interface ProjectImage {
  id: number;
  image_url: string;
  title?: string;
  analysis_json?: string;
  scene_id?: string;
  [key: string]: any;
}

interface DndSceneWorkshopProps {
  scene: Scene;
  shots: Shot[];
  shotImages: Record<number, ImageVariant[]>;
  stagedImages: ProjectImage[];
  frameAspectRatio: string;
  onAssignImageToShot: (imageId: number, imageUrl: string, shotId: number) => Promise<void>;
  onRemoveImageFromShot: (shotId: number, variantId: number) => Promise<void>;
  onUnstageImage: (image: ProjectImage) => Promise<void>;
  onReorderShots: (sceneId: number, shotIds: number[]) => Promise<void>;
  onUpdateShotDescription: (shotId: number, description: string) => Promise<void>;
  onShotClick: (shot: Shot) => void;
  onGenerate: (shot: Shot, type: 'image' | 'video') => void;
}

// ========== DRAGGABLE STAGED IMAGE ==========
const DraggableStagedImage: React.FC<{
  image: ProjectImage;
  onRemove?: (image: ProjectImage) => void;
}> = ({ image, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `staged-${image.id}`,
    data: { type: 'staged-image', image },
  });

  const [hovered, setHovered] = useState(false);
  const isAnalyzed = (() => {
    if (image.analysis_json) {
      try { const a = JSON.parse(image.analysis_json); return !!(a.overall_score || a.summary); } catch {}
    }
    return false;
  })();

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '72px',
        height: '72px',
        position: 'relative',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        border: `1px solid ${isAnalyzed ? '#3f3f46' : 'rgba(245, 158, 11, 0.4)'}`,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
        flexShrink: 0,
        transition: isDragging ? 'none' : 'transform 0.15s ease',
      }}
    >
      <img src={image.image_url} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{
        position: 'absolute', top: '2px', left: '2px', fontSize: '9px',
        backgroundColor: isAnalyzed ? 'rgba(16,185,129,0.85)' : 'rgba(245,158,11,0.85)',
        color: 'white', borderRadius: '3px', padding: '0 3px', fontWeight: 700, lineHeight: '14px',
      }}>{isAnalyzed ? '✓' : '?'}</div>
      {hovered && onRemove && (
        <div onClick={(e) => { e.stopPropagation(); onRemove(image); }}
          style={{
            position: 'absolute', top: '2px', right: '2px', width: '16px', height: '16px',
            backgroundColor: 'rgba(239,68,68,0.9)', borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
          <X size={8} color="white" strokeWidth={3} />
        </div>
      )}
      {isDragging && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2px',
          backgroundColor: 'rgba(139,92,246,0.9)', textAlign: 'center',
          fontSize: '7px', fontWeight: 600, color: 'white',
        }}>Drop on shot</div>
      )}
    </div>
  );
};

// ========== DROPPABLE SHOT CARD ==========
const DroppableShotCard: React.FC<{
  shot: Shot;
  imageVariants: ImageVariant[];
  frameAspectRatio: string;
  isOver: boolean;
  onShotClick: (shot: Shot) => void;
  onGenerate: (shot: Shot) => void;
  onRemoveImage?: (shotId: number, variantId: number) => void;
  onUpdateDescription?: (shotId: number, description: string) => void;
}> = ({ shot, imageVariants, frameAspectRatio, isOver, onShotClick, onGenerate, onRemoveImage, onUpdateDescription }) => {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(shot.description || '');

  const mainImage = imageVariants.find(v => v.image_url);
  const auditScore = mainImage?.audit_score || shot.readiness_percentage || shot.quality_percentage || 0;
  const scoreBadgeColor = auditScore >= 80 ? '#10b981' : auditScore >= 50 ? '#f59e0b' : '#ef4444';

  const { isOver: isDropOver, setNodeRef } = useDroppable({
    id: `shot-${shot.id}`,
    data: { type: 'shot', shot },
  });

  const handleSaveDescription = () => {
    if (onUpdateDescription && editText !== shot.description) {
      onUpdateDescription(shot.id, editText);
    }
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        width: '200px',
        minHeight: '150px',
        backgroundColor: '#18181b',
        border: (isOver || isDropOver) ? '2px solid #8b5cf6' : hover ? '2px solid #3b82f6' : '1px solid #27272a',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: (isOver || isDropOver) ? 'scale(1.03)' : hover ? 'translateY(-2px)' : 'none',
        boxShadow: (isOver || isDropOver) ? '0 0 20px rgba(139,92,246,0.3)' : hover ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        flexShrink: 0,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !editing && onShotClick(shot)}
    >
      {/* Drop zone highlight */}
      {(isOver || isDropOver) && !mainImage && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          backgroundColor: 'rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px',
        }}>
          <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 600 }}>Drop here</span>
        </div>
      )}

      {/* Image area */}
      <div style={{
        aspectRatio: frameAspectRatio, backgroundColor: '#000', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {mainImage ? (
          <>
            <img src={mainImage.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* Remove image button on hover */}
            {hover && onRemoveImage && (
              <div onClick={(e) => { e.stopPropagation(); onRemoveImage(shot.id, mainImage.id); }}
                style={{
                  position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px',
                  backgroundColor: 'rgba(239,68,68,0.85)', borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5,
                }}
                title="Remove image (back to staging)"
              >
                <X size={12} color="white" strokeWidth={3} />
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#6b7280' }}
            onClick={(e) => { e.stopPropagation(); onGenerate(shot); }}>
            <Sparkles size={20} />
            <span style={{ fontSize: '9px', fontWeight: 600 }}>GENERATE</span>
          </div>
        )}

        {/* Shot type label */}
        <div style={{
          position: 'absolute', top: '4px', left: '4px', backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 600,
          textTransform: 'uppercase',
        }}>{shot.shot_type}</div>

        {/* Score badge */}
        {auditScore > 0 && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px', backgroundColor: scoreBadgeColor,
            color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
          }}>{auditScore}%</div>
        )}
      </div>

      {/* Shot info */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#f3f4f6' }}>Shot {shot.shot_number}</span>
          {hover && onUpdateDescription && !editing && (
            <Edit3 size={10} color="#6b7280" style={{ cursor: 'pointer' }}
              onClick={(e) => { e.stopPropagation(); setEditText(shot.description || ''); setEditing(true); }} />
          )}
        </div>
        {editing ? (
          <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
            <input value={editText} onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDescription(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
              style={{
                flex: 1, fontSize: '10px', padding: '2px 4px', backgroundColor: '#27272a',
                border: '1px solid #3f3f46', borderRadius: '3px', color: '#e5e7eb', outline: 'none',
              }} />
            <Check size={12} color="#10b981" style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={handleSaveDescription} />
          </div>
        ) : (
          <div style={{
            fontSize: '10px', color: '#9ca3af', lineHeight: '1.2', overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{shot.description || 'No description'}</div>
        )}
      </div>
    </div>
  );
};

// ========== SORTABLE SHOT WRAPPER ==========
const SortableShotCard: React.FC<{
  shot: Shot;
  imageVariants: ImageVariant[];
  frameAspectRatio: string;
  dragOverShotId: number | null;
  onShotClick: (shot: Shot) => void;
  onGenerate: (shot: Shot) => void;
  onRemoveImage?: (shotId: number, variantId: number) => void;
  onUpdateDescription?: (shotId: number, description: string) => void;
}> = ({ shot, imageVariants, frameAspectRatio, dragOverShotId, onShotClick, onGenerate, onRemoveImage, onUpdateDescription }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sortable-shot-${shot.id}`,
    data: { type: 'shot-sortable', shot },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
      }}
    >
      {/* Drag handle */}
      <div {...listeners} style={{
        position: 'absolute', top: '50%', left: '-14px', transform: 'translateY(-50%)',
        cursor: 'grab', zIndex: 5, color: '#4b5563', opacity: 0.5,
      }}>
        <GripVertical size={12} />
      </div>
      <DroppableShotCard
        shot={shot}
        imageVariants={imageVariants}
        frameAspectRatio={frameAspectRatio}
        isOver={dragOverShotId === shot.id}
        onShotClick={onShotClick}
        onGenerate={onGenerate}
        onRemoveImage={onRemoveImage}
        onUpdateDescription={onUpdateDescription}
      />
    </div>
  );
};

// ========== MAIN DND WORKSHOP ==========
export const DndSceneWorkshop: React.FC<DndSceneWorkshopProps> = ({
  scene,
  shots,
  shotImages,
  stagedImages,
  frameAspectRatio,
  onAssignImageToShot,
  onRemoveImageFromShot,
  onUnstageImage,
  onReorderShots,
  onUpdateShotDescription,
  onShotClick,
  onGenerate,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [dragOverShotId, setDragOverShotId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData(event.active.data.current);
  };

  // Extract shot id from either 'shot-123' or 'sortable-shot-123'
  const extractShotId = (id: string): number | null => {
    if (id.startsWith('sortable-shot-')) return parseInt(id.replace('sortable-shot-', ''));
    if (id.startsWith('shot-')) return parseInt(id.replace('shot-', ''));
    return null;
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (!over) { setDragOverShotId(null); return; }
    const shotId = extractShotId(over.id.toString());
    if (over?.data?.current?.type === 'shot') {
      setDragOverShotId(over.data.current.shot.id);
    } else if (over?.data?.current?.type === 'shot-sortable') {
      setDragOverShotId(over.data.current.shot.id);
    } else if (shotId) {
      setDragOverShotId(shotId);
    } else {
      setDragOverShotId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveData(null);
    setDragOverShotId(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overId = over.id.toString();
    const overShotId = extractShotId(overId);

    // Staged image → Shot card (works with both 'shot-X' and 'sortable-shot-X')
    if (activeType === 'staged-image' && overShotId) {
      const image = active.data.current?.image;
      if (image) {
        await onAssignImageToShot(image.id, image.image_url, overShotId);
      }
    }

    // Shot reorder
    if (activeType === 'shot-sortable' && overShotId) {
      const activeShot = active.data.current?.shot;
      if (activeShot && activeShot.id !== overShotId) {
        const oldIndex = shots.findIndex(s => s.id === activeShot.id);
        const newIndex = shots.findIndex(s => s.id === overShotId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(shots, oldIndex, newIndex);
          await onReorderShots(scene.id, newOrder.map(s => s.id));
        }
      }
    }
  };

  // Staging area as drop target (for removing images from shots)
  const { setNodeRef: stagingDropRef, isOver: isStagingOver } = useDroppable({
    id: 'staging-area',
    data: { type: 'staging' },
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Storyboard Strip — sortable shots */}
      <div style={{ marginBottom: '16px' }}>
        <SortableContext
          items={shots.map(s => `sortable-shot-${s.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            paddingRight: '16px',
            paddingLeft: '16px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#374151 #1f2937',
          }}>
            {shots.map(shot => (
              <SortableShotCard
                key={shot.id}
                shot={shot}
                imageVariants={shotImages[shot.id] || []}
                frameAspectRatio={frameAspectRatio}
                dragOverShotId={dragOverShotId}
                onShotClick={onShotClick}
                onGenerate={(s) => onGenerate(s, 'image')}
                onRemoveImage={onRemoveImageFromShot ? (sid, vid) => onRemoveImageFromShot(sid, vid) : undefined}
                onUpdateDescription={onUpdateShotDescription}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Staging Area — draggable images + drop target */}
      {stagedImages.length > 0 && (
        <div
          ref={stagingDropRef}
          style={{
            padding: '12px 16px',
            backgroundColor: isStagingOver ? 'rgba(139,92,246,0.08)' : '#151a21',
            border: `1px solid ${isStagingOver ? 'rgba(139,92,246,0.3)' : '#1e2530'}`,
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
        >
          <div style={{
            fontSize: '13px', fontWeight: 600, color: '#e5e7eb', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            📦 Drag images to shots ({stagedImages.length} staged)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {stagedImages.map(image => (
              <DraggableStagedImage
                key={image.id}
                image={image}
                onRemove={onUnstageImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drag overlay */}
      <DragOverlay>
        {activeId && activeData?.type === 'staged-image' && activeData.image && (
          <div style={{
            width: '72px', height: '72px', borderRadius: '6px', overflow: 'hidden',
            border: '2px solid #8b5cf6', boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
            cursor: 'grabbing',
          }}>
            <img src={activeData.image.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
