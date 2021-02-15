import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Router from "next/router"
import { createPictureURLFromArrayBufferString } from '../utilities'
import discoveryStreamsStyles from '../styles/DiscoveryStreams.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function DiscoveryStreams(accountId) {
  const [streams, setStreams] = useState([])
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000)
    return function cleanup() {
      clearInterval(timerId)
    }
  })

  function tick() {
    setDate(new Date())
  }

  function calcElapsedTime(startTime){
    const start = new Date(startTime)
    const dateDiff = date - start
    // const days = (parseInt(dateDiff / (24*60*60*1000))).toString().padStart(2, '0')
    const hrs = (parseInt(dateDiff / (60*60*1000)) % 24).toString().padStart(2, '0')
    const mins = (parseInt(dateDiff / (60*1000)) % (60)).toString().padStart(2, '0')
    const secs = (parseInt(dateDiff / (1000)) % (60)).toString().padStart(2, '0')
    const result = `${hrs} : ${mins} :  ${secs}`
    return result
  }

  useEffect(() => {
    axios.get(hostname+`/discovery/${accountId}`)
         .then(res => {
           console.log(res.data)
           setStreams(res.data)
         })
         .catch(error => {
           console.error(error)
         })
    return
  }, [])

  function joinStream(streamInfo){
    try {
      Router.push(
        {pathname: "/stream",
        query: {streamId: streamInfo.streamId}
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div id="cardList" className={discoveryStreamsStyles.cardList}>
        <div id="cardContainer">
          {streams.map((stream, index) =>
            <div id="card" key={index.toString()} className={discoveryStreamsStyles.card}>
              <div className={discoveryStreamsStyles.speakerAccessibilityContainer}>
                <div className={discoveryStreamsStyles.speakerAccessibilitySubContainer}>{(stream.inviteOnly) ? 'Invite-Only' : ''}</div>
              </div>
              <div className={discoveryStreamsStyles.topicContainer}>
                <a className={discoveryStreamsStyles.topicText}>{stream.topic}</a>
              </div>
              <div className={discoveryStreamsStyles.timeContainer}>
                <div className={discoveryStreamsStyles.timeSubContainer}>
                  <div className={discoveryStreamsStyles.time}>{calcElapsedTime(stream.startTime)}</div>
                  <div className={discoveryStreamsStyles.timeLabels}>{'hr : min : sec'}</div>
                </div>
              </div>
              <div className={discoveryStreamsStyles.participantsContainer}>
                {stream.participants.details.map((participant,index) =>
                  <div key={index.toString()} className={discoveryStreamsStyles.participantContainer}>
                    <div>
                      <img className={discoveryStreamsStyles.image} src={createPictureURLFromArrayBufferString(participant.profilePicture)}/>
                    </div>
                    <div className={discoveryStreamsStyles.participantName}>{`${participant.firstname} ${participant.lastname}`}</div>
                    <div className={discoveryStreamsStyles.participantUsername}>{`${participant.username}`}</div>
                  </div>
                )}
              </div>
              <div className={discoveryStreamsStyles.cardButtonContainer}>
                <button className={discoveryStreamsStyles.cardButton} onClick={function(){joinStream(stream)}}>Join</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
