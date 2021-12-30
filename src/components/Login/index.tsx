import React from 'react'

import { addMobileInfo, getNotificationInfo, deleteNotificationInfo } from '../../utility';
import { useAppDispatch } from "../../redux/hooks";
import { updateInfo } from "../../redux/userSlice";

const Login = () => {
  const dispatch = useAppDispatch();
  // getNotificationInfo().then((data) => {
  //   console.log('data ========> ', data);
  // });
  const registerUser = (e: React.FormEvent) => {
    e.preventDefault();
    var formElement = document.getElementById("myform_id") as any;
    if (
      formElement.elements['mobileNumber'].value === '' ||
      formElement.elements['firstName'].value === '' ||
      formElement.elements['lastName'].value === ''
    ) {
      // show error
    } else {
      let userData = {
        mobileNumber: formElement.elements['mobileNumber'].value,
        firstName: formElement.elements['firstName'].value,
        lastName: formElement.elements['lastName'].value
      };

      // add user data
      fetch('http://localhost:8080/v1/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      }).
      then((response) => response.json())
      .then((...data: any) => {
        if (data[0].Status === 'failure') {
          // show error
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
              fetch(`http://localhost:8080/v1/${data[0].Data._id}notification`, {
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
    }
  }

  return (
    <div className="wrapper fadeInDown">
      <div id="formContent">
        {/* <div className=fadeIn first">
          <img src="http://danielzawadzki.com/codepen/01/icon.svg" id="icon" alt="User Icon" />
        </div> */}

        <form onSubmit={registerUser} id="myform_id">
          <input type="text" className="fadeIn second" name="mobileNumber" placeholder="Mobile Number" />
          <input type="text" className="fadeIn third" name="firstName" placeholder="First Name" />
          <input type="text" className="fadeIn third" name="lastName" placeholder="Last Name" />
          <input type="submit" className="fadeIn fourth" value="Register" />
        </form>

        {/* <div id="formFooter">
          <a className="underlineHover" href="#">Forgot Password?</a>
        </div> */}

      </div>
    </div>
  )
};

export default Login;
