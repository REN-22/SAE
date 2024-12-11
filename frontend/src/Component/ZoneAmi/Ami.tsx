import React, { useState } from 'react';

interface AmiProps {
  setPage: (page: number) => void;
}

const Ami: React.FC<AmiProps> = ({ setPage }) => {
  return (
    <div className="Ami-container">
        <div className="MenuFil">
            <button onClick={() => setPage(4)}>Nouveau Post</button>
            <button onClick={() => setPage(6)}>Documents Consultable</button>
            <button onClick={() => setPage(8)}>Ami(e)s</button>
        </div>
        <div>
            <p>Liste d'Ami(e)s</p>
            <div>
                
            </div>
        </div>
    </div>
  );
}

export default Ami;