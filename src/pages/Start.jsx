import React, { use } from 'react'
import Button from '@mui/material/Button';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useState } from 'react';
import imageCompression from 'browser-image-compression';


function Start() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [captured, setCaptured] = useState(false);

  const capturePhoto = async () => {
    const image = webcamRef.current.getScreenshot();
    const options = {
      maxSixeMB: 0.5,
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

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const startExam = () => {
    enterFullscreen();
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
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width={640}
      height={480}
      style={{ borderRadius: '12px', marginBottom: '20px' }}
    />
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
