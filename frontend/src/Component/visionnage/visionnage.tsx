import { useState, useEffect } from "react";
import axios from 'axios';

interface VisionnageProps {
    setPage: any;
    idvisionnage: number;
    setIdvisionnage: any;
    }

const Visionnage: React.FC<VisionnageProps> = ({ setPage, idvisionnage, setIdvisionnage }) => {
    const [visionnage, setVisionnage] = useState<number[]>([]);
    const [indice, setIndice] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const token = localStorage.getItem('phototoken');

    useEffect(() => {
        const fetchVisionnage = async () => {
            console.log('idvisionnage :',idvisionnage)
            try {
                const response = await axios.get(`http://backend:5000/GET/visionnage-photos`, {
                    params: { id: idvisionnage, token },
                });
                setVisionnage(response.data);
            } catch (error) {
                setError('Erreur lors de la récupération des données de visionnage');
            }
        }
        fetchVisionnage();
    }, []);

    useEffect(() => {
        if (visionnage.length > 0) {
            recupphoto(visionnage[indice]);
        }
    }, [indice, visionnage]);
    
    const recupphoto = (idphoto: number) => {
        console.log('idphoto:', idphoto);
        const idphotoNumber = (idphoto as any).id_photo ?? idphoto;
        console.log('idphotoNumber:', idphotoNumber);
        const fetchPhoto = async () => {
            try {
                // Récupérer le fichier photo
                const fileResponse = await axios.get(
                    "http://backend:5000/GET/photo/file",
                    {
                        params: { id: idphotoNumber, token },
                        responseType: "blob", // Important pour récupérer un fichier
                    }
                );

                if (fileResponse.status !== 200) {
                    throw new Error("Failed to fetch photo file.");
                }

                const photoBlobUrl = URL.createObjectURL(fileResponse.data);
                setPhotoUrl(photoBlobUrl);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchPhoto();
    }

    const suivant = () => {
        if (indice < visionnage.length - 1) {
            setIndice(indice + 1);
        }
    }

    const precedent = () => {
        if (indice > 0) {
            setIndice(indice - 1);
        }
    }

    const Quitter = () => {
        setIdvisionnage(null);
        setPage(7);
    }

    if (error) {
        return <div>Erreur : {error}</div>;
    }

    if (!visionnage) {
        return <div>Chargement...</div>;
    }

    return (
        <div style={{ height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "90vh" }}>
                <img
                    src={photoUrl ?? ''}
                    alt="En cours de visionnage"
                    style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
                <button onClick={precedent}>Précédent</button>
                <button onClick={suivant}>Suivant</button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
                <button onClick={Quitter}>Quitter</button>
            </div>
        </div>
    );
};

export default Visionnage;