import React from "react";

interface PostProps {
    idPhoto: number;
    setaffcom: any;
}

const listephoto = [
    { id: 1, title: "LE chassé", tags: ["tacle", "odoo"], description: "Je mets un chassé au prof d'Odoo" },
    { id: 2, title: "LE coup de pied sauté", tags: ["glissade", "prof"], description: "Je donne un coup de pied sauté à l'expert d'Odoo" },
    { id: 3, title: "LA frappe aérienne", tags: ["inazuma", "tacledelamort"], description: "Je balance une frappe aérienne au formateur d'Odoo" },
    { id: 4, title: "LA frappe aérienne", tags: ["inazuma", "tacledelamort"], description: "Je balance une frappe aérienne au formateur d'Odoo" },
];

const Post: React.FC<PostProps> = ({ idPhoto, setaffcom }) => {
    const photo = listephoto.find(p => p.id === idPhoto);

    if (!photo) {
        return <div>Photo not found</div>;
    }


    return (
        <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", maxWidth: "400px", margin: "16px auto" }}>
            <h1>{photo.title}</h1>
            <img src={require('../../images/meme.gif')} alt="Photo" style={{ width: "100%", height: "auto" }} />
            <p>{photo.description}</p>
            <div style={{ marginTop: "8px" }}>
                {photo.tags.map((tag, index) => (
                    <span key={index} style={{ marginRight: "8px", padding: "4px 8px", background: "#eee", borderRadius: "4px" }}>
                        #{tag}
                    </span>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <button onClick={() => setaffcom((prev: boolean) => !prev)}>
                    Commenter <span>0</span>
                </button>
            </div>
        </div>
    );
};

export default Post;
