import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import { createPictureURLFromArrayBufferString } from '../utilities'
import modalStyles from '../styles/Modal.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import scheduleStyles from '../styles/Schedule.module.css'
const axios = require('axios')
const { futureStreams } = require('../data/futureStreams')

const Image = React.memo(function Image({ src }) {
  return <img className={userStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function ScheduleModal(hostname, accountId, accessToken, showModal, setShowModal, setNewStreamShowModal){
  const [displayModal, setDisplayModal] = useState({'display':'none'})
  const [scheduledStreams, setScheduledStreams] = useState([])

  useEffect(() => {
    if (showModal){
      setDisplayModal({'display':'block'})
    } else {
      setDisplayModal({'display':'none'})
    }
  }, [showModal])

  useEffect(() => {
    setScheduledStreams(futureStreams)
  }, [futureStreams])

  useEffect(() => {
    scheduledStreams.map((scheduledStream, index) => {
      console.log(scheduledStream)
    })
  }, [scheduledStreams])

  function scheduleStream(){
    try {
      setShowModal(false)
      setNewStreamShowModal(true)
    } catch (error) {
      console.error(error)
    }
  }

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
        <div className={discoveryStyles.newStreamContainer}>
          <button className={discoveryStyles.newStreamButton}>Schedule Room+</button>
        </div>
        <div className={scheduleStyles.container}>
          <div className={scheduleStyles.day}>Wednesday, March 24th</div>
          {scheduledStreams.map((scheduledStream, index) => {
            return (
              <div key={index.toString()} className={scheduleStyles.scheduleContainer}>
                <div className={scheduleStyles.scheduledStreamTitle}>
                  {scheduledStream.parsedTOD + ' - ' + scheduledStream.topic}
                </div>
                <div className={scheduleStyles.scheduledStreamOrganizer}>
                  {`Organizer:  ${scheduledStream.creator.firstname} ${scheduledStream.creator.lastname}`}
                </div>
                <div className={scheduleStyles.scheduledStreamInterest}>
                  {'Interest: '}
                  {scheduledStream.interest.map((account, index2) => {
                    return (
                      <div key={index2.toString()}>{`${account.firstname} ${account.lastname}`}</div>
                    )
                  })}
                </div>
                <button className={scheduleStyles.notificationButton}>Notify Me</button>
              </div>
            )
          })}
        </div>
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
