import React, { useEffect, useState, useRef } from 'react';
import Commentaire from './commentaire';
import './commentairesTotal.css';
import axios from 'axios';

interface CommentairesTotalprops {
    idPhoto: number;
}

const CommentairesTotal: React.FC<CommentairesTotalprops> = ({ idPhoto }) => {
    const [ajoutcomm, setAjoutcomm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [idcommentaires, setidCommentaires] = useState<number[]>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const token = localStorage.getItem('phototoken');

    useEffect(() => {
        const fetchCommentaires = async () => {
            console.log('Fetching commentaires for photo:', idPhoto);
            try {
                const response = await axios.get('http://localhost:5000/GET/commentaires', {
                    params: {
                        token: localStorage.getItem('phototoken'),
                        id_photo: idPhoto
                    }
                });
                const data = response.data.commentIds;
                setidCommentaires(data);
                console.log('data:', data);
                setErrorMessage(null); // Clear any previous error message
            } catch (error) {
                console.error('Error fetching commentaires:', error);
                const errorResponse = (error as any).response.data;
                console.log('details:', errorResponse);
                if (errorResponse.message === 'No comments found for this photo') {
                    setErrorMessage('Aucun commentaire trouvé pour cette photo.');
                } else {
                    setErrorMessage('Erreur lors de la récupération des commentaires.');
                }
            }
        };

        fetchCommentaires();
    }, [idPhoto]);

    const handleAjoutcomm = () => {
        const ajouterCommentaire = async () => {
            const texte = inputRef.current?.value;
            if (!texte) {
                setErrorMessage('Veuillez entrer un texte avant d\'envoyer.');
                return;
            }

            console.log('Creating comment:', texte);
            console.log('idPhoto:', idPhoto);
            console.log('token:', token);
            try {
                const response = await axios.post('http://localhost:5000/POST/create-comment', {
                    token: token,
                    id_photo: idPhoto,
                    texte
                });

                if (response.status === 201) {
                    setidCommentaires([...idcommentaires, response.data.comment.id_commentaire]);
                    setAjoutcomm(false);
                    if (inputRef.current) inputRef.current.value = ''; // Réinitialisation
                }
            } catch (error) {
                console.error('Error creating comment:', error);
                setErrorMessage(`Erreur lors de la création du commentaire: ${(error as any).message}`);
            }
        };

        ajouterCommentaire();
    };

    return (
        <div>
            <h2>Commentaires</h2>
            <div className="ajoutcom">
                {ajoutcomm === true ? (
                    <>
                        <input ref={inputRef} type="text" placeholder="Ajouter un commentaire..." />
                        <button onClick={handleAjoutcomm}>Envoyer</button>
                    </>
                ) : (
                    <button 
                        className='ajoutcom-button'
                        onClick={() => setAjoutcomm(!ajoutcomm)} 
                    >
                        +
                    </button>
                )}
            </div>
            {errorMessage ? (
                <p>{errorMessage}</p>
            ) : (
                <>
                    {idcommentaires.map((id: number) => (
                        <Commentaire key={id} id={id} />
                    ))}
                </>
            )}
        </div>
    );
};

export default CommentairesTotal;
