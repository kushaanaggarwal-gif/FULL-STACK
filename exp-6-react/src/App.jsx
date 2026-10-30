import React, { useState } from 'react';
import './App.css';

const allPosts = [
    { id: 1, title: 'Understanding JPQL', author: 'Author 1', likes: 120, createdAt: '2023-01-10', comments: ['Great post!', 'Very helpful.'] },
    { id: 2, title: 'Spring Boot Basics', author: 'Author 2', likes: 85, createdAt: '2023-01-12', comments: ['Nice intro.'] },
    { id: 3, title: 'Advanced Caching', author: 'Author 1', likes: 300, createdAt: '2023-02-05', comments: ['Blazing fast!', 'Ehcache is cool.'] },
    { id: 4, title: 'Database Indexing', author: 'Author 2', likes: 45, createdAt: '2023-02-20', comments: [] },
    { id: 5, title: 'Redis vs Ehcache', author: 'Author 1', likes: 210, createdAt: '2023-03-15', comments: ['I prefer Redis.'] },
    { id: 6, title: 'Microservices Guide', author: 'Author 3', likes: 500, createdAt: '2023-04-01', comments: ['Too complex for me.', 'Great architecture.'] },
    { id: 7, title: 'Hibernate N+1', author: 'Author 2', likes: 150, createdAt: '2023-04-10', comments: ['A classic problem.', 'Thanks for the fix.'] },
    { id: 8, title: 'REST API Best Practices', author: 'Author 3', likes: 90, createdAt: '2023-04-12', comments: [] },
    { id: 9, title: 'Scaling Databases', author: 'Author 1', likes: 410, createdAt: '2023-05-01', comments: ['Scaling is hard.'] },
    { id: 10, title: 'Pagination Tips', author: 'Author 2', likes: 60, createdAt: '2023-05-05', comments: ['Page 2 is a lie.'] },
];

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [authorFilter, setAuthorFilter] = useState('1');

  // N+1 state
  const [nPlusOneLoading, setNPlusOneLoading] = useState(false);
  const [nPlusOneLogs, setNPlusOneLogs] = useState([]);
  const [nPlusOneData, setNPlusOneData] = useState([]);

  // Cache state
  const [cacheStatus, setCacheStatus] = useState('-');
  const [cacheDbHits, setCacheDbHits] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [isCached, setIsCached] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheTime, setCacheTime] = useState(null);
  const [cacheData, setCacheData] = useState([]);

  const [nativeResult, setNativeResult] = useState(null);

  // Pagination Logic
  const sortedPosts = [...allPosts].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
  });

  const totalPages = Math.ceil(sortedPosts.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const pagedData = sortedPosts.slice(startIdx, startIdx + pageSize);

  // JPQL Logic
  const authorPosts = allPosts.filter(p => p.author === `Author ${authorFilter}`);

  // Simulate N+1 vs JOIN FETCH
  const runNormalFetch = async () => {
    if (nPlusOneLoading) return;
    setNPlusOneLoading(true);
    setNPlusOneData([]);
    
    let logs = ['[DB] SELECT * FROM posts LIMIT 3; (1 query)'];
    setNPlusOneLogs([...logs]);
    await new Promise(r => setTimeout(r, 400));
    
    const demoPosts = allPosts.slice(0, 3);
    for(let p of demoPosts) {
       logs.push(`[DB] SELECT * FROM comments WHERE post_id = ${p.id};`);
       setNPlusOneLogs([...logs]);
       await new Promise(r => setTimeout(r, 400));
    }
    
    setNPlusOneData(demoPosts);
    setNPlusOneLoading(false);
  };

  const runJoinFetch = async () => {
    if (nPlusOneLoading) return;
    setNPlusOneLoading(true);
    setNPlusOneData([]);
    
    setNPlusOneLogs(['[DB] SELECT p.*, c.* FROM posts p JOIN FETCH p.comments c LIMIT 3; (1 query)']);
    await new Promise(r => setTimeout(r, 500));
    
    setNPlusOneData(allPosts.slice(0, 3));
    setNPlusOneLoading(false);
  };

  const handleCacheRequest = async () => {
      if (cacheLoading) return;
      setCacheLoading(true);
      const start = Date.now();
      setCacheData([]);
      
      if (!isCached) {
          // Simulate slow DB response
          await new Promise(r => setTimeout(r, 1200));
          setCacheDbHits(prev => prev + 1);
          setIsCached(true);
          setCacheStatus('miss');
      } else {
          // Simulate fast cache response
          await new Promise(r => setTimeout(r, 50));
          setCacheHits(prev => prev + 1);
          setCacheStatus('hit');
      }
      
      setCacheTime(Date.now() - start);
      setCacheData(allPosts.slice(0, 3)); // show a subset
      setCacheLoading(false);
  };

  const resetCache = () => {
      setIsCached(false);
      setCacheStatus('-');
      setCacheTime(null);
      setCacheData([]);
  };

  const handleNativeQuery = () => {
      const topPosts = [...allPosts].sort((a, b) => b.likes - a.likes).slice(0, 3);
      setNativeResult(topPosts);
  };

  return (
    <div className="app-container">
      <nav>
          <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#pagination">Pagination API</a></li>
              <li><a href="#jpql">Query Optimization</a></li>
              <li><a href="#nplusone">N+1 & JOIN FETCH</a></li>
              <li><a href="#caching">Caching API</a></li>
              <li><a href="#nativesql">Native Queries</a></li>
              <li><a href="#benchmarking">Benchmarking</a></li>
          </ul>
      </nav>

      <div className="container">
          {/* Overview */}
          <section id="overview">
              <h1>Experiment 6 – Scalable Read APIs with Caching & Optimization</h1>
              <p><strong>Aim:</strong> Create high-performance read APIs that support pagination, sorting, caching, and optimized database queries to power analytics dashboards and post feeds.</p>
              
              <div className="flow">
                  Large Dataset &rarr; Pagination &rarr; Sorting &rarr; Query Optimization &rarr; Caching &rarr; Fast API
              </div>
          </section>

          {/* Pagination & Sorting (Assignment 1) */}
          <section id="pagination">
              <h2>1. Pagination API <span style={{fontSize: '0.6em', color: '#666', fontWeight: 'normal'}}>(Assignment 1)</span></h2>
              <p>Instead of fetching all posts at once, we use Spring's <code>Pageable</code> to retrieve small chunks of data, avoiding memory overload.</p>
              
              <div className="interactive-demo">
                  <div className="controls">
                      <label>Page Size: 
                        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                        </select>
                      </label>
                      <label>Sort By: 
                        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
                          <option value="id">ID</option>
                          <option value="createdAt">Created At</option>
                          <option value="likes">Likes</option>
                        </select>
                      </label>
                      <label>Order: 
                        <select value={sortOrder} onChange={e => { setSortOrder(e.target.value); setCurrentPage(1); }}>
                          <option value="asc">Ascending</option>
                          <option value="desc">Descending</option>
                        </select>
                      </label>
                  </div>
                  <table>
                      <thead>
                          <tr><th>ID</th><th>Title</th><th>Author</th><th>Likes</th><th>Created At</th></tr>
                      </thead>
                      <tbody>
                        {pagedData.map(post => (
                            <tr key={post.id}>
                                <td>{post.id}</td>
                                <td>{post.title}</td>
                                <td>{post.author}</td>
                                <td>{post.likes}</td>
                                <td>{post.createdAt}</td>
                            </tr>
                        ))}
                      </tbody>
                  </table>
                  <div className="pagination-controls">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                      <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</button>
                  </div>
              </div>
          </section>

          {/* JPQL & Query Optimization */}
          <section id="jpql">
              <h2>2. JPQL Query Optimization</h2>
              <p>Executing targeted queries using JPQL instead of filtering data in Java memory.</p>
              <div className="interactive-demo">
                  <label style={{marginBottom: '10px', display: 'block'}}><strong>Filter Posts by Author:</strong> 
                      <select style={{marginLeft: '10px'}} value={authorFilter} onChange={e => setAuthorFilter(e.target.value)}>
                          <option value="1">Author 1</option>
                          <option value="2">Author 2</option>
                          <option value="3">Author 3</option>
                      </select>
                  </label>
                  
                  {authorPosts.length > 0 ? (
                    <table>
                      <thead><tr><th>Title</th><th>Likes</th><th>Created At</th></tr></thead>
                      <tbody>
                        {authorPosts.map(p => (
                          <tr key={p.id}>
                            <td>{p.title}</td>
                            <td>{p.likes}</td>
                            <td>{p.createdAt}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="result-box">No posts found.</div>}
              </div>
          </section>

          {/* N+1 Problem (Assignment 2) */}
          <section id="nplusone">
              <h2>3. Fixing the N+1 Problem <span style={{fontSize: '0.6em', color: '#666', fontWeight: 'normal'}}>(Assignment 2)</span></h2>
              <p>Fetching posts and their comments individually causes N+1 queries. We solve this using <code>JOIN FETCH</code>.</p>
              
              <div className="interactive-demo split-demo">
                  <div className="demo-half">
                      <button onClick={runNormalFetch} disabled={nPlusOneLoading}>Simulate Normal Fetch</button>
                  </div>
                  <div className="demo-half">
                      <button onClick={runJoinFetch} disabled={nPlusOneLoading}>Simulate JOIN FETCH</button>
                  </div>
              </div>

              {nPlusOneLogs.length > 0 && (
                <div className="interactive-demo" style={{backgroundColor: '#1e1e1e', color: '#4caf50', fontFamily: 'monospace', padding: '15px'}}>
                    {nPlusOneLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                    {nPlusOneLoading && <div style={{color: '#ffeb3b'}}>Executing...</div>}
                </div>
              )}

              {nPlusOneData.length > 0 && (
                <div className="interactive-demo">
                    <h4>Resulting Data (Posts + Comments):</h4>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {nPlusOneData.map(p => (
                            <li key={p.id} style={{marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #ddd'}}>
                                <strong>{p.title}</strong>
                                <div style={{marginLeft: '20px', color: '#555'}}>
                                    &rarr; Comments: {p.comments.length > 0 ? p.comments.join(', ') : 'None'}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
          </section>

          {/* Caching (Assignment 3) */}
          <section id="caching">
              <h2>4. Caching with Ehcache <span style={{fontSize: '0.6em', color: '#666', fontWeight: 'normal'}}>(Assignment 3)</span></h2>
              <p>Fetching raw data from the database is slow. We can cache the response so subsequent requests return instantly.</p>
              
              <div className="interactive-demo cache-demo">
                  <div style={{marginBottom: '15px'}}>
                    <button onClick={handleCacheRequest} disabled={cacheLoading}>Fetch Analytics Data</button>
                    <button onClick={resetCache} style={{marginLeft: '10px', backgroundColor: '#6c757d'}} disabled={cacheLoading}>Clear Cache</button>
                  </div>

                  {cacheLoading && <div style={{margin: '15px 0'}}>Loading...</div>}

                  {!cacheLoading && cacheTime !== null && (
                      <div className="result-box" style={{flexDirection: 'column', padding: '15px'}}>
                          <div style={{fontSize: '18px', marginBottom: '10px'}}>
                              {cacheStatus === 'miss' ? (
                                  <span style={{color: '#d32f2f'}}>Cache Miss &rarr; Database Hit</span>
                              ) : (
                                  <span style={{color: '#388e3c'}}>Cache Hit &rarr; Returned from Memory</span>
                              )}
                          </div>
                          <div><strong>Time taken:</strong> {cacheTime} ms</div>
                      </div>
                  )}

                  {!cacheLoading && cacheData.length > 0 && (
                      <table style={{marginTop: '15px'}}>
                          <thead><tr><th>ID</th><th>Post Title</th><th>Likes</th></tr></thead>
                          <tbody>
                            {cacheData.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.title}</td>
                                    <td>{p.likes}</td>
                                </tr>
                            ))}
                          </tbody>
                      </table>
                  )}

                  <div className="stats" style={{marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px'}}>
                      Cumulative Stats: Database Hits: <span>{cacheDbHits}</span> | Cache Hits: <span>{cacheHits}</span>
                  </div>
              </div>
          </section>

          {/* Native SQL (Assignment 4) */}
          <section id="nativesql">
              <h2>5. Native SQL Query <span style={{fontSize: '0.6em', color: '#666', fontWeight: 'normal'}}>(Assignment 4)</span></h2>
              <p>For complex analytics, like fetching the top performing posts, we can bypass ORM overhead and execute raw SQL.</p>
              
              <div className="interactive-demo">
                  <button onClick={handleNativeQuery}>Fetch Top Performing Posts (LIMIT 3)</button>
                  
                  {nativeResult && (
                      <table style={{marginTop: '15px'}}>
                          <thead>
                              <tr>
                                  <th>Rank</th>
                                  <th>Title</th>
                                  <th>Likes</th>
                                  <th>Author</th>
                              </tr>
                          </thead>
                          <tbody>
                              {nativeResult.map((p, index) => (
                                  <tr key={p.id}>
                                      <td>#{index + 1}</td>
                                      <td>{p.title}</td>
                                      <td><strong>{p.likes}</strong></td>
                                      <td>{p.author}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </section>

          {/* Benchmarking (Assignment 5) */}
          <section id="benchmarking">
              <h2>6. Performance Benchmarking <span style={{fontSize: '0.6em', color: '#666', fontWeight: 'normal'}}>(Assignment 5)</span></h2>
              <p>Using a tool like JMeter, we measure how our optimizations (Pagination, Caching, JOIN FETCH) impact system load.</p>
              
              <div className="interactive-demo">
                  <table className="benchmark-table">
                      <thead>
                          <tr>
                              <th>Metric</th>
                              <th>Without Optimizations</th>
                              <th>With Optimizations</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td>Response Time</td>
                              <td style={{color: '#d32f2f'}}>450 ms</td>
                              <td style={{color: '#388e3c'}}>45 ms</td>
                          </tr>
                          <tr>
                              <td>Throughput</td>
                              <td style={{color: '#d32f2f'}}>120 req/sec</td>
                              <td style={{color: '#388e3c'}}>850 req/sec</td>
                          </tr>
                          <tr>
                              <td>Error Rate under heavy load</td>
                              <td style={{color: '#d32f2f'}}>2.5%</td>
                              <td style={{color: '#388e3c'}}>0.1%</td>
                          </tr>
                      </tbody>
                  </table>
                  <small style={{display: 'block', marginTop: '10px', color: '#666', textAlign: 'center'}}>*Simulated metrics demonstrating the impact of Experiment 6 concepts.</small>
              </div>
          </section>

      </div>
    </div>
  );
}

export default App;
