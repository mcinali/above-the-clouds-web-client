import React, { useState, useEffect } from 'react'
import notificationPermissionsStyles from '../styles/NotificationPermissions.module.css'

export default function NotificationPermissions(){
  const [handlePermission, setHandlePermission] = useState(true)

  useEffect(() => {
    if (handlePermission){
      const divElment = document.getElementById('notificationPermissions')
      if (Notification.permission=='denied' || Notification.permission=='default'){
        divElment.style.display = 'block'
      } else {
        divElment.style.display = 'none'
      }
      setHandlePermission(false)
    }
  }, [handlePermission])

  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch(e) {
      return false;
    }
    return true;
  }

  function askNotificationPermission(){
    if (!('Notification' in window)) {
      console.log("This browser does not support notifications.");
    } else {
      if(checkNotificationPromise()) {
        Notification.requestPermission()
        .then((permission) => {
          setHandlePermission(true)
        })
      } else {
        Notification.requestPermission(function(permission) {
          setHandlePermission(true)
        });
      }
    }
  }

  return (
    <div id='notificationPermissions' className={notificationPermissionsStyles.container}>
      <div className={notificationPermissionsStyles.content}>
        <div className={notificationPermissionsStyles.content}>
          <button className={notificationPermissionsStyles.button} onClick={function(){askNotificationPermission()}}>Enable Notifications</button>
          <div className={notificationPermissionsStyles.text}>This will only enable desktop notifications for https://www.abovethecloudsapp.com</div>
        </div>
      </div>
    </div>
  )
}
