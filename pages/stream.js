import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from "next/router"
import Cookies from 'universal-cookie'
import Header from '../components/header'
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
const { hostname } = require('../config')
const axios = require('axios')
const { connect, createLocalTracks } = require('twilio-video')

export default function Stream(){
  const [isLoading, setIsLoading] = useState(false)
  const [streamParticipantInfo, setStreamParticipantInfo] = useState({})

  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipants, setStreamParticipants] = useState([])
  const [streamInvitees, setStreamInvitees] = useState([])
  const [streamEmailInvitees, setStreamEmailInvitees] = useState([])
  const [room, setRoom] = useState({})

  const router = useRouter()
  const streamId = router.query.streamId

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')

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

  // Join stream on page load
  useEffect(() => {
    setIsLoading(true)
    const url = hostname + `/stream/join`
    const body = {
      streamId: parseInt(streamId, 10),
      accountId: parseInt(accountId, 10),
    }
    // axios.post(url, body)
    //      .then(res => {
    //        if (res.data){
    //          const streamParticipantData = res.data
    //          setStreamParticipantInfo(res.data)
    //          createLocalTracks({
    //            audio: true,
    //            video: false
    //          }).then(localTracks => {
    //            return connect(streamParticipantData.twilioAccessToken, {
    //              name: streamParticipantData.streamId.toString(),
    //              tracks: localTracks
    //            })
    //          }).then(room => {
    //            console.log(`Connected to Room: ${room.name}`)
    //            setRoom(room)
    //            // Attach new Participant's Media to a <div> element.
    //            room.on('participantConnected', participant => {
    //              participant.tracks.forEach(publication => {
    //                if (publication.isSubscribed) {
    //                  const track = publication.track
    //                  document.getElementById('remote-media-div').appendChild(track.attach())
    //                }
    //              })
    //              participant.on('trackSubscribed', track => {
    //                document.getElementById('remote-media-div').appendChild(track.attach())
    //              })
    //           })
    //           // Attach existing Participants' Media to a <div> element.
    //           room.participants.forEach(participant => {
    //             participant.tracks.forEach(publication => {
    //               if (publication.track) {
    //                 document.getElementById('remote-media-div').appendChild(publication.track.attach())
    //               }
    //             })
    //
    //            participant.on('trackSubscribed', track => {
    //               document.getElementById('remote-media-div').appendChild(track.attach())
    //             })
    //           })
    //          })
             const streamURL = hostname + `/stream/${27}?accountId=${accountId}`
             axios.get(streamURL)
                  .then(res => {
                    if (res.data) {
                      setStreamInfo(res.data.info)
                      setStreamParticipants(res.data.participants)
                      setStreamInvitees(res.data.invitees)
                      setStreamEmailInvitees(res.data.emailOutreach)
                      setIsLoading(false)
                    }
                  })
                  .catch(error => {
                    window.alert('Failed to join stream')
                    leaveStream(streamParticipantData)
                    console.error(error)
                    setIsLoading(false)
                  })
         //   }
         // })
         // .catch(error => {
         //   window.alert('Failed to join stream')
         //   console.error(error)
         //   setIsLoading(false)
         //   Router.push('/discovery')
         // })
    return
  }, [])

  // Leave stream
  function leaveStream(){
    const action = window.confirm('Are you sure you want to leave?')
    if (action) {
      const url = hostname + `/stream/leave`
      const body = {
        streamParticipantId: streamParticipantInfo.streamParticipantId,
      }
      axios.post(url, body)
           .then(res => {
             room.disconnect()
             Router.push('/discovery')
           })
           .catch(error => {
             console.error(error)
             window.alert('Failed to leave stream')
           })
    }
  }


  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
        <div id='remote-media-div'></div>
        <div className={streamStyles.speakerAccessibilityContainer}>
          <a>{streamInfo.speakerAccessibility}</a>
        </div>
        <div className={streamStyles.topicContainer}>
          <div className={streamStyles.topicText}>{streamInfo.topic}</div>
        </div>
        <div className={streamStyles.timeContainer}>
          <div className={streamStyles.timeSubContainer}>
            <div className={streamStyles.time}>{calcElapsedTime(streamInfo.startTime)}</div>
            <div className={streamStyles.timeLabels}>{'hr : min : sec'}</div>
          </div>
        </div>
        <div className={streamStyles.participantsContainer}>
          {streamParticipants.map((participant,index) =>
            <div key={index.toString()} className={streamStyles.participantContainer}>
              <div>
                <Image src='/bitmoji.png' width='135' height='135' className={streamStyles.image} />
              </div>
              <div className={streamStyles.participantUsername}>{`${participant.username}`}</div>
              <div className={streamStyles.participantName}>{`(${participant.firstname} ${participant.lastnameInitial})`}</div>
            </div>
          )}
        </div>
        <div className={streamStyles.buttonContainer}>
          <button className={streamStyles.inviteButton}>Invite</button>
          <button className={streamStyles.leaveStreamButton} onClick={function(){leaveStream()}}>Leave</button>
        </div>
      </div>
    </div>
  )
}
