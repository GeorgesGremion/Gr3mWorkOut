import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExerciseLibrary = () => {
    const [exercises, setExercises] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '', youtubeUrl: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const res = await axios.get('/api/exercises');
            setExercises(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('youtubeUrl', formData.youtubeUrl);
        if (videoFile) data.append('video', videoFile);

        try {
            await axios.post('/api/exercises', data, {
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
            alert('Failed to save exercise');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Exercise Library</h2>
                <button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add Exercise'}</button>
            </div>

            {showAdd && (
                <div className="glass card" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>YouTube URL</label>
                            <input
                                value={formData.youtubeUrl}
                                onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Upload Video (mp4)</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={e => setVideoFile(e.target.files[0])}
                            />
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: `${uploadProgress}%`, background: 'var(--accent)', height: '4px', borderRadius: '4px' }}></div>
                            </div>
                        )}
                        <button type="submit">Save Exercise</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {exercises.map(ex => (
                    <div key={ex.id} className="glass card">
                        <h3>{ex.name}</h3>
                        <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '1rem' }}>{ex.description}</p>

                        {ex.youtubeUrl && (
                            <div style={{ marginBottom: '1rem' }}>
                                <a href={ex.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Watch on YouTube</a>
                            </div>
                        )}

                        {ex.videoPath && (
                            <video controls style={{ width: '100%', borderRadius: '8px' }}>
                                <source src={ex.videoPath} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseLibrary;
