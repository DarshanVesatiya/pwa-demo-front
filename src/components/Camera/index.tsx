import React, { useEffect, useState } from 'react'
import { Decoder } from '@nuintun/qrcode';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { useAppDispatch } from "../../redux/hooks";
import { updateAddress } from '../../redux/cartSlice';

export const Camera = ({ show, setShow }: { show: boolean, setShow: any }) => {
  const dispatch = useAppDispatch();

  const [initializeDone, setInitializeDone] = useState(false);
  const [cameraArr, setCameraArr] = useState<any>({});
  const [cameraId, setCameraId] = useState('');
  useEffect(() => {
    if (show) {
      initializeMedia();
    }
  }, [show]);

  useEffect(() => {
    if (initializeDone && show) {
      const timeout = setInterval(() => {
        // console.log('in timeout');
        captureImage();
      }, 1000);
  
      return () => clearInterval(timeout);
    }
  }, [initializeDone, show]);

  useEffect(() => {
    if(cameraId !== '') {
      setCamera();
    }
  }, [cameraId]);

  const setCamera = () => {
    var videoPlayer: any = document.querySelector('#player');
    navigator.mediaDevices.getUserMedia({video: { deviceId: { exact: cameraId } }})
    .then(function(stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
      setInitializeDone(true);
    })
    .catch(function(err) {
      // imagePickerArea.style.display = 'block';
      console.log('err =======> ', err);
    });
  }

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
  
    var cameraDeviceIds: any = [];
    var cameraObj: any = {};
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
      devices.forEach(function (device, index) {
        if (device.kind === 'videoinput') {
          cameraDeviceIds.push(device.deviceId)
          cameraObj = { ...cameraObj, [device.deviceId]: device.label };
        }
        if(index + 1 === devices.length){
          setCameraId(cameraDeviceIds[0]);
          setCameraArr(cameraObj);
        }
      });
    })
  }

  const captureImage = () => {
    var videoPlayer: any = document.querySelector('#player');
    var canvasElement: any = document.querySelector('#canvas');
    
    var context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0);
    const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
 
    const qrcode = new Decoder();
    // console.log('data url =======> ', canvasElement.toDataURL("image/jpeg"));
    const qrcodeData = qrcode.decode(imageData.data, imageData.width, imageData.height);
    if (qrcodeData !== undefined && qrcodeData !== null) {
      // console.log('qrcodeData =========> ', qrcodeData);
      const qrcodedataSplit = qrcodeData.data.split("?")
      // console.log('qrcodedataSplit ==========> ', qrcodedataSplit);
      if (Array.isArray(qrcodedataSplit) && qrcodedataSplit.length === 2) {
        const address = (new URLSearchParams(`?${qrcodedataSplit[1]}`)).get("address");
        // console.log('address ==========> ', address);
        if (address !== null) {
          dispatch(updateAddress({ address: address.replace(/_/g, ' ') }));
          setShow(false);
          toast.success('Address Fetch Successfully');
        }
      } else {
        // error in getting address
        toast.error('Address Fetch Successfully');
      }
    }
  }

  return (
    <Modal show={show} id="scanner-modal">
      <Modal.Header closeButton onClick={() => {
        var videoPlayer: any = document.querySelector('#player');
        const stream = videoPlayer.srcObject;
        (stream.getTracks()).forEach(function(track: any) {
          track.stop();
        })
        setShow(false);
      }}>
        <Modal.Title>Scan QR Code</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {Object.keys(cameraArr).length > 0 ? (
          <>
            <select className="w-100 mb-4"  onChange={(event) => setCameraId(event.target.value)}>
              {Object.keys(cameraArr).map((key) => <option value={key}>{cameraArr[key]}</option>)}
            </select>
          </>
        ) : (
          <></>
        )}
        <video autoPlay id="player" />
        <canvas id="canvas" width="600" height="500" style={{ "visibility": "hidden", "position": "absolute", "top": "0px", "right": "0px" }} />
        {/* <button onClick={captureImage}>Capture</button> */}
      </Modal.Body>

      {/* <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer> */}
    </Modal>
  )
}
