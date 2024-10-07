import React, { useEffect, useState } from 'react';
import Commentaire from './commentaire';

interface Commentaire {
    id: number;
}

const CommentairesTotal: React.FC = () => {
    const [commentaires, setCommentaires] = useState<Commentaire[]>([]);

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
        </div>
    );
};

export default CommentairesTotal;
