import React, { useState, useEffect } from 'react'
import './App.css'
import Connexion from './Component/PagedeConnexion/Connexion'
import Inscription from './Component/PagedeConnexion/Inscription'
import Fil from './Component/Filphoto/fil'
import Profil from './Component/pageutilisateur/profil'
import HeaderInterne from './Component/Header/headerinterne'


function App() {
  const [page, setPage] = useState(3);

  return (
    <>
    <div>
    <HeaderInterne 
      setPage={setPage}/>
    </div>
    <div className='page-content'>
      {page === 1 && (
        <Fil
          setPage={setPage} />
      )}
      {page === 2 && (
        <Profil
          setPage={setPage} />
      )}
      {page === 3 && (
        <Inscription
          setPage={setPage} />
      )}
      {page === 4 && (
        <Connexion
          setPage={setPage} />
      )}
      {/* 5 => uploadphoto */}
    </div>
    </>
  );
}

export default App;
