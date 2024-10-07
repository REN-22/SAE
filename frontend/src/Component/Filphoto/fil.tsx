import React from "react";
import Post from "./post";

interface FilProps {
    setPage: any;
}

const Fil: React.FC<FilProps> = ({ setPage }) => {
    const posts = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
    ];
    const [affcom, setAffcom] = React.useState(false);

    const toggleAffcom = () => {
        setAffcom(!affcom);
    };

    return (
        <div>
            {posts.map((post) => (
                <Post key={post.id} idPhoto={post.id} setaffcom={setAffcom} />
            ))}
        </div>
    );
};

export default Fil;
