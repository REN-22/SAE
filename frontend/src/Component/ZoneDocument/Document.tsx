import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DocumentProps {
    id: number;
}

const Document: React.FC<DocumentProps> = ({ id }) => {
    const [nom, setNom] = useState('');
    const [dateUpload, setDateUpload] = useState('');
    const [description, setDescription] = useState('');
    const token = localStorage.getItem('phototoken');

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await axios.get('http://backend:5000/GET/document', {
                    params: { id: id, token: token }
                });
                const document = response.data;
                setNom(document.nom);
                setDateUpload(document.date_depot);
                const date = new Date(document.date_depot);
                const formattedDate = date.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                setDateUpload(formattedDate);
                setDescription(document.description);
                console.log(document);
                console.log('nom:', nom);
                console.log('dateUpload:', dateUpload);
                console.log('description:', description);
            } catch (error) {
                console.error('Erreur lors de la récupération des données du document:', error);
            }
        };

        fetchDocument();
    }, [id]);

    const handleOpenDocument = () => {
        window.open(`http://backend:5000/GET/document/file?id=${id}&token=${token}`, '_blank');
    };

    return (
        <div>
            <h2>Informations du document</h2>
            <p>Nom: {nom}</p>
            <p>Date d'upload: {dateUpload}</p>
            <p>Description: {description}</p>
            <button onClick={handleOpenDocument}>
                Ouvrir le Document
            </button>
        </div>
    );
};

export default Document;