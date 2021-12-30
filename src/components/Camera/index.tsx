import React, { useEffect, useState } from 'react'
import { Decoder } from '@nuintun/qrcode';
import { Modal, Button } from 'react-bootstrap';

export const Camera = ({ show, setShow }: { show: boolean, setShow: any }) => {
  const [initializeDone, setInitializeDone] = useState(false);
  useEffect(() => {
    if (show) {
      initializeMedia();
    }
  }, [show]);

  useEffect(() => {
    if (initializeDone && show) {
      const timeout = setInterval(() => {
        console.log('in timeout');
        captureImage();
      }, 1000);
  
      return () => clearInterval(timeout);
    }
  }, [initializeDone, show]);

  const initializeMedia = () => {
    let navigatorVar: any = navigator;
    if (!('mediaDevices' in navigator)) {
      navigatorVar.mediaDevices = {};
    }
  
    if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        var getUserMedia = navigatorVar.webkitGetUserMedia || navigatorVar.mozGetUserMedia;
  
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented!'));
        }
  
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      }
    }
  
    var videoPlayer: any = document.querySelector('#player');
    // var canvasElement = document.querySelector('#canvas');
    var cameraDeviceIds: any = [];
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
      devices.forEach(function (device) {
          if (device.kind === 'videoinput') {
              cameraDeviceIds.push(device.deviceId)
          }
      })

      // console.log('cameraDeviceIds =====> ', cameraDeviceIds[0], cameraDeviceIds[1], cameraDeviceIds[2], cameraDeviceIds[3]);
      navigator.mediaDevices.getUserMedia({video: { deviceId: { exact: cameraDeviceIds[2] } }})
        .then(function(stream) {
          videoPlayer.srcObject = stream;
          videoPlayer.style.display = 'block';
          setInitializeDone(true);
        })
        .catch(function(err) {
          // imagePickerArea.style.display = 'block';
          console.log('err =======> ', err);
        });

    })
  }

  const captureImage = () => {
    var videoPlayer: any = document.querySelector('#player');
    var canvasElement: any = document.querySelector('#canvas');
    
    var context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0);
    console.log('image data ======> ', context.getImageData(0, 0, canvasElement.width, canvasElement.height));


    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
 
    const qrcode = new Decoder();
    // console.log('data url =======> ', canvasElement.toDataURL("image/jpeg"));
    const qrcodeData = qrcode.decode(imageData.data, imageData.width, imageData.height);
    console.log('test ========> ', qrcodeData);
    if (qrcodeData !== undefined) {
      setShow(false);
      alert(qrcodeData.data);
    }
  }

  return (
    <Modal show={show}>
      <Modal.Header closeButton onClick={() => setShow(false)}>
        <Modal.Title>Modal title</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <video autoPlay id="player" />
        <canvas id="canvas" width="600" height="500" style={{ "visibility": "hidden", "position": "absolute" }} />
        <button onClick={captureImage}>Capture</button>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}
