import axios from "axios";
import React, { useEffect, useState } from "react";
import "./post.css";

interface PostProps {
    idPhoto: number;
    toggleAffcom: (id_Photo: number) => void;
}

interface PhotoMetadata {
    id: number;
    title: string;
    dateTaken: string;
    dateUploaded: string;
    exif: string | null;
    description: string | null;
    userId: number;
    tags: string[];
}

const Post: React.FC<PostProps> = ({ idPhoto, toggleAffcom }) => {
    const [metadata, setMetadata] = useState<PhotoMetadata | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetadataAndPhoto = async () => {
            try {
                const token = localStorage.getItem("phototoken");
                if (!token) {
                    throw new Error("Authentication token is missing.");
                }

                // Récupérer les métadonnées
                const metadataResponse = await axios.get(
                    "http://localhost:5000/GET/photo/metadata",
                    {
                        params: { token, id: idPhoto },
                    }
                );

                if (metadataResponse.status !== 200) {
                    throw new Error("Failed to fetch metadata.");
                }

                const photoData = metadataResponse.data;
                const metadata: PhotoMetadata = {
                    id: photoData.id,
                    title: photoData.nom,
                    dateTaken: new Date(photoData.date_prise_vue).toLocaleDateString(),
                    dateUploaded: new Date(photoData.date_depot).toLocaleDateString(),
                    exif: photoData.exif,
                    description: photoData.description,
                    userId: photoData.id_utilisateur,
                    tags: [], // Tags seront ajoutés après
                };

                // Récupérer les tags
                try {
                    const tagsResponse = await axios.get(
                        "http://localhost:5000/GET/photo/tags",
                        {
                            params: { token, id: idPhoto },
                        }
                    );

                    console.log('tagsResponse :', tagsResponse.data);

                    if (tagsResponse.status === 200 && tagsResponse.data.length > 0) {
                        const tags = tagsResponse.data.map((tag: any) => tag.texte); // Adaptez selon la structure des données
                        metadata.tags = tags;
                    }
                } catch (tagsError) {
                    if (axios.isAxiosError(tagsError) && tagsError.response?.status === 404) {
                        // Aucun tag trouvé (404), mais ce n'est pas une erreur critique
                        console.warn("No tags found for this photo.");
                    } else {
                        throw new Error("Failed to fetch tags.");
                    }
                }

                setMetadata(metadata);

                // Récupérer le fichier photo
                const fileResponse = await axios.get(
                    "http://localhost:5000/GET/photo/filemin",
                    {
                        params: { id: idPhoto },
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
        };

        fetchMetadataAndPhoto();
    }, [idPhoto]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!metadata || !photoUrl) {
        return <div>Photo not found</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1>{metadata.title}</h1>
            <img
                src={photoUrl}
                alt={metadata.title}
                style={{ width: "100%", height: "auto" }}
            />
            <p>
                <strong>Date de dépôt:</strong> {metadata.dateUploaded}
            </p>
            <p>
                <strong>photographe:</strong> {metadata.userId}
            </p>
            <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {metadata.tags.length > 0 ? (
                    metadata.tags.map((tag) => (
                        <span
                            key={`${metadata.id}-${tag}`}
                            className="tag"
                        >
                            #{tag}
                        </span>
                    ))
                ) : (
                    <span style={{ fontStyle: "italic", color: "#888" }}>
                        Aucun tag disponible pour cette photo.
                    </span>
                )}
            </div>
            <p>
                <strong>Description:</strong> {metadata.description ?? "Aucune description disponible."}
            </p>
            <button className="bouttoncoms" onClick={() => toggleAffcom(idPhoto)}>
                  Commenter <span>0</span>
            </button>
        </div>
    );
}; 

export default Post;
