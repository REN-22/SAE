import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import Inscription from './Component/PagedeConnexion/Inscription'
import Fil from './Component/Filphoto/fil'
import Profil from './Component/pageutilisateur/profil'
import HeaderInterne from './Component/Header/headerinterne'
import Uploadphoto from './Component/uploadphoto/uploadphoto'
import Connexion from './Component/PagedeConnexion/Connexion'
import HeaderPublic from './Component/Header/headerpublic'
import Calendrier from './Component/evenement/calendrier'
import AjoutEvent from './Component/evenement/ajoutevent'
import PagePrésentation from './Component/Pagedeprésentation/pagePrésentation'
import PageAdmin from './Component/administration/pageAdmin'
import Visionnage from './Component/visionnage/visionnage'

//CPT
function App() {
  const [page, setPage] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [idvisionnage, setIdvisionnage] = useState<number | null>(null);

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
    {page !== 10 && (
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
    )}
    <div className='page-content'>
      {page === 0 && (
        <PagePrésentation />
      )}
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
          setPage={setPage} 
          idvisionnage={idvisionnage} 
          setIdvisionnage={setIdvisionnage}/>
      )}
      {page === 5 && (
        <Connexion
          setPage={setPage}
          setIsConnected={setIsConnected} 
          isConnected />
      )}
      {page === 7 && (
        <Calendrier
          setPage={setPage} 
          setIdvisionnage={setIdvisionnage} />
      )}
      {page === 8 && (
        <AjoutEvent
          setPage={setPage} />
      )}
      {page === 9 && (
        <PageAdmin
          />
      )}
      {page === 10 && (
        <Visionnage
          setPage={setPage}
          idvisionnage={1} 
          setIdvisionnage={setIdvisionnage}/>
      )}
    </div>
    </>
  );
}

export default App;