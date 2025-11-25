import React, { useState, useEffect } from 'react';
import api from '../api';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', youtubeUrl: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/api/exercises');
            setExercises(res.data);
        } catch (err) {
            setError('Übungen konnten nicht geladen werden.');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('youtubeUrl', formData.youtubeUrl);
        if (videoFile) data.append('video', videoFile);

        try {
            await api.post('/api/exercises', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });
            setShowAdd(false);
            setFormData({ name: '', description: '', youtubeUrl: '' });
            setVideoFile(null);
            setUploadProgress(0);
            fetchExercises();
        } catch (err) {
            setError(err.response?.data?.error || 'Speichern fehlgeschlagen');
        }
    };

    return (
        <div className="grid" style={{ gap: '1.5rem' }}>
            <div className="page-header">
                <div>
                    <p className="pill">Library</p>
                    <h2>Übungen & Videos</h2>
                </div>
                <button className="btn" onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? 'Abbrechen' : '+ Übung hinzufügen'}
                </button>
            </div>

            {error && <div className="card" style={{ color: '#ff7a42', borderColor: 'rgba(255,122,66,0.35)' }}>{error}</div>}

            {showAdd && (
                <div className="panel-strong">
                    <form className="grid grid-cols-2" style={{ gap: '1rem' }} onSubmit={handleSubmit}>
                        <div className="field">
                            <label>Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="field">
                            <label>YouTube URL</label>
                            <input
                                value={formData.youtubeUrl}
                                onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Beschreibung</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="field">
                            <label>Video Upload (mp4)</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setVideoFile(e.target.files[0])}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button type="submit" className="btn">Speichern</button>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent)' }} />
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {loading && <div className="card" style={{ opacity: 0.85 }}>Lade Übungen...</div>}

            <div className="grid grid-cols-3">
                {exercises.map(ex => (
                    <div key={ex.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>{ex.name}</h3>
                            <span className="badge">#{ex.id}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)' }}>{ex.description}</p>

                        {ex.youtubeUrl && (
                            <a href={ex.youtubeUrl} target="_blank" rel="noreferrer" className="badge" style={{ width: 'fit-content' }}>
                                YouTube öffnen →
                            </a>
                        )}

                        {ex.videoPath && (
                            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                <video controls style={{ width: '100%' }}>
                                    <source src={ex.videoPath} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseLibrary;
