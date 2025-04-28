import React from 'react'
import { useRef, useState, Suspense, lazy } from 'react';

import Button from '@mui/material/Button';

import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import imageCompression from 'browser-image-compression';


function Start() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);
  
  const Webcam = lazy(() => import('react-webcam'));
  const capturePhoto = async () => {
    const image = webcamRef.current.getScreenshot();
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    try {
      // Convert base64 to File (imageCompression needs File/Blob)
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "capturedImage.jpg", { type: "image/jpeg" });
  
      const compressedFile = await imageCompression(file, options);
      const compressedBase64 = await imageCompression.getDataUrlFromFile(compressedFile);
  
      localStorage.setItem('capturedImage', compressedBase64);
      setCaptured(true);
    } catch (error) {
      console.error("Compression failed:", error);
    }
  };
  const startExam = () => {
    navigate('/exam');
  };

  return (
    <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f0f2f5',
  }}
>
  <div
    style={{
      padding: '30px',
      borderRadius: '16px',
      background: '#fff',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    }}
  >
    <Suspense fallback={<div>Loading camera...</div>}>
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width={640}
      height={480}
      style={{ borderRadius: '12px', marginBottom: '20px' }}
    />
    </Suspense>
    {!captured ? (
      <Button
        variant="contained"
        onClick={capturePhoto}
        style={{ padding: '10px 24px', fontSize: '16px' }}
      >
        Capture Photo
      </Button>
    ) : (
      <Button
        variant="contained"
        color="success"
        onClick={startExam}
        style={{ padding: '10px 24px', fontSize: '16px' }}
      >
        Start Exam
      </Button>
    )}
  </div>
</div>

  );
};

export default Start
