import React from 'react';

interface UserProfileProps {
    setPage: any;
}

const Profil: React.FC<UserProfileProps> = ({ setPage }) => {

    return (
        <div className="user-profile">
            <h1>a's Profile</h1>
            <p>Email: a</p>
            <button onClick={() => setPage(1)}>Fil</button>
        </div>
    );
};

export default Profil;