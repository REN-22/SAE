import React from "react";

interface FilProps {
    setPage: any;
}

const Fil: React.FC<FilProps> = ({ setPage }) => {
    return (
        <div>
            <h1>fil</h1>
            <button onClick={() => setPage(2)}>Profil</button>
        </div>
    );
};

export default Fil;