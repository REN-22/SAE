import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UploadDocumentProps {
    setPage: any;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ setPage }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentName, setDocumentName] = useState('');
    const [eventId, setEventId] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const Token = localStorage.getItem('phototoken');


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        console.log("upload");
        const token = localStorage.getItem('phototoken');
        try {
            const response = await axios.get('http://localhost:5000/GET/verify-token', {
                params: { token }
            });
            if (!response.data.valid) {
                setPage(5);
                return;
            }
        } catch {
            console.log("token invalide");
            return;
        }

        const formData = new FormData();
        if (selectedFile) formData.append('file', selectedFile);
        formData.append('nom', documentName);
        if (eventId) formData.append('idEvenement', eventId);
        formData.append('token', token ?? '');
        console.log("description", description);    
        formData.append('description', description);
        
        console.log("formData", formData);
        
        try {
            console.log("formData", formData);
            const response = await axios.post('http://localhost:5000/POST/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log("réponse", response.data);
            alert("File uploaded successfully");
            setPage(6)
        } catch (error) {
            console.error('Error uploading file:', error);
            alert("Error uploading file");
        }
    };

    return (
        <div>
            <input type="file" accept="application/pdf" onChange={handleFileChange} required />
            <input
                type="text"
                placeholder="Entrez le nom du document"
                onChange={(e) => setDocumentName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Entrez la description du document"
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <button onClick={handleUpload}>Valider</button>
            <button onClick={() => setPage(6)}>Retour</button>
        </div>
    );
};

export default UploadDocument;