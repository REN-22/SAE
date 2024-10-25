import React, { useState, useEffect } from 'react';

interface CommentaireProps {
    id: number;
}

interface CommentData {
    author: string;
    content: string;
    date: string;
}

const commentaire = [
    { id: 1, author: 'John Doe', content: 'This is a test comment.', date: '2023-10-01'},
    { id: 2, author: 'Jane Smith', content: 'Another test comment.', date: '2023-10-02'},
    { id: 3, author: 'Alice Johnson', content: 'Yet another test comment.', date: '2023-10-03'},
];

const Commentaire: React.FC<CommentaireProps> = ({ id }) => {
    const com = commentaire.find(p => p.id === id);
    // useEffect(() => {
    //     // Replace with your actual API endpoint
    //     fetch(`/api/comments/${id}`)
    //         .then(response => response.json())
    //         .then(data => setComments(data))
    //         .catch(error => console.error('Error fetching comments:', error));
    // }, [id]);

    if (!com) {
        return <div>Loading...</div>;
    }

    return (
        <div className="commentaire">
            <div>
                <h4>{com.author}</h4>
                <p>{com.content}</p>
                <small>{com.date}</small>
            </div>
        </div>
    );
};

export default Commentaire;