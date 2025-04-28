import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react'
import FileDownloadIcon from '@mui/icons-material/FileDownload';


function End() {

  const [log, setLog] = useState({});
  const[capturedImage, setCapturedImage] = useState(null);

  const downloadImage = () => {
    if( capturedImage){
      const base64Response = fetch(capturedImage);
      base64Response.then(res => res.blob()).then(blob => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'capturedImage.jpg';
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href); // Clean up the URL object
      });
    }
  };


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
              marginBottom: '12px'
            }}
          />
          <div>
            <Button
            variant='contained'
            color='primary'
            startIcon={<FileDownloadIcon />}
            onClick={downloadImage}
            style={{ marginTop: '12px' }}>
              Download Image
            </Button>
          </div>
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
