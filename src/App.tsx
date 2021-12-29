import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import logo from "./logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

import Login from './components/Login';
import Checkout from './components/Checkout';
import OrderList from './components/OrderList';
import ItemList from './components/ItemList';

import { getCartItems, getMobileInfo } from './utility';
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { addList } from "./redux/itemSlice";
import { initializeCart } from "./redux/cartSlice";
import { updateInfo } from "./redux/userSlice";
import { getSuggestedQuery } from "@testing-library/react";

let deferredPrompt: any;

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const mobileNumber = useAppSelector((state) => state.user.mobileNumber);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    fetchList();
    getUser();
  }, []);

  const getUser = () => {
    try {
      getMobileInfo().then((userData) => {
        console.log('userData ======> ', userData);
        if (userData !== undefined) {
          dispatch(updateInfo(userData));
        } else {
          dispatch(updateInfo({
            _id: '',
            firstName: '',
            lastName: '',
            mobileNumber: '',
          }));
        }
        setLoading(false);
      });
    } catch (error) {
      
    }
  };

  const fetchList = () => {
    try {
      fetch('http://localhost:8080/v1/items').
      then((response) => response.json())
      .then((...data: any) => {
        dispatch(addList({items: data[0].Data}));
        let items: any = [];
        let totalAmount = 0;
        getCartItems().then((data) => {
          if(data.length) {
            data.forEach((item) => {
              items.push(item);
              totalAmount += (item.qty * item.price);
            });
            dispatch(initializeCart({
              items,
              totalAmount
            }))
          }
        });
      })
      .catch();
    } catch (error) {
      
    }
  }

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      deferredPrompt = e;
      // Update UI notify the user they can install the PWA
      setInstallable(true);
    });

    window.addEventListener('appinstalled', () => {
      // Log install to analytics
      console.log('INSTALL: Success');
    });
    initializeMedia();
  }, []);

  const askForNotificationPermission = () => {
    Notification.requestPermission(function(result) {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else if ('serviceWorker' in navigator) {
          const options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            // dir: 'ltr',
            lang: 'en-US', // BCP 47,
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            // actions: [
            //   { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
            //   { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
            // ]
          };
      
          navigator.serviceWorker.ready
            .then(function(swreg) {
              swreg.showNotification('Successfully subscribed (from SW)!', options);
            });
      }
    });
  }

  const handleInstallClick = (e: any) => {
    // Hide the app provided install promotion
    setInstallable(false);
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    });
  };

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

    navigator.mediaDevices.getUserMedia({video: true})
      .then(function(stream) {
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
      })
      .catch(function(err) {
        // imagePickerArea.style.display = 'block';
      });
  }

  return (
    <BrowserRouter>
      <div className="">
        {loading ? (
          <>Loading...</>
        ) : (
          <>
            {mobileNumber !== '' ? <Navbar bg="light" expand="lg" className="margin-bottom">
              <Container>
                <Navbar.Brand>
                  <Link to="/">
                    <img src={logo} className="logo" alt="logo" width="60" />
                  </Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link>
                      <Link to="/checkout">Cart</Link>
                    </Nav.Link>
                    <Nav.Link>
                      <Link to="/order-list">Order List</Link>
                    </Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar> : <></>}
            
            <Switch>
              <Route path="/checkout" render={() => mobileNumber !== '' ? <Checkout /> : <Login />} />
              <Route path="/order-list" render={() => mobileNumber !== '' ? <OrderList /> : <Login />} />
              <Route path="/" render={() => mobileNumber !== '' ? <ItemList /> : <Login />} />
            </Switch>

            {installable &&
              <button className="install-button" onClick={handleInstallClick}>
                INSTALL ME
              </button>
            }

            <button className="install-button" onClick={askForNotificationPermission}>
              ASK NOTIFICATION
            </button>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
