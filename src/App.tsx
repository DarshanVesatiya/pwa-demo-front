import { useEffect, useState } from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

import logo from "./logo.png";
import cartLogo from './iconmonstr-shopping-cart-thin.svg';
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
import { Button } from "react-bootstrap";

let deferredPrompt: any;

function App() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [showInstallVersion, setShowInstallVersion] = useState(false);
  const cartInfo = useAppSelector((state) => state.cart);
  const mobileNumber = useAppSelector((state) => state.user.mobileNumber);
  const userId = useAppSelector((state) => state.user._id);
  const rootState = useAppSelector((state) => state);


  const [installable, setInstallable] = useState(false);
  const [isNotyDisable, setIsNotyDisable] = useState(false);

  // window.addEventListener('offline', function() {
  //   alert('You have lost internet access!');
  // });
  
  // window.addEventListener('online', function() {
  //   alert('You have lost internet access!');
  // });

  try {
    const channel = new BroadcastChannel('sw-messages');
    channel.addEventListener('message', event => {
      // console.log('get message', localStorage.getItem('orderMesage'));
      // if (localStorage.getItem('orderMesage') !== null) {
      //   console.log('in');
      //   toast.success('Order Placed Successfully');
      //   localStorage.removeItem('orderMesage');
      // }

      dispatch(resetCart());
    });
  } catch (error) {
    console.log('error in brodcast ======> ', error);
  }

  useEffect(() => {
    fetchList();
    getUser();
    const search = window.location.search;
    const address = (new URLSearchParams(search)).get("address");
    if (address !== null) {
      dispatch(updateAddress({ address: address.replace(/_/g, ' ') }));
      // toast.success('Address added for delivery');
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

    // window.addEventListener('storage', (event) => {
    //   const data = window.localStorage.getItem("sw-messages");
    //   if (data !== null) {
    //     window.localStorage.removeItem("sw-messages");
    //     dispatch(resetCart());
    //     toast.success('Order Placed Successfully');
    //   }
    //  });
  }, []);

  const getSubscription = (id: any) => {
    fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/user/${id}/subscription`)
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
      fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/items`)
        .then((response) => response.json())
        .then((...data: any) => {
          dispatch(addList({ items: data[0].Data }));
          let items: any = [];
          let totalAmount = 0;
          getCartItems().then((data) => {
            if (data.length) {
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
          fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/user/${userId}/subscription`, {
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
    Notification.requestPermission(function (result) {
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
          <div className="loaderBox"><div className="loader"></div></div>
        ) : (
          <>
            {mobileNumber !== '' ? <Navbar collapseOnSelect expand="md" bg="light" variant="light" className="bg-white mb-4 shadow-sm">
              <Container>
                <Navbar.Brand href="#home">
                  <Link to="/">
                    <img src={logo} alt="logo" />
                  </Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse className="justify-content-end" id="responsive-navbar-nav">
                  <Nav>
                    <Nav.Link className="p-0 px-2">
                      <Link to="/checkout" className="position-relative">
                        <img src={cartLogo} alt="cart-logo" />
                        <div className="cartCount">{getCartCount(rootState)}</div>
                      </Link>
                    </Nav.Link>
                    <Nav.Link href={`/${userId}/order-list`} className="p-0 px-2">
                      Order List
                    </Nav.Link>
                    <div className="buttonBox">
                      {installable && <Button variant="primary" size="sm" className="border-0 mx-2" onClick={handleInstallClick}>
                        Install me
                      </Button>}
                      <Button variant="secondary" size="sm" className="border-0 mx-2" disabled={isNotyDisable} onClick={askForNotificationPermission}>
                        Enable notification
                      </Button>
                    </div>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar> : <></>}
            <Switch>
              <Route path="/checkout" render={() => mobileNumber !== '' ? <Checkout /> : <Login />} />
              <Route path={'/:userId/order-list'} render={() => mobileNumber !== '' ? <OrderList /> : <Login />} />
              <Route path="/" render={() => mobileNumber !== '' ? <ItemList /> : <Login />} />
            </Switch>
          </>
        )}
        {/* {showInstallVersion ? (
          <button className="install-button" onClick={installServiceWorker}>
            New Update Found in App are you want to install
          </button>
        ) : (
          <></>
        )} */}
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