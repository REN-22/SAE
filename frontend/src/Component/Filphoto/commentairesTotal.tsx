import React, { useEffect, useState } from 'react';
import Commentaire from './commentaire';
import './commentairesTotal.css';

interface Commentaire {
    id: number;
}

const CommentairesTotal: React.FC = () => {
    const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
    const [ajoutcomm, setAjoutcomm] = useState(false);

    useEffect(() => {
        // Hardcoded comments for testing
        const hardcodedCommentaires: Commentaire[] = [
            { id: 1},
            { id: 2},
            { id: 3},
        ];
        setCommentaires(hardcodedCommentaires);
    }, []);

    return (
        <div>
            <h2>Commentaires</h2>
            {commentaires.map((commentaire) => (
                <Commentaire key={commentaire.id} id={commentaire.id} />
            ))}
            <div className="ajoutcom">
                {ajoutcomm === true ? (
                    <>
                        <input type="text" placeholder="Ajouter un commentaire..." />
                        <button>Envoyer</button>
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
        </div>
    );
};

export default CommentairesTotal;
