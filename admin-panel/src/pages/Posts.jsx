import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://127.0.0.1:8000/admin_panel/posts/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const toggleHidePost = async (postId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://127.0.0.1:8000/admin_panel/posts/${postId}/hide/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPosts();
    } catch (error) {
      console.error('Error hiding/unhiding post:', error);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://127.0.0.1:8000/admin_panel/posts/${postId}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchPosts();
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://127.0.0.1:8000/admin_panel/posts/${postId}/detail/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedPost(response.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>All Posts</h2>
      <div style={gridStyle}>
        {posts.map((post) => (
          <div key={post.id} style={cardStyle} onClick={() => fetchPostDetails(post.id)}>
            <div style={userInfoStyle}>
              <img
                src={post.user.profile_picture || 'https://placehold.co/50x50'}
                alt="profile"
                style={profilePicStyle}
              />
              <div>
                <div style={usernameStyle}>{post.user.username}</div>
                <div style={dateStyle}>{post.created_at}</div>
              </div>
            </div>
            {post.images.length > 0 && (
              <img src={post.images[0]} alt="Post" style={postImageStyle} />
            )}
            <p style={captionStyle}>{post.caption}</p>
            <p style={metaStyle}>
              📍 {post.location} | ❤️ {post.likes_count} | 💬 {post.comments_count}
            </p>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div style={modalOverlayStyle} onClick={() => setSelectedPost(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={userInfoStyle}>
              <img
                src={selectedPost.user.profile_picture || 'https://placehold.co/50x50'}
                alt="profile"
                style={profilePicStyle}
              />
              <div>
                <div style={usernameStyle}>{selectedPost.user.username}</div>
                <div style={dateStyle}>{selectedPost.created_at}</div>
              </div>
            </div>
            {selectedPost.images.map((img, i) => (
              <img key={i} src={img} alt={`Post ${i}`} style={modalImageStyle} />
            ))}
            <p style={captionStyle}>{selectedPost.caption}</p>
            <p style={metaStyle}>📍 {selectedPost.location}</p>

            <div style={{ marginTop: '10px', marginBottom: '10px' }}>
              <strong>Comments:</strong>
              {selectedPost.comments.length > 0 ? (
                selectedPost.comments.map((comment) => (
                  <div key={comment.id} style={{ marginTop: '8px' }}>
                    <strong>{comment.username}</strong>: {comment.text}
                    <div style={{ fontSize: '12px', color: '#999' }}>{comment.created_at}</div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '14px', color: '#777' }}>No comments</div>
              )}
            </div>

            <div style={buttonRowStyle}>
              <button
                onClick={() => toggleHidePost(selectedPost.id)}
                style={hideButtonStyle}
              >
                {selectedPost.is_hidden ? 'Unhide' : 'Hide'}
              </button>
              <button
                onClick={() => deletePost(selectedPost.id)}
                style={deleteButtonStyle}
              >
                Delete
              </button>
              <button onClick={() => setSelectedPost(null)} style={closeButtonStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle = {
  marginLeft: '240px',
  padding: '40px 20px',
  backgroundColor: '#fffaf0',
  minHeight: '100vh',
};

const titleStyle = {
  fontSize: '28px',
  marginBottom: '20px',
  color: '#5C4033',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px',
};

const cardStyle = {
  backgroundColor: '#f9f1e7',
  padding: '16px',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  cursor: 'pointer',
};

const userInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px',
};

const profilePicStyle = {
  width: '45px',
  height: '45px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginRight: '10px',
};

const usernameStyle = {
  fontWeight: 'bold',
};

const dateStyle = {
  fontSize: '12px',
  color: '#777',
};

const postImageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  margin: '10px 0',
};

const captionStyle = {
  fontSize: '15px',
  color: '#444',
};

const metaStyle = {
  fontSize: '13px',
  color: '#666',
  marginBottom: '12px',
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '10px',
  maxWidth: '600px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const modalImageStyle = {
  width: '100%',
  borderRadius: '10px',
  margin: '10px 0',
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '15px',
};

const hideButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#d32f2f',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const closeButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#777',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
