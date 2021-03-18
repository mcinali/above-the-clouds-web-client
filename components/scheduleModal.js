import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import { createPictureURLFromArrayBufferString } from '../utilities'
import modalStyles from '../styles/Modal.module.css'
import userStyles from '../styles/Users.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={userStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function ScheduleModal(hostname, accountId, accessToken, showModal, setShowModal){
  const [displayModal, setDisplayModal] = useState({'display':'none'})

  useEffect(() => {
    if (showModal){
      setDisplayModal({'display':'block'})
    } else {
      setDisplayModal({'display':'none'})
    }
  }, [showModal])

  function closeModal(){
    try {
      setShowModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={modalStyles.background} style={displayModal}></div>
      <div className={modalStyles.modal} style={displayModal}>
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
