import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Inscription from './Component/PagedeConnexion/Inscription'
import Fil from './Component/Filphoto/fil'
import Profil from './Component/pageutilisateur/profil'
import HeaderInterne from './Component/Header/headerinterne'
import Uploadphoto from './Component/uploadphoto/uploadphoto'
import Connexion from './Component/PagedeConnexion/Connexion'
import Document from './Component/ZoneDocument/Document'
import PageStart from './Component/PagedeConnexion/PageStart'
import HeaderPublic from './Component/Header/headerpublic'

//CPT
function App() {
  const [page, setPage] = useState(7);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('useEffect');
    const verifyToken = async () => {
      const token = localStorage.getItem('phototoken');
      if (!token) {
        setIsConnected(false);
      } else {
        try {
          const response = await axios.get('http://localhost:5000/GET/verify-token', {
            params: {
              token: token
            }
          });
          if (response.data.message === 'Token is valid') {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        } catch {
          setIsConnected(false);
        }
      }
      console.log('isConnected:', isConnected);
    };

    console.log('verifyToken');
    verifyToken();
  }, [page]);

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
      {page === 3 && (
        <Inscription
          setPage={setPage} />
      )}
      {page === 4 && (
        <Uploadphoto 
          setPage={setPage} />
      )}
      {page === 5 && (
        <Connexion
          setPage={setPage}
          setIsConnected={setIsConnected} 
          isConnected />
      )}
      {page === 6 && (
        <Document
          setPage={setPage} />
      )}
      {page === 7 && (
        <PageStart
          setPage={setPage} />
      )}
    </div>
    </>
  );
}

export default App;