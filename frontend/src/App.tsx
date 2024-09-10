import React, { useState, useEffect } from 'react'
import Fil from './Component/Filphoto/fil'
import Profil from './Component/pageutilisateur/profil'

function App() {
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState(String);
  const [email, setEmail] = useState(String);

  return (
    <>
    <div>
      {page === 1 && (
        <Fil
          setPage={setPage} />
      )}
      {page === 2 && (
        <Profil
          setPage={setPage}
          username={username}
          email={email} />
      )}
    </div>
    <div>
      <input
        type="text"
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)} />
      <input
        type="text"
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)} />
    </div>
    </>
  );
}

export default App;
