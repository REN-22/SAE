import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CommentaireProps {
    id: number; // ID de la photo ou du commentaire
}

interface CommentData {
    pseudo: string; // Auteur du commentaire
    texte: string;  // Contenu du commentaire
    date_heure: string; // Date et heure du commentaire
}

const Commentaire: React.FC<CommentaireProps> = ({ id }) => {
    const [comment, setComment] = useState<CommentData | null>(null); // État pour les données du commentaire
    const [error, setError] = useState<string | null>(null); // État pour gérer les erreurs
    const token = localStorage.getItem('phototoken'); // Récupérer le token depuis le localStorage

    useEffect(() => {
        // Vérification si le token existe
        if (!token) {
            setError('Vous devez être connecté pour voir les commentaires.');
            return;
        }

        // Requête pour récupérer les données du commentaire
        console.log('id et token:', id, token);
        axios
            .get('http://localhost:5000/GET/commentaire', {
                params: { id, token }, // Passer l'ID en tant que paramètre
            })
            .then((response) => {
                setComment(response.data); // Mettre à jour l'état avec les données reçues
            })
            .catch((error) => {
                console.error('Error fetching comment:', error);
                setError('Impossible de récupérer les commentaires.'); // Gérer les erreurs
            });
    }, [id, token]);

    // Afficher un message d'erreur si nécessaire
    if (error) {
        return <div className="commentaire erreur">{error}</div>;
    }

    // Afficher un message de chargement tant que les données ne sont pas disponibles
    if (!comment) {
        return <div className="commentaire">Chargement...</div>;
    }

    return (
        <div className="commentaire">
            <div>
                <h4 className="auteur">{comment.pseudo}</h4>
                <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {comment.texte}
                </p>
                <small>{comment.date_heure}</small>
            </div>
        </div>
    );
};

export default Commentaire;
