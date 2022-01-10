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
// console.log('cameraId =========> ', cameraId);
  const setCamera = () => {
    var videoPlayer: any = document.querySelector('#player');
    var cameraLoader: any = document.querySelector('#cameraLoader');
    var errorInAccess: any = document.querySelector('#errorInAccess');
    const stream = videoPlayer?.srcObject;
    videoPlayer.style.display = 'none';
    cameraLoader.style.display = 'block';
    errorInAccess.style.display = 'none';
    videoPlayer.addEventListener('stop', () => { console.log('in') });
    if (stream !== undefined && stream !== null) {
      let streamArr = stream.getTracks();
      for(let i = 0; i < streamArr.length; i++) {
        streamArr[i].stop();
      }
      videoPlayer.srcObject = null;
    }
// console.log('in ========> ', cameraId);
    setTimeout(() => {
      navigator.mediaDevices.getUserMedia({video: { deviceId: { exact: cameraId } }})
      .then(function(stream) {
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
        cameraLoader.style.display = 'none';
        errorInAccess.style.display = 'none';
        videoPlayer.play();
        setInitializeDone(true);
      })
      .catch(function(err) {
        // imagePickerArea.style.display = 'block';
        // console.log('err =======> ', err);
        errorInAccess.style.display = 'block';
        cameraLoader.style.display = 'none';
        videoPlayer.style.display = 'none';
      });
    }, 1000);
    
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
    var backCameraId: any = null;
    var cameraObj: any = {};
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      devices.forEach(function (device, index) {
        if (device.kind === 'videoinput') {
          cameraDeviceIds.push(device.deviceId)
          cameraObj = { ...cameraObj, [device.deviceId]: device.label };
          if (device.label.indexOf("back") !== -1 && backCameraId === null) {
            backCameraId = device.deviceId;
          }
        }
        if(index + 1 === devices.length){
          setCameraId(backCameraId !== null ? backCameraId : cameraDeviceIds[0]);
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
    const qrcodeData = qrcode.decode(imageData.data, imageData.width, imageData.height);
    if (qrcodeData !== undefined && qrcodeData !== null) {
      const qrcodedataSplit = qrcodeData.data.split("?")
      if (Array.isArray(qrcodedataSplit) && qrcodedataSplit.length === 2) {
        const address = (new URLSearchParams(`?${qrcodedataSplit[1]}`)).get("address");
        if (address !== null) {
          dispatch(updateAddress({ address: address.replace(/_/g, ' ') }));
          setShow(false);
          toast.success('Address fetch successfully.');
        }
      } else {
        // error in getting address
        toast.error('Issue in address fetching!');
      }
    }
  }

  return (
    <Modal show={show} id="scanner-modal" onHide={() =>  {
      var videoPlayer: any = document.querySelector('#player');
        const stream = videoPlayer?.srcObject;
        if (stream !== undefined && stream !== null) {
          (stream.getTracks()).forEach(function(track: any) {
            track.stop();
          })
        }
        setShow(false);
    }}>
      <Modal.Header closeButton>
        <Modal.Title>Scan QR Code</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {Object.keys(cameraArr).length > 0 ? (
          <>
            <select className="w-100 mb-4" onChange={(event) => setCameraId(event.target.value)}>
              {Object.keys(cameraArr).map((key) => <option selected={key === cameraId} value={key}>{cameraArr[key]}</option>)}
            </select>
          </>
        ) : (
          <></>
        )}
        <video autoPlay id="player" />
        <div id="cameraLoader" className="loaderBox" style={{ "paddingTop": "130px" }}><div className="loader"></div></div>
        <div id="errorInAccess" className="loaderBox">Not Able to gain Access try with different camera from list or try after some time.</div>
        <canvas id="canvas" width="600" height="500" style={{ "visibility": "hidden", "position": "absolute", "top": "0px", "right": "0px" }} />
      </Modal.Body>
    </Modal>
  )
}
