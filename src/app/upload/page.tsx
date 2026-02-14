"use client";

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Upload.module.css';
import { Upload, Music, Image as ImageIcon, CheckCircle, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

export default function UploadPage() {
    const { t } = useTranslation();
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
            alert(t('upload.form.errors.selectAudio'));
            return;
        }

        setLoading(true);

        try {
            // [EXPERTISE] Parallel Client-Side Orchestration
            // We initiate the high-bandwidth uploads directly to the cloud store from the client.
            // This bypasses the 4.5MB serverless payload wall.

            // Starting cloud upload

            // 1. Audio Upload (Critical Path)
            const audioBlob = await upload(audioFile.name, audioFile, {
                access: 'public',
                handleUploadUrl: '/api/storage/token',
            });
            // Audio uploaded

            // 2. Cover Art Upload (Optional Path)
            let coverUrl = "/default-cover.jpg";
            if (coverFile) {
                const coverBlob = await upload(coverFile.name, coverFile, {
                    access: 'public',
                    handleUploadUrl: '/api/storage/token',
                });
                coverUrl = coverBlob.url;
                // Cover art uploaded
            }

            // 3. Metadata Finalization (Control Path)
            // Once media is atomic in the cloud, we sync the operational metadata via the control API.
            // Finalizing track creation
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
                throw new Error(result.error || t('upload.form.errors.syncFailed'));
            }

            // Track created successfully
            router.push('/upload/success');
        } catch (err: any) {
            console.error("[ORCHESTRATION_CRITICAL] Failure in media pipeline:", err);
            alert(t('upload.form.errors.uploadFailed', { message: err.message }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.uploadPage}>
            <div className={`container ${styles.container}`}>
                <div className={styles.header}>
                    <h1>{t('upload.title')}</h1>
                    <p>{t('upload.subtitle')}</p>
                </div>

                <div className={styles.stepper}>
                    <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. {t('upload.steps.audio')}</div>
                    <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. {t('upload.steps.metadata')}</div>
                    <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. {t('upload.steps.confirm')}</div>
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
                                <h3>{t('upload.dropzone.selectFile')}</h3>
                                <p>{t('upload.dropzone.supports')}</p>
                                <button
                                    className="btn-primary"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    {t('upload.dropzone.btn')}
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
                                                <span>{t('upload.form.cover')}</span>
                                            </div>
                                        )}
                                    </div>
                                    {coverPreview && (
                                        <button type="button" className={styles.removeImage} onClick={() => { setCoverFile(null); setCoverPreview(null) }}>
                                            <X size={14} /> {t('upload.form.remove')}
                                        </button>
                                    )}
                                </div>

                                <div className={styles.inputs}>
                                    <div className={styles.field}>
                                        <label>{t('upload.form.title')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('upload.form.titlePlaceholder')}
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>{t('upload.form.genre')}</label>
                                        <select
                                            value={formData.genre}
                                            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                        >
                                            <option value="">{t('upload.form.selectGenre')}</option>
                                            <option value="Electronic">{t('upload.genres.electronic')}</option>
                                            <option value="Hip Hop">{t('upload.genres.hipHop')}</option>
                                            <option value="Lo-Fi">{t('upload.genres.loFi')}</option>
                                            <option value="Ambient">{t('upload.genres.ambient')}</option>
                                            <option value="Techno">{t('upload.genres.techno')}</option>
                                            <option value="Indie">{t('upload.genres.indie')}</option>
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>{t('upload.form.mood')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('upload.form.moodPlaceholder')}
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
                                            {t('upload.form.isAI')}
                                        </label>
                                        <p className={styles.fieldNote}>{t('upload.form.aiNote')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.fileStatus}>
                                <Music size={18} />
                                <span>{t('upload.form.selected', { name: audioFile?.name })}</span>
                                <button type="button" onClick={() => setStep(1)} className={styles.changeBtn}>{t('upload.form.change')}</button>
                            </div>

                            <div className={styles.actions}>
                                <button type="button" onClick={() => setStep(1)} className="btn-outline">{t('common.back')}</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <><Loader2 className={styles.spin} size={18} /> {t('upload.form.uploading')}</> : t('upload.form.publish')}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className={styles.success}>
                            <CheckCircle size={64} color="var(--corewave-blue)" />
                            <h2>{t('upload.success.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('upload.success.message', { title: formData.title }) }} />
                            <p className={styles.reviewNote}>{t('upload.success.note')}</p>
                            <div className={styles.successActions}>
                                <button
                                    className="btn-primary"
                                    onClick={() => router.push('/profile')}
                                >
                                    {t('upload.success.dashboard')}
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
                                    {t('upload.success.another')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
