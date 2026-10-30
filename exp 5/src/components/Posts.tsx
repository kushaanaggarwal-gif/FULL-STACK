import { useState, useEffect } from 'react';
import { MockApiService } from '../utils/mockApi';
import { Post, ApiResponseData } from '../types';

interface PostsProps {
  api: MockApiService;
}

export const Posts: React.FC<PostsProps> = ({ api }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Create Post state
  const [createContent, setCreateContent] = useState('');
  const [createResult, setCreateResult] = useState<{ success: boolean; message: string; status?: number } | null>(null);

  // Edit Post state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editResult, setEditResult] = useState<{ success: boolean; message: string; status?: number } | null>(null);

  const loadPosts = async () => {
    try {
      const data = await api.getPosts();
      setPosts(data);
    } catch (e) {
      // handled globally
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreate = async () => {
    setCreateResult(null);
    try {
      await api.createPost(createContent);
      setCreateResult({ success: true, message: 'Validation passed' });
      setCreateContent('');
      loadPosts();
    } catch (e: any) {
      if (e && e.status === 'error') {
         const res = e as ApiResponseData;
         const msg = res.message.replace('Validation failed: ', '');
         setCreateResult({ success: false, message: msg, status: res.meta.statusCode });
      }
    }
  };

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setEditContent(post.content);
    setEditResult(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditResult(null);
  };

  const handleUpdate = async (id: number) => {
    setEditResult(null);
    try {
      await api.updatePost(id, editContent);
      setEditingId(null);
      setEditContent('');
      loadPosts();
    } catch (e: any) {
      if (e && e.status === 'error') {
         const res = e as ApiResponseData;
         const msg = res.message.replace('Validation failed: ', '');
         setEditResult({ success: false, message: msg, status: res.meta.statusCode });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deletePost(id);
      loadPosts();
    } catch (e) {
      // handled globally
    }
  };

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Posts API — CRUD Operations <span className="badge" style={{marginLeft: 10, fontWeight: 'normal'}}><code>/api/posts</code></span></h3>
        <button onClick={loadPosts} className="secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Refresh</button>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Create Post</label>
        
        <textarea 
          value={createContent}
          onChange={(e) => setCreateContent(e.target.value)}
          placeholder="Enter post content..."
          style={{ width: '100%', minHeight: '60px', marginBottom: '5px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontFamily: 'inherit' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          <span>Required • Maximum 280 characters</span>
          <span>{createContent.length} / 280</span>
        </div>

        <button onClick={handleCreate}>Create Post</button>

        {createResult && (
          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
            {createResult.success ? (
              <div style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>✓</span> {createResult.message}
              </div>
            ) : (
              <div>
                <div style={{ color: 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>✕</span> {createResult.message}
                </div>
                {createResult.status && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {createResult.status} Bad Request
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50px' }}>ID</th>
              <th>Content</th>
              <th style={{ width: '150px' }}>Created At</th>
              <th style={{ width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>
                  {editingId === post.id ? (
                    <div style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-color)' }}>
                      <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: '100%', minHeight: '50px', marginBottom: '5px', padding: '5px', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        <span>Required • Max 280</span>
                        <span>{editContent.length} / 280</span>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleUpdate(post.id)} style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save Changes</button>
                        <button onClick={cancelEdit} className="secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</button>
                      </div>
                      
                      {editResult && !editResult.success && (
                        <div style={{ marginTop: '10px', color: 'var(--error-color)', fontSize: '0.85rem' }}>
                          ✕ {editResult.message}
                          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{editResult.status} Bad Request</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    post.content
                  )}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => startEdit(post)} disabled={editingId === post.id}>Edit</button>
                    <button className="danger" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => handleDelete(post.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No posts available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
