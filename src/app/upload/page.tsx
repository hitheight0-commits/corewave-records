"use client";

import { useState, useRef } from 'react';
import styles from './Upload.module.css';
import { Upload, Music, Image as ImageIcon, CheckCircle, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

export default function UploadPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        genre: '',
        mood: '',
        description: '',
        isAI: false,
    });

    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const audioInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioFile(file);
            setFormData(prev => ({ ...prev, title: prev.title || file.name.split('.')[0] }));
            setStep(2);
        }
    };

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile) {
            alert("Please select an audio file.");
            return;
        }

        setLoading(true);

        try {
            // [EXPERTISE] Parallel Client-Side Orchestration
            // We initiate the high-bandwidth uploads directly to the cloud store from the client.
            // This bypasses the 4.5MB serverless payload wall.

            console.log("[STORAGE_ORCHESTRATION] Starting direct cloud transmission for media...");

            // 1. Audio Upload (Critical Path)
            const audioBlob = await upload(audioFile.name, audioFile, {
                access: 'public',
                handleUploadUrl: '/api/storage/token',
            });
            console.log("[STORAGE_SYNC] Audio synchronized:", audioBlob.url);

            // 2. Cover Art Upload (Optional Path)
            let coverUrl = "/default-cover.jpg";
            if (coverFile) {
                const coverBlob = await upload(coverFile.name, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/storage/token',
                });
                coverUrl = coverBlob.url;
                console.log("[STORAGE_SYNC] Cover art synchronized:", coverUrl);
            }

            // 3. Metadata Finalization (Control Path)
            // Once media is atomic in the cloud, we sync the operational metadata via the control API.
            console.log("[CONTROL_SYNC] Finalizing track orchestration in core database...");
            const res = await fetch('/api/tracks/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audioUrl: audioBlob.url,
                    coverUrl,
                    title: formData.title,
                    genre: formData.genre,
                    mood: formData.mood,
                    isAI: formData.isAI
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Identity synchronization failed.');
            }

            console.log("[ORCHESTRATION_COMPLETE] Track record finalized.");
            router.push('/upload/success');
        } catch (err: any) {
            console.error("[ORCHESTRATION_CRITICAL] Failure in media pipeline:", err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.uploadPage}>
            <div className={`container ${styles.container}`}>
                <div className={styles.header}>
                    <h1>Share your sound</h1>
                    <p>Distribute your music to the world through COREWAVE.</p>
                </div>

                <div className={styles.stepper}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. Audio</div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. Metadata</div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. Confirm</div>
                </div>

                <div className={`premium-card ${styles.card}`}>
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <input
                                type="file"
                                ref={audioInputRef}
                                className={styles.hidden}
                                accept="audio/*"
                                onChange={handleAudioSelect}
                            />
                            <div
                                className={styles.dropzone}
                                onClick={() => audioInputRef.current?.click()}
                            >
                                <Upload size={48} className={styles.uploadIcon} />
                                <h3>Click to select your audio file</h3>
                                <p>Supports MP3, WAV or FLAC</p>
                                <button
                                    className="btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    Select File
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.imageUploadWrapper}>
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        className={styles.hidden}
                                        accept="image/*"
                                        onChange={handleCoverSelect}
                                    />
                                    <div
                                        className={styles.imageUpload}
                                        onClick={() => coverInputRef.current?.click()}
                                        style={{ backgroundImage: coverPreview ? `url(${coverPreview})` : 'none', backgroundSize: 'cover' }}
                                    >
                                        {!coverPreview && (
                                            <div className={styles.imagePlaceholder}>
                                                <ImageIcon size={32} />
                                                <span>Upload Cover Art</span>
                                            </div>
                                        )}
                                    </div>
                                    {coverPreview && (
                                        <button type="button" className={styles.removeImage} onClick={() => { setCoverFile(null); setCoverPreview(null) }}>
                                            <X size={14} /> Remove
                                        </button>
                                    )}
                                </div>

                                <div className={styles.inputs}>
                                    <div className={styles.field}>
                                        <label>Track Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Midnight Waves"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Genre</label>
                                        <select
                                            value={formData.genre}
                                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        >
                                            <option value="">Select Genre</option>
                                            <option value="Electronic">Electronic</option>
                                            <option value="Hip Hop">Hip Hop</option>
                                            <option value="Lo-Fi">Lo-Fi</option>
                                            <option value="Ambient">Ambient</option>
                                            <option value="Techno">Techno</option>
                                            <option value="Indie">Indie</option>
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Mood</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Chill, Energetic"
                                            value={formData.mood}
                                            onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.checkboxField}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isAI}
                                                onChange={(e) => setFormData({ ...formData, isAI: e.target.checked })}
                                            />
                                            Mark as AI Generated
                                        </label>
                                        <p className={styles.fieldNote}>Check this if the song was created with the help of AI tools.</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fileStatus}>
                                <Music size={18} />
                                <span>Selected: {audioFile?.name}</span>
                                <button type="button" onClick={() => setStep(1)} className={styles.changeBtn}>Change</button>
                            </div>

                            <div className={styles.actions}>
                                <button type="button" onClick={() => setStep(1)} className="btn-outline">Back</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <><Loader2 className={styles.spin} size={18} /> Uploading...</> : 'Publish Track'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className={styles.success}>
                            <CheckCircle size={64} color="var(--corewave-blue)" />
                            <h2>Submission Received!</h2>
                            <p>"{formData.title}" is now <strong>Under Review</strong>.</p>
                            <p className={styles.reviewNote}>You will be notified once our admin team reviews your track.</p>
                            <div className={styles.successActions}>
                                <button
                                    className="btn-primary"
                                    onClick={() => router.push('/profile')}
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    className="btn-outline"
                                    onClick={() => {
                                        setStep(1);
                                        setAudioFile(null);
                                        setCoverFile(null);
                                        setCoverPreview(null);
                                        setFormData({ title: '', genre: '', mood: '', description: '', isAI: false });
                                    }}
                                >
                                    Upload Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
