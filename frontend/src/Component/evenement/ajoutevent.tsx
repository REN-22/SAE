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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <input type="text" name="type" value={event.type} onChange={handleChange} required />
            </div>
            <button type="submit">Ajouter l'évènement</button>
        </form>
    );
};

export default AjoutEvent;
