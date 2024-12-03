import React, { useState } from 'react';
import axios from 'axios';

interface AjoutEventProps {
    setPage: any;
}

const AjoutEvent: React.FC<AjoutEventProps> = ({ setPage }) => {

    const [event, setEvent] = useState({
        date_heure_debut: '',
        date_heure_fin: '',
        titre: '',
        descriptif: '',
        lieu: '',
        type: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEvent({
            ...event,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
            try {
                const token = localStorage.getItem('phototoken');
                const response = await axios.post('http://localhost:5000/POST/create-event', {
                    data: event,
                    token: token
                });
                console.log(response.data);
                setPage(1);
            } catch (error) {
                console.error('There was an error creating the event!', error);
            }
        };
        console.log(event);

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Date et Heure de Début:</label>
                <input type="datetime-local" name="date_heure_debut" value={event.date_heure_debut} onChange={handleChange} required />
            </div>
            <div>
                <label>Date et Heure de Fin:</label>
                <input type="datetime-local" name="date_heure_fin" value={event.date_heure_fin} onChange={handleChange} required />
            </div>
            <div>
                <label>Titre:</label>
                <input type="text" name="titre" value={event.titre} onChange={handleChange} required />
            </div>
            <div>
                <label>Descriptif:</label>
                <textarea name="descriptif" value={event.descriptif} onChange={handleChange} required />
            </div>
            <div>
                <label>Lieu:</label>
                <input type="text" name="lieu" value={event.lieu} onChange={handleChange} required />
            </div>
            <div>
                <label>Type:</label>
                <select name="type" value={event.type} onChange={handleChange} required>
                    <option value="">Sélectionnez un type</option>
                    <option value="Cours">Cours</option>
                    <option value="Sortie à thème">Sortie à thème</option>
                    <option value="Expo">Expo</option>
                    <option value="Réunion">Réunion</option>
                    <option value="Info ext">Info ext</option>
                    <option value="Collaboration ext">Collaboration ext</option>
                    <option value="Visionnage">Visionnage</option>
                </select>
            </div>
            <button type="submit">Ajouter l'évènement</button>
        </form>
    );
};

export default AjoutEvent;
