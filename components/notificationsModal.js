import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import modalStyles from '../styles/Modal.module.css'
import notificationPermissionsStyles from '../styles/NotificationPermissions.module.css'
import notificationsModalStyles from '../styles/NotificationsModal.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'

const Image = React.memo(function Image({ src }) {
  return <img className={menuGuideStyles.image} src={src}/>
})

export default function NotificationsModal(showNotificationsModal, setShowNotificationsModal, setHandlePermission) {
  const [displayNotificationsModal, setDisplayNotificationsModal] = useState({'display':'none'})
  const [index, setIndex] = useState(1)
  const [prompt, setPrompt] = useState(true)

  useEffect(() => {
    if (prompt){
      const divElment = document.getElementById('notificationPermissions')
      if (Notification.permission=='denied' || Notification.permission=='default'){
        setIndex(1)
      } else {
        setIndex(2)
      }
      setPrompt(false)
    }
  }, [prompt])

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
          setPrompt(true)
          setHandlePermission(true)
        })
      } else {
        Notification.requestPermission(function(permission) {
          setPrompt(true)
          setHandlePermission(true)
        });
      }
    }
  }

  useEffect(() => {
    if (showNotificationsModal){
      setDisplayNotificationsModal({'display':'block'})
    } else {
      setDisplayNotificationsModal({'display':'none'})
    }
  }, [showNotificationsModal])

  function closeModal(){
    try {
      setShowNotificationsModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={modalStyles.background} style={displayNotificationsModal}></div>
      <div className={modalStyles.modal} style={displayNotificationsModal}>
        {(index==1) ?
          <div>
            <div className={modalStyles.title}>
              Enable <a>Desktop Notifications</a>
            </div>
            <div className={modalStyles.subtitle}>
              Help us provide you the best experience while you hang out.
            </div>
            <div className={notificationsModalStyles.enableNotificationsButtonContainer}>
              <button className={notificationsModalStyles.buttonBig} onClick={function(){askNotificationPermission()}}>Enable Notifications</button>
            </div>
            <div className={notificationsModalStyles.description1}>
              <ul>
                <li>Desktop notifications will only be enabled for <b>https://www.abovethecloudsapp.com</b></li>
                <li>You will only receive notifications when: someone you follow comes online, someone you follow creates a stream, or you are invited to a stream</li>
              </ul>
            </div>
          </div>
        :
          <div>
            <div className={modalStyles.title}>
              <a>Desktop Notifications</a> are enabled!
            </div>
            <br></br>
            <br></br>
            <br></br>
            <div className={notificationsModalStyles.description2}>
              <div><b>Mac Users:</b></div>
              <div>Make sure notifications are enabled for your browser in System Preferences</div>
              <br></br>
              <div><b>Windows Users: </b></div>
              <div>Make sure notifications are enabled for your browser in Control Panel</div>
            </div>
          </div>
        }
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
