import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkoutEditor = () => {
    const [exercises, setExercises] = useState([]);
    const [split, setSplit] = useState('WEEK1');
    const [warmup, setWarmup] = useState([]);
    const [main, setMain] = useState([]);

    useEffect(() => {
        // Load available exercises
        axios.get('/api/exercises').then(res => setExercises(res.data)).catch(console.error);
    }, []);

    const addToSection = (exId, section) => {
        const ex = exercises.find(e => e.id === parseInt(exId));
        if (!ex) return;
        const newItem = { ...ex, tempId: Date.now(), sets: [] };
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
        // Construct payload matching Prisma schema structure (simplified for MVP)
        const payload = {
            split,
            warmup: warmup.map(w => w.id),
            main: main.map(m => m.id),
            sets: [
                ...warmup.flatMap(w => w.sets.map(s => ({ exerciseId: w.id, ...s }))),
                ...main.flatMap(m => m.sets.map(s => ({ exerciseId: m.id, ...s })))
            ]
        };

        try {
            await axios.post('/api/workouts', payload);
            alert('Workout saved!');
            // Reset or redirect
        } catch (err) {
            console.error(err);
            alert('Error saving workout (Backend route might need implementation)');
        }
    };

    return (
        <div>
            <h2>Create Workout</h2>

            <div className="glass card" style={{ marginBottom: '2rem' }}>
                <label>Split Selection: </label>
                <select value={split} onChange={e => setSplit(e.target.value)} style={{ width: 'auto', marginLeft: '1rem' }}>
                    <option value="WEEK1">Split 1 (e.g. Upper Body / Day A)</option>
                    <option value="WEEK2">Split 2 (e.g. Lower Body / Day B)</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Warmup Section */}
                <Section
                    title="Warm Up"
                    items={warmup}
                    exercises={exercises}
                    onAdd={(id) => addToSection(id, 'warmup')}
                    onAddSet={(id) => addSet(id, 'warmup')}
                    onUpdateSet={(id, idx, f, v) => updateSet(id, idx, f, v, 'warmup')}
                />

                {/* Main Section */}
                <Section
                    title="Main Workout"
                    items={main}
                    exercises={exercises}
                    onAdd={(id) => addToSection(id, 'main')}
                    onAddSet={(id) => addSet(id, 'main')}
                    onUpdateSet={(id, idx, f, v) => updateSet(id, idx, f, v, 'main')}
                />
            </div>

            <button onClick={handleSave} style={{ marginTop: '2rem', width: '100%', padding: '1rem', fontSize: '1.2rem' }}>
                Save Workout
            </button>
        </div>
    );
};

const Section = ({ title, items, exercises, onAdd, onAddSet, onUpdateSet }) => (
    <div className="glass card">
        <h3>{title}</h3>
        <div style={{ marginBottom: '1rem' }}>
            <select onChange={(e) => { onAdd(e.target.value); e.target.value = ''; }}>
                <option value="">+ Add Exercise</option>
                {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
        </div>

        {items.map(item => (
            <div key={item.tempId} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4>{item.name}</h4>
                {item.sets.map((set, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <span>Set {idx + 1}:</span>
                        <input
                            type="number" placeholder="Reps" value={set.reps}
                            onChange={e => onUpdateSet(item.tempId, idx, 'reps', parseInt(e.target.value))}
                            style={{ width: '60px' }}
                        />
                        <input
                            type="number" placeholder="kg" value={set.weight}
                            onChange={e => onUpdateSet(item.tempId, idx, 'weight', parseFloat(e.target.value))}
                            style={{ width: '60px' }}
                        />
                        <input
                            type="text" placeholder="Band (e.g. Red)" value={set.band}
                            onChange={e => onUpdateSet(item.tempId, idx, 'band', e.target.value)}
                        />
                    </div>
                ))}
                <button onClick={() => onAddSet(item.tempId)} style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>+ Add Set</button>
            </div>
        ))}
    </div>
);

export default WorkoutEditor;
