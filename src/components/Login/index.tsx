import React, { useState } from 'react'
import { toast } from 'react-toastify';

import { addMobileInfo, getNotificationInfo, deleteNotificationInfo } from '../../utility';
import { useAppDispatch } from "../../redux/hooks";
import { updateInfo } from "../../redux/userSlice";
import logo from "../../logo.png";


const Login = () => {
  const dispatch = useAppDispatch();
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  // getNotificationInfo().then((data) => {
  //   console.log('data ========> ', data);
  // });
  const registerUser = (e: React.FormEvent) => {
    e.preventDefault();
    var formElement = document.getElementById("myform_id") as any;
    var phoneno = /^\d{10}$/;
    if (
      formElement.elements['mobileNumber'].value === '' ||
      formElement.elements['firstName'].value === '' ||
      formElement.elements['lastName'].value === ''
    ) {
      // show error
      toast.error('Please provide user details to register!');
    } else if (!formElement.elements['mobileNumber'].value.match(phoneno)) {
      toast.error('Please provide valid phone number!');
    } else {
      if (navigator.onLine) {
        let userData = {
          mobileNumber: formElement.elements['mobileNumber'].value,
          firstName: formElement.elements['firstName'].value,
          lastName: formElement.elements['lastName'].value
        };

        setOrderSubmitting(true);
        // add user data
        fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(userData)
        }).
        then((response) => response.json())
        .then((...data: any) => {
          setOrderSubmitting(false);
          if (data[0].Status === 'failure') {
            // show error
            toast.error('Something went wrong!');
          } else {
            dispatch(updateInfo({
              ...userData,
              _id: data[0].Data._id
            }));
            addMobileInfo({
              ...userData,
              _id: data[0].Data._id,
              userIndex: '1'
            });

            getNotificationInfo().then((data) => {
              // add notification data
              if (data !== undefined) {
                fetch(`${process.env.REACT_APP_API_ENDPOINT}v1/${data[0].Data._id}/notification`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify(data.info)
                }).
                then((response) => response.json())
                .then((...data: any) => {
                  if (data[0].Status === 'failure') {
                    // show error
                    toast.error('Something went wrong!');
                  } else {
                    deleteNotificationInfo();
                  }
                })
                .catch();
              }
            });
          }
        })
        .catch();
      } else {
        toast.error('Internet connection is required for registration!');
      }
    }
  }

  return (
    <div className="wrapper fadeInDown d-flex w-100 h-screen justify-content-center">

      <img className="mb-4" src={logo} alt="logo" />
      <div id="formContent" className='shadow p-5 mb-5 bg-body rounded-3 loginBox'>

        <form onSubmit={registerUser} id="myform_id" style={{ "textAlign": "center" }}>
          <input type="text" className="fadeIn second mb-2" name="mobileNumber" placeholder="Mobile Number" />
          <input type="text" className="fadeIn third mb-2" name="firstName" placeholder="First Name" />
          <input type="text" className="fadeIn third mb-2" name="lastName" placeholder="Last Name" />
            {orderSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>&nbsp;
              </>
            ) : <input type="submit" className="fadeIn fourth w-100" value="Register" />}
        </form>

        {/* <div id="formFooter">
          <a className="underlineHover" href="#">Forgot Password?</a>
        </div> */}

      </div>
    </div>
  )
};

export default Login;
