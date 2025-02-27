import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Document.css';
import Document from './Document';

interface DocumentlistProps {
  setPage: (page: number) => void;
}

const Documentlist: React.FC<DocumentlistProps> = ({ setPage }) => {
  const [uploadedPdf, setUploadedPdf] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null); // État pour le fichier sélectionné
  const [nom, setNom] = useState<string>(''); // Nom du document
  const [idEvenement, setIdEvenement] = useState<string>(''); // ID de l'événement associé
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [documentIds, setDocumentIds] = useState<number[]>([]);
  const token = localStorage.getItem('phototoken');


  useEffect(() => {
    const fetchUserRole = async () => {
        try {
            const response = await axios.get('http://localhost:5000/GET/user-role', {
                params: { token }
            });
            const role = response.data.role;
            setIsAdmin(role === 'admin');
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    fetchUserRole();
}, [token]);

useEffect(() => {
  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/GET/documents');
      const documents = response.data;
      
      const documentformat = documents.map((doc: { id_document: number }) => doc.id_document);
      setDocumentIds(documentformat);
      
      console.log(documentformat); // You can set the documents to state if needed
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  fetchDocuments();
}, []);

  return (
    <div className="Documents-container">
      <div className="MenuFil">
        {isAdmin && <button onClick={() => setPage(11)}>Nouveau document</button>}
      </div>
      <div>
        <div className="Documents">
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <ul>
                    {documentIds.map(documentIds => (
                        <li key={documentIds}>
                            <Document id={documentIds} />
                        </li>
                    ))}
                </ul>
            </div>
      </div>
    </div>
  </div>
  );
}

export default Documentlist;