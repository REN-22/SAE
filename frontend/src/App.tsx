import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Connexion from './Component/PagedeConnexion/Connexion'
import Inscription from './Component/PagedeConnexion/Inscription'
import Fil from './Component/Filphoto/fil'
import Profil from './Component/pageutilisateur/profil'
import HeaderInterne from './Component/Header/headerinterne'
import Uploadphoto from './Component/uploadphoto/uploadphoto'
import HeaderPublic from './Component/Header/headerpublic'

function App() {
  const [page, setPage] = useState(1);

  return (
    <>
    <div>
  
    {isConnected === true && (
      <HeaderInterne 
      setPage={setPage}/>
    )}
    {isConnected === false && (
      <HeaderPublic 
      setPage={setPage}/>
    )}
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
    </div>
    </>
  );
}

export default App;
