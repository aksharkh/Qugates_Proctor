import React, { useState, useEffect } from 'react'


function End() {

  const [log, setLog] = useState({});
  const[capturedImage, setCapturedImage] = useState(null);
  useEffect(() => {
    const logData = JSON.parse(localStorage.getItem('cheatingLog')) || {};
    const imageData = localStorage.getItem('capturedImage');
    setLog(logData);
    setCapturedImage(imageData);
  }, []);

  return (
    <div
  style={{
    maxWidth: '600px',
    margin: '80px auto',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
  }}
>
  <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#2e7d32' }}>
    Exam Completed ✅
  </h2>
  {capturedImage && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#1976d2' }}>
            Captured Face
          </h3>
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: '200px',
              borderRadius: '12px',
              border: '2px solid #ccc',
            }}
          />
        </div>
      )}

  <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#d32f2f' }}>
    Cheating Log
  </h3>

  <ul style={{ listStyleType: 'none', padding: 0, color: '#444' }}>
    {Object.entries(log).map(([key, value]) => (
      <li
        key={key}
        style={{
          fontSize: '16px',
          padding: '8px 0',
          borderBottom: '1px solid #eee',
          textAlign: 'left',
        }}
      >
        <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {value}
      </li>
    ))}
  </ul>
</div>

  );
};

export default End
