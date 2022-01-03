import { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

import logo from "./logo.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

import Login from './components/Login';
import Checkout from './components/Checkout';
import OrderList from './components/OrderList';
import ItemList from './components/ItemList';

import { getCartItems, getMobileInfo, addNotificationInfo } from './utility';
import { useAppSelector, useAppDispatch } from "./redux/hooks";
import { addList } from "./redux/itemSlice";
import { initializeCart, resetCart, getCartCount, updateAddress } from "./redux/cartSlice";
import { updateInfo } from "./redux/userSlice";
import { urlBase64ToUint8Array } from "./utility";

let deferredPrompt: any;

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [showInstallVersion, setShowInstallVersion] = useState(false);
  const mobileNumber = useAppSelector((state) => state.user.mobileNumber);
  const userId = useAppSelector((state) => state.user._id);
  const rootState = useAppSelector((state) => state);

  const [installable, setInstallable] = useState(false);
  const [isNotyDisable, setIsNotyDisable] = useState(false);
  const channel = new BroadcastChannel('sw-messages');
  channel.addEventListener('message', event => {
     dispatch(resetCart());
    //  if (localStorage.getItem('orderplaced') !== null) {
    //   localStorage.removeItem('orderplaced');
    //   toast.success('Order Placed Successfully');
    //  }
  });
  

  useEffect(() => {
    fetchList();
    getUser();
    const search = window.location.search;
    const address = (new URLSearchParams(search)).get("address");
    if (address !== null) {
      dispatch(updateAddress({ address }));
      toast.success('Address added for delivery');
    }

    navigator.serviceWorker.getRegistration().then((registration: any) => {
      // setRegistrationConst(registration);
      // if (registration) { // if there is a SW active
      // console.log('registration =========> ', registration);
        if (!registration) return;
        if (registration.waiting) return setShowInstallVersion(true);
        if (registration.installing) updateStateMessage(registration);
        registration.addEventListener('updatefound', () => setShowInstallVersion(true));

        function updateStateMessage(reg: any) {
          reg.installing.addEventListener('statechange', function (event: any) {
              // console.log('event ========> ', event, registration.installed);
              if (registration.installed) setShowInstallVersion(true);
          });
        }
      // }
    });

    var refreshing: boolean = false;
    navigator.serviceWorker.addEventListener('controllerchange',
        function () {
          console.log('controller changes');
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        }
    );
  }, []);

  const getSubscription = (id: any) => {
    fetch(`http://localhost:8080/v1/user/${id}/subscription`)
      .then((response) => response.json())
      .then((...data: any) => {
        if (data[0].Data['userId']) {
          setIsNotyDisable(true);
        }
      })
      .catch(() => {
        console.info('Error at getting subscription!');
      })
  };

  const getUser = () => {
    try {
      getMobileInfo().then((userData) => {
        if (userData !== undefined) {
          getSubscription(userData._id);
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
      fetch('http://localhost:8080/v1/items')
        .then((response) => response.json())
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
            } else {
              dispatch(initializeCart({
                items: [],
                totalAmount: 0
              }))
            }
          }).catch(() => {
            dispatch(initializeCart({
              items: [],
              totalAmount: 0
            }))
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
  }, []);

  const displayConfirmNotification = () => {
    if ('serviceWorker' in navigator) {
      const options = {
        body: 'You successfully subscribed to our Notification service!',
        icon: '/public/logo96x96.png',
        image: '/public/logo192.png',
        // dir: 'ltr',
        lang: 'en-US', // BCP 47,
        vibrate: [100, 50, 200],
        badge: '/public/logo96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        actions: [
          { action: 'confirm', title: 'Okay', icon: '/public/logo96x96.png' },
          { action: 'cancel', title: 'Cancel', icon: '/public/logo96x96.png' }
        ]
      };
  
      navigator.serviceWorker.ready
        .then((swreg) => {
          swreg.showNotification('Successfully subscribed (from SW)!', options);
        });
    }
  };

  const configurePushSub = () => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let reg: any;
    let newSubFlag: boolean = false;
    navigator.serviceWorker.ready
      .then((swreg) => {
        reg = swreg;
        return swreg.pushManager.getSubscription()
      })
      .then((sub) => {
        if (!sub) {
          //create new
          const validPublicKey = 'BA4KEhAQHmniaFUR7cfOq7A8QHWcjDE1qf-G1p2tJHoPwjFibkA0sHUcn0Vm3N1zppU8mqhDnFS_dKJF69nLFeo';
          const convertedPublicKey = urlBase64ToUint8Array(validPublicKey);
          newSubFlag = true;
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedPublicKey
          })
        } else {
          return sub;
        }
      })
      .then((newSub) => {
        if (newSubFlag) {
          fetch(`http://localhost:8080/v1/user/${userId}/subscription`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(newSub)
          })
          .then((res) => res.json())
          .then((...data: any) => {
            if (data[0].Status === 'failure') {
              // show error and add notification data into indexDB
              addNotificationInfo({ Index: '1', info: JSON.stringify(newSub) });
            } else {
              // show success toast
              setIsNotyDisable(true);
              displayConfirmNotification();
            }
          })
          .catch((err) => {
            console.info(err);
          })
        }
      });
  };

  const askForNotificationPermission = () => {
    Notification.requestPermission(function(result) {
      console.log('User Choice', result);
      if (result !== 'granted') {
        console.log('No notification permission granted!');
      } else {
        // displayConfirmNotification();
        configurePushSub();
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

  const installServiceWorker = () => {
    setShowInstallVersion(false);
    navigator.serviceWorker.getRegistration().then((registration: any) => {
      if (registration !== null) {
        registration.waiting.postMessage('SKIP_WAITING');
      }
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
                      <Link to="/checkout">Cart{getCartCount(rootState)}</Link>
                    </Nav.Link>
                    <Nav.Link>
                      <Link to={`/${userId}/order-list`}>Order List</Link>
                    </Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar> : <></>}
            <Switch>
              <Route path="/checkout" render={() => mobileNumber !== '' ? <Checkout /> : <Login />} />
              <Route path={'/:userId/order-list'} render={() => mobileNumber !== '' ? <OrderList /> : <Login />} />
              <Route path="/" render={() => mobileNumber !== '' ? <ItemList /> : <Login />} />
            </Switch>

            {installable &&
              <button className="install-button" onClick={handleInstallClick}>
                Install me
              </button>
            }

            <button className="install-button" disabled={isNotyDisable} onClick={askForNotificationPermission}>
              Enable notification
            </button>

            {showInstallVersion ? (
              <button className="install-button" onClick={installServiceWorker}>
                New Update Found in App are you want to install
              </button>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

export default App;
