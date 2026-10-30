
export const Overview: React.FC = () => {
  return (
    <div className="panel">
      <h3>Overview</h3>
      <p><strong>Aim</strong></p>
      <p style={{ marginBottom: '15px' }}>
        "Design RESTful APIs using Spring Boot that enforce consistent response structures, handle exceptions globally, log request details, and support secure cross-origin communication."
      </p>
      
      <p><strong>Major Concepts:</strong></p>
      <ul className="list-styled">
        <li>REST API Design</li>
        <li>Layered Architecture</li>
        <li>Request Validation</li>
        <li>Response Standardization</li>
        <li>CORS</li>
        <li>Filters & Interceptors</li>
        <li>Global Exception Handling</li>
        <li>Logging & Monitoring</li>
        <li>Correlation ID</li>
      </ul>
    </div>
  );
};
