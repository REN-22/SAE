import React from "react";

interface PostProps {
    idPhoto: number;
}

const listephoto = [
    { id: 1, title: "la belle photo1", tags: ["joli", "photo"], description: "c'est une jolie photo" },
    { id: 2, title: "la belle photo2", tags: ["joli", "photo"], description: "c'est une jolie photo" },
    { id: 3, title: "la belle photo3", tags: ["joli", "photo"], description: "c'est une jolie photo" },
    { id: 4, title: "la belle photo4", tags: ["joli", "photo"], description: "c'est une jolie photo" },
];

const Post: React.FC<PostProps> = ({ idPhoto}) => {
    const photo = listephoto.find(p => p.id === idPhoto);

    if (!photo) {
        return <div>Photo not found</div>;
    }


    return (
        <>
            <h1>{photo.title}</h1>
            <img src={require('../../images/meme.jpg')} alt="Photo" style={{ width: "100%", height: "auto" }} />
            <p>{photo.description}</p>
            <div style={{ marginTop: "8px" }}>
                {photo.tags.map((tag, index) => (
                    <span key={index} style={{ marginRight: "8px", padding: "4px 8px", background: "#eee", borderRadius: "4px" }}>
                        #{tag}
                    </span>
                ))}
            </div>
        </>
    );
};

export default Post;
