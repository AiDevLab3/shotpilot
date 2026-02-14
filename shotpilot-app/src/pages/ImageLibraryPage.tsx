import React, { useEffect, useState } from 'react';
import { useProjectContext } from '../components/ProjectLayout';
import { getProjectImages, createProjectImage, updateProjectImage, deleteProjectImage, fileToBase64 } from '../services/api';
import type { ProjectImage } from '../types/schema';
import { Plus, Trash2, Edit2, X, Image as ImageIcon, Tag } from 'lucide-react';

export const ImageLibraryPage: React.FC = () => {
    const { projectId, project } = useProjectContext();
    const [images, setImages] = useState<ProjectImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingImage, setEditingImage] = useState<ProjectImage | null>(null);
    const [editForm, setEditForm] = useState<{ title: string; notes: string; tags: string }>({ title: '', notes: '', tags: '' });
    const [lightboxImage, setLightboxImage] = useState<ProjectImage | null>(null);
    const [filterTag, setFilterTag] = useState<string>('');

    useEffect(() => {
        loadImages();
    }, [projectId]);

    const loadImages = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const imgs = await getProjectImages(projectId);
            setImages(imgs);
        } catch (error) {
            console.error('Failed to load project images', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                if (file.size > 20 * 1024 * 1024) continue; // Skip files > 20MB
                const url = await fileToBase64(file);
                await createProjectImage(projectId, { image_url: url, title: file.name.replace(/\.[^.]+$/, '') });
            }
            await loadImages();
        } catch (error) {
            console.error('Failed to upload image', error);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteProjectImage(id);
            setImages(prev => prev.filter(i => i.id !== id));
            if (lightboxImage?.id === id) setLightboxImage(null);
        } catch (error) {
            console.error('Failed to delete image', error);
        }
    };

    const openEdit = (img: ProjectImage) => {
        setEditingImage(img);
        setEditForm({ title: img.title || '', notes: img.notes || '', tags: img.tags || '' });
    };

    const handleSaveEdit = async () => {
        if (!editingImage) return;
        try {
            const updated = await updateProjectImage(editingImage.id, editForm);
            setImages(prev => prev.map(i => i.id === editingImage.id ? { ...i, ...updated } : i));
            setEditingImage(null);
        } catch (error) {
            console.error('Failed to update image', error);
        }
    };

    // Collect all unique tags for filter
    const allTags = Array.from(new Set(
        images.flatMap(img => (img.tags || '').split(',').map(t => t.trim()).filter(Boolean))
    ));

    const filteredImages = filterTag
        ? images.filter(img => (img.tags || '').toLowerCase().includes(filterTag.toLowerCase()))
        : images;

    // Parse project frame_size for image containers
    const frameAspectRatio = (() => {
        const fs = project?.frame_size;
        if (!fs) return '16/9';
        const match = fs.match(/^([\d.]+):([\d.]+)/);
        return match ? `${match[1]}/${match[2]}` : '16/9';
    })();

    return (
        <div style={styles.page}>
            <div style={styles.topBar}>
                <div>
                    <h2 style={styles.title}>Image Library</h2>
                    <p style={styles.subtitle}>
                        {images.length} image{images.length !== 1 ? 's' : ''} — Park alternate and reference images here
                    </p>
                </div>
                <label style={{ ...styles.uploadBtn, opacity: uploading ? 0.5 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}>
                    {uploading ? 'Uploading...' : <><Plus size={14} /> Add Images</>}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
                <div style={styles.tagBar}>
                    <Tag size={12} color="#6b7280" />
                    <button
                        onClick={() => setFilterTag('')}
                        style={{ ...styles.tagChip, backgroundColor: !filterTag ? '#3b82f6' : '#27272a', color: !filterTag ? 'white' : '#9ca3af' }}
                    >
                        All
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                            style={{ ...styles.tagChip, backgroundColor: tag === filterTag ? '#3b82f6' : '#27272a', color: tag === filterTag ? 'white' : '#9ca3af' }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={styles.emptyState}>Loading images...</div>
            ) : filteredImages.length === 0 ? (
                <div style={styles.emptyState}>
                    <ImageIcon size={40} color="#3f3f46" />
                    <p style={{ color: '#6b7280', margin: '12px 0 0 0' }}>
                        {filterTag ? 'No images match this tag' : 'No images yet. Upload some reference or alternate images to get started.'}
                    </p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filteredImages.map(img => (
                        <div key={img.id} style={styles.card}>
                            <div
                                style={{ ...styles.cardImage, aspectRatio: frameAspectRatio, cursor: 'pointer' }}
                                onClick={() => setLightboxImage(img)}
                            >
                                <img
                                    src={img.image_url}
                                    alt={img.title || 'Project image'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={styles.cardOverlay}>
                                    <button onClick={(e) => { e.stopPropagation(); openEdit(img); }} style={styles.overlayBtn}>
                                        <Edit2 size={13} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }} style={{ ...styles.overlayBtn, color: '#ef4444' }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            <div style={styles.cardMeta}>
                                {img.title && <span style={styles.cardTitle}>{img.title}</span>}
                                {img.notes && <span style={styles.cardNotes}>{img.notes}</span>}
                                {img.tags && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        {img.tags.split(',').map((t, i) => (
                                            <span key={i} style={styles.miniTag}>{t.trim()}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingImage && (
                <div style={styles.modalOverlay} onClick={() => setEditingImage(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e5e7eb' }}>Edit Image Details</span>
                            <button onClick={() => setEditingImage(null)} style={styles.closeBtn}><X size={16} /></button>
                        </div>
                        <div style={styles.modalBody}>
                            <label style={styles.formLabel}>Title</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                style={styles.formInput}
                                placeholder="e.g. Alt hero shot, Mood reference..."
                            />
                            <label style={styles.formLabel}>Notes</label>
                            <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                style={{ ...styles.formInput, minHeight: '60px', resize: 'vertical' }}
                                placeholder="Why you saved this image, what it could be used for..."
                            />
                            <label style={styles.formLabel}>Tags (comma separated)</label>
                            <input
                                type="text"
                                value={editForm.tags}
                                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                                style={styles.formInput}
                                placeholder="e.g. hero, alternate, mood, lighting"
                            />
                        </div>
                        <div style={styles.modalFooter}>
                            <button onClick={() => setEditingImage(null)} style={styles.cancelBtn}>Cancel</button>
                            <button onClick={handleSaveEdit} style={styles.saveBtn}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxImage && (
                <div style={styles.modalOverlay} onClick={() => setLightboxImage(null)}>
                    <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setLightboxImage(null)} style={{ position: 'absolute', top: '-32px', right: '0', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <img
                            src={lightboxImage.image_url}
                            alt={lightboxImage.title || ''}
                            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
                        />
                        {lightboxImage.title && (
                            <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: '13px', marginTop: '8px' }}>
                                {lightboxImage.title}
                                {lightboxImage.notes && <span style={{ color: '#6b7280' }}> — {lightboxImage.notes}</span>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
    },
    title: {
        margin: '0 0 4px 0',
        fontSize: '20px',
        fontWeight: 700,
        color: '#e5e7eb',
    },
    subtitle: {
        margin: 0,
        fontSize: '13px',
        color: '#6b7280',
    },
    uploadBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
    },
    tagBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '16px',
        flexWrap: 'wrap' as const,
    },
    tagChip: {
        padding: '3px 10px',
        border: '1px solid #3f3f46',
        borderRadius: '12px',
        fontSize: '11px',
        cursor: 'pointer',
        fontWeight: 500,
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#6b7280',
        fontSize: '14px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
    },
    card: {
        backgroundColor: '#1f1f23',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #27272a',
    },
    cardImage: {
        backgroundColor: '#000',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    cardOverlay: {
        position: 'absolute' as const,
        top: 0,
        right: 0,
        display: 'flex',
        gap: '4px',
        padding: '6px',
        opacity: 0.8,
    },
    overlayBtn: {
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        border: 'none',
        borderRadius: '4px',
        color: '#d1d5db',
        cursor: 'pointer',
    },
    cardMeta: {
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px',
    },
    cardTitle: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#e5e7eb',
    },
    cardNotes: {
        fontSize: '11px',
        color: '#6b7280',
        lineHeight: '1.4',
    },
    miniTag: {
        padding: '1px 6px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
        fontSize: '10px',
        color: '#9ca3af',
    },
    modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modal: {
        backgroundColor: '#1f1f23',
        borderRadius: '10px',
        width: '400px',
        maxWidth: '90vw',
        border: '1px solid #3f3f46',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        borderBottom: '1px solid #3f3f46',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
    },
    modalBody: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        padding: '12px 16px',
        borderTop: '1px solid #3f3f46',
    },
    formLabel: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase' as const,
    },
    formInput: {
        padding: '8px 10px',
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#e5e7eb',
        fontSize: '13px',
        outline: 'none',
    },
    cancelBtn: {
        padding: '6px 14px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#d1d5db',
        fontSize: '12px',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '6px 14px',
        backgroundColor: '#3b82f6',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
    },
};
