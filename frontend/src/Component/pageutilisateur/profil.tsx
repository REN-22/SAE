import React from 'react';

interface UserProfileProps {
    setPage: any;
    username: string;
    email: string;
}

const Profil: React.FC<UserProfileProps> = ({ username, email, setPage }) => {

    return (
        <div className="user-profile">
            <h1>{username}'s Profile</h1>
            <p>Email: {email}</p>
            <button onClick={() => setPage(1)}>Fil</button>
        </div>
    );
};

export default Profil;