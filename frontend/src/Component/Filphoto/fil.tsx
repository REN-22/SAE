import React from "react";
import Post from "./post";
import "./fil.css";
import CommentairesTotal from "./commentairesTotal";
import axios from "axios";

interface FilProps {
  setPage: any;
}

const Fil: React.FC<FilProps> = ({ setPage }) => {
  const [affcom, setAffcom] = React.useState(false);
  const [posts, setPosts] = React.useState<{ id_photo: number }[]>([]);
  const [filpage, setFilpage] = React.useState(1);
  const token = localStorage.getItem('phototoken');
  const [idphotopourcom, setIdphotopourcom] = React.useState(0);
  const [idphototoggleAffcom, setIdphototoggleAffcom] = React.useState(0);

  const toggleAffcom = (id_photo:number) => {
    if (id_photo === idphototoggleAffcom && affcom === true) {
      setAffcom(false);
    } else {
    setAffcom(true);
    setIdphototoggleAffcom(id_photo);
    setIdphotopourcom(id_photo);
    console.log("Toggle comments visibility:", !affcom);
    }
  };

  const nextPage = () => {
    setFilpage((prevPage) => prevPage + 1);
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    setFilpage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
    window.scrollTo(0, 0);
  };

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/GET/photosid', {
          params: {
            token: token,
            page: filpage
          }
        });
        const data = response.data;
        console.log("data", data);
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [filpage]);

  return (
    <div className="superpostcom">
      <button onClick={() => setPage(4)}>nouveau post</button>
      <div className="postcom">
        <div className="superpost">
          {posts.map((post) => (
            <div className="post" key={post.id_photo}>
              <Post idPhoto={post.id_photo} toggleAffcom={toggleAffcom}/>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              </div>
            </div>
          ))}
        </div>
        {affcom && (
          <div className="commentairelist">
            <CommentairesTotal 
            idPhoto={idphotopourcom}
            />
          </div>
        )}
      </div>
      <div className="pagination">
        <button onClick={prevPage} disabled={filpage === 1}>Précédent</button>
        <span>Page {filpage}</span>
        <button onClick={nextPage}>Suivant</button>
      </div>
    </div>
  );
}

export default Fil;
