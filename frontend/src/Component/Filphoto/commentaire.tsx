import React, { useState, useEffect } from 'react';

interface CommentaireProps {
    id: number;
}

interface CommentData {
    author: string;
    content: string;
    date: string;
}

const Commentaire: React.FC<CommentaireProps> = ({ id }) => {
    const [comments, setComments] = useState<CommentData[]>([
        {
            author: 'John Doe',
            content: 'This is a test comment.',
            date: '2023-10-01'
        },
        {
            author: 'Jane Smith',
            content: 'Another test comment.',
            date: '2023-10-02'
        },
        {
            author: 'Alice Johnson',
            content: 'Yet another test comment.',
            date: '2023-10-03'
        }
    ]);

    // useEffect(() => {
    //     // Replace with your actual API endpoint
    //     fetch(`/api/comments/${id}`)
    //         .then(response => response.json())
    //         .then(data => setComments(data))
    //         .catch(error => console.error('Error fetching comments:', error));
    // }, [id]);

    if (comments.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="commentaire">
            {comments.map((comment, index) => (
                <div key={index}>
                    <h4>{comment.author}</h4>
                    <p>{comment.content}</p>
                    <small>{comment.date}</small>
                </div>
            ))}
        </div>
    );
};

export default Commentaire;