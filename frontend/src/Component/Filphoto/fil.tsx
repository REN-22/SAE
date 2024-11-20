import React from "react";
import Post from "./post";
import "./fil.css";
import CommentairesTotal from "./commentairesTotal";

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
        console.log("Toggle comments visibility:", !affcom);
    };

    return (
        <div className="postcom">
          <button onClick={() => setPage(4)}>nouveau post</button>
          <div className="superpost">
            {posts.map((post) => (
              <div className="post" key={post.id}>
                <Post idPhoto={post.id} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <button onClick={toggleAffcom}>
                    Commenter <span>0</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {affcom && (
            <div className="commentairelist">
              <CommentairesTotal />
            </div>
          )}
        </div>
        );
      }
      


export default Fil;
