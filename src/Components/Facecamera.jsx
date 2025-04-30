import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as cocossd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import swal from 'sweetalert';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import * as faceapi from '@vladmandic/face-api';

function Facecamera() {
  let cocoModelCache = useRef(null); 
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [referenceDescriptor, setReferenceDescriptor] = useState();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [log, setLog] = useState({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    prohibitedObjectCount: 0,
    faceMismatchCount: 0,
  });

  const initTf = async () => {
    await tf.setBackend('webgl');
    await tf.ready();
  };

  const loadFaceModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);
      console.log('Face-api.js models loaded');
    } catch (error) {
      console.error('Failed to load face-api models:', error);
    }
  };

  const captureReferenceFromStartPage = async () => {
    console.log('Starting reference capture...');
    const imgDataUrl = localStorage.getItem('capturedImage');
    if (!imgDataUrl) {
      console.error('No image found in localStorage');
      swal('Error', 'No reference image found. Please capture image first.', 'error');
      return null;
    }

    try {
      const img = new Image();
      img.src = imgDataUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('Image loaded successfully');
          resolve();
        };
        img.onerror = () => reject(new Error('Image load failed'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const detection = await faceapi
        .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const descriptorArray = Array.from(detection.descriptor);
        console.log('Face detected in reference image');
        setReferenceDescriptor(descriptorArray);
        return descriptorArray;
      }

      throw new Error('No face detected in reference image');
    } catch (error) {
      console.error('Error in reference capture:', error);
      swal('Error', 'Failed to process reference image', 'error');
      return null;
    }
  };

  useEffect(() => {
    if (referenceDescriptor) {
      runCoco(); 
    }
  }, [referenceDescriptor]);

  const runCoco = async () => {
    if (!cocoModelCache.current) {
      cocoModelCache.current = await cocossd.load(); 
      console.log('Coco SSD model loaded.');
    }

    setInterval(() => {
      if (!isAlertOpen) {
        detect(cocoModelCache.current); // use cached model
      }
    }, 1500);
  };

  const detect = async (net) => {
    if (isAlertOpen) return;
    const videoEl = webcamRef.current?.video;
    if (!videoEl || videoEl.readyState !== 4) return;

    const videoWidth = videoEl.videoWidth;
    const videoHeight = videoEl.videoHeight;
    videoEl.width = videoWidth;
    videoEl.height = videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    if (referenceDescriptor && !isAlertOpen) {
      try {
        const faceDetection = await faceapi
          .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (faceDetection) {
          const distance = faceapi.euclideanDistance(
            referenceDescriptor,
            Array.from(faceDetection.descriptor)
          );
          console.log('Face Match Distance:', distance);

          if (distance > 0.6) {
            setIsAlertOpen(true);
            swal('Face Mismatch Detected', 'Different person in front of camera!', 'error').then(() => {
              setLog(prev => ({ ...prev, faceMismatchCount: prev.faceMismatchCount + 1 }));
              setIsAlertOpen(false);
            });
          }
        }
      } catch (err) {
        console.error('Face detection error:', err);
      }
    }

    try {
      const obj = await net.detect(videoEl);
      console.log('Detected Objects:', obj);
      let person_count = 0;

      if (!isAlertOpen && obj.length < 1) {
        setIsAlertOpen(true);
        swal('Face Not Visible', 'Action has been Recorded', 'error').then(() => {
          setIsAlertOpen(false);
          setLog(prevLog => ({ ...prevLog, noFaceCount: prevLog.noFaceCount + 1 }));
        });
        return;
      }

      obj.forEach((element) => {
        if (!isAlertOpen && element.class === 'cell phone') {
          setIsAlertOpen(true);
          swal('Cell Phone Detected', 'Action has been Recorded', 'error').then(() => {
            setIsAlertOpen(false);
            setLog(prevLog => ({ ...prevLog, cellPhoneCount: prevLog.cellPhoneCount + 1 }));
          });
          return;
        }
        if (!isAlertOpen && element.class === 'book') {
          setIsAlertOpen(true);
          swal('Prohibited Object Detected', 'Action has been Recorded', 'error').then(() => {
            setIsAlertOpen(false);
            setLog(prevLog => ({ ...prevLog, prohibitedObjectCount: prevLog.prohibitedObjectCount + 1 }));
          });
          return;
        }
        if (element.class === 'person') {
          person_count++;
          if (!isAlertOpen && person_count > 1) {
            setIsAlertOpen(true);
            swal('Multiple Faces Detected', 'Action has been Recorded', 'error').then(() => {
              setIsAlertOpen(false);
              setLog(prevLog => ({ ...prevLog, multipleFaceCount: prevLog.multipleFaceCount + 1 }));
            });
          }
          return;
        }
      });
    } catch (err) {
      console.error('coco-ssd error:', err);
    }
  };

  const endExam = () => {
    localStorage.setItem('cheatingLog', JSON.stringify(log));
    navigate('/end');
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await initTf();
        await loadFaceModels();
        await captureReferenceFromStartPage(); // after loading models
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '20px',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          background: '#fff',
          padding: '10px',
        }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
        />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>
      <div
        style={{
          marginTop: '20px',
        }}
      >
        <Button variant="contained" onClick={endExam} color="error">
          End Exam
        </Button>
      </div>
    </div>
  );
}

export default Facecamera;
