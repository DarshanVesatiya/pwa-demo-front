import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

// import logo from "./logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

import Checkout from './components/Checkout';
import OrderList from './components/OrderList';
import ItemList from './components/ItemList';

let deferredPrompt: any;

function App() {
  const [installable, setInstallable] = useState(false);

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
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>
            <Link to="/">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-meta" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123-.118-.197a54.944 54.944 0 0 0-.53-.877l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3c.319 0 .625.039.924.122.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714Zm1.516 2.224c-.252-.41-.494-.787-.727-1.133L9 6.326c.845-1.305 1.543-1.954 2.372-1.954 1.723 0 3.102 2.537 3.102 5.653 0 1.188-.39 1.877-1.195 1.877-.773 0-1.142-.51-2.61-2.87l-.937-1.565ZM4.846 4.756c.725.1 1.385.634 2.34 2.001A212.13 212.13 0 0 0 5.551 9.3c-1.357 2.126-1.826 2.603-2.581 2.603-.777 0-1.24-.682-1.24-1.9 0-2.602 1.298-5.264 2.846-5.264.091 0 .181.006.27.018Z"/>
              </svg>
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
      </Navbar>
      
      <Switch>
        <Route path="/checkout">
          <Checkout />
        </Route>
        <Route path="/order-list">
          <OrderList />
        </Route>
        <Route path="/">
          <ItemList />
        </Route>
      </Switch>

      {installable &&
        <button className="install-button" onClick={handleInstallClick}>
          INSTALL ME
        </button>
      }

      <button className="install-button" onClick={askForNotificationPermission}>
        ASK NOTIFICATION
      </button>

    </div>
    </BrowserRouter>
  );
}

export default App;
