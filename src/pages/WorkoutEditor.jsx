import React, { useState, useEffect } from 'react';
import api from '../api';

const WorkoutEditor = () => {
    const [exercises, setExercises] = useState([]);
    const [split, setSplit] = useState('WEEK1');
    const [warmup, setWarmup] = useState([]);
    const [main, setMain] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/api/exercises')
            .then(res => setExercises(res.data))
            .catch(() => setError('Übungen konnten nicht geladen werden'));
    }, []);

    const addToSection = (exId, section) => {
        const ex = exercises.find(e => e.id === parseInt(exId));
        if (!ex) return;
        const newItem = { ...ex, tempId: Date.now() + Math.random(), sets: [] };
        if (section === 'warmup') setWarmup([...warmup, newItem]);
        else setMain([...main, newItem]);
    };

    const addSet = (itemTempId, section) => {
        const newSet = { reps: 10, weight: 0, band: '' };
        if (section === 'warmup') {
            setWarmup(warmup.map(i => i.tempId === itemTempId ? { ...i, sets: [...i.sets, newSet] } : i));
        } else {
            setMain(main.map(i => i.tempId === itemTempId ? { ...i, sets: [...i.sets, newSet] } : i));
        }
    };

    const updateSet = (itemTempId, setIndex, field, value, section) => {
        const updater = (list) => list.map(item => {
            if (item.tempId !== itemTempId) return item;
            const newSets = [...item.sets];
            newSets[setIndex] = { ...newSets[setIndex], [field]: value };
            return { ...item, sets: newSets };
        });

        if (section === 'warmup') setWarmup(updater(warmup));
        else setMain(updater(main));
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);
        const payload = {
            split,
            warmup: warmup.map(w => w.id),
            main: main.map(m => m.id),
            sets: [
                ...warmup.flatMap(w => w.sets.map(s => ({
                    exerciseId: w.id,
                    reps: Number.isFinite(s.reps) ? s.reps : 0,
                    weight: Number.isFinite(s.weight) ? s.weight : null,
                    band: s.band || null
                }))),
                ...main.flatMap(m => m.sets.map(s => ({
                    exerciseId: m.id,
                    reps: Number.isFinite(s.reps) ? s.reps : 0,
                    weight: Number.isFinite(s.weight) ? s.weight : null,
                    band: s.band || null
                })))
            ]
        };

        try {
            await api.post('/api/workouts', payload);
            alert('Workout gespeichert!');
        } catch (err) {
            setError(err.response?.data?.error || 'Fehler beim Speichern des Workouts');
        }
        setSaving(false);
    };

    return (
        <div className="grid" style={{ gap: '1.25rem' }}>
            <div className="page-header">
                <div>
                    <p className="pill">Planer</p>
                    <h2>Workout zusammenstellen</h2>
                </div>
            </div>
            {error && <div className="card" style={{ color: '#ff7a42', borderColor: 'rgba(255,122,66,0.35)' }}>{error}</div>}

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 600 }}>Split</label>
                <select value={split} onChange={e => setSplit(e.target.value)} style={{ width: '240px' }}>
                    <option value="WEEK1">Split 1 (Upper / A)</option>
                    <option value="WEEK2">Split 2 (Lower / B)</option>
                </select>
            </div>

            <div className="grid" style={{ gap: '1.25rem' }}>
                <Section
                    title="Warm-up"
                    items={warmup}
                    exercises={exercises}
                    onAdd={(id) => addToSection(id, 'warmup')}
                    onAddSet={(id) => addSet(id, 'warmup')}
                    onUpdateSet={(id, idx, f, v) => updateSet(id, idx, f, v, 'warmup')}
                />

                <Section
                    title="Main Workout"
                    items={main}
                    exercises={exercises}
                    onAdd={(id) => addToSection(id, 'main')}
                    onAddSet={(id) => addSet(id, 'main')}
                    onUpdateSet={(id, idx, f, v) => updateSet(id, idx, f, v, 'main')}
                />
            </div>

            <button onClick={handleSave} className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }} disabled={saving}>
                {saving ? 'Speichere...' : 'Workout speichern'}
            </button>
        </div>
    );
};

const Section = ({ title, items, exercises, onAdd, onAddSet, onUpdateSet }) => (
    <div className="panel-strong">
        <div className="page-header" style={{ marginBottom: '0.5rem' }}>
            <h3>{title}</h3>
            <select onChange={(e) => { onAdd(e.target.value); e.target.value = ''; }} style={{ width: '220px' }}>
                <option value="">+ Übung hinzufügen</option>
                {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
        </div>

        {items.length === 0 && (
            <div className="card" style={{ color: 'var(--text-secondary)' }}>Noch keine Übungen hinzugefügt.</div>
        )}

        <div className="grid" style={{ gap: '1rem' }}>
            {items.map(item => (
                <div key={item.tempId} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4>{item.name}</h4>
                        <span className="badge">#{item.id}</span>
                    </div>
                    {item.sets.map((set, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div className="field">
                                <label>Reps</label>
                                <input
                                    type="number" value={set.reps}
                                    onChange={e => onUpdateSet(item.tempId, idx, 'reps', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="field">
                                <label>kg</label>
                                <input
                                    type="number" value={set.weight}
                                    onChange={e => onUpdateSet(item.tempId, idx, 'weight', parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="field">
                                <label>Band</label>
                                <input
                                    type="text" value={set.band}
                                    onChange={e => onUpdateSet(item.tempId, idx, 'band', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                    <button onClick={() => onAddSet(item.tempId)} className="btn secondary" style={{ marginTop: '0.5rem' }}>+ Set</button>
                </div>
            ))}
        </div>
    </div>
);

export default WorkoutEditor;
