import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from "next/router"
import Cookies from 'universal-cookie'
import Header from '../components/header'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
const { hostname } = require('../config')
const axios = require('axios')
const { connect, createLocalTracks } = require('twilio-video')

export default function Stream(){
  const [isLoading, setIsLoading] = useState(false)
  const [streamIsActive, setStreamIsActive] = useState(false)
  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipantInfo, setStreamParticipantInfo] = useState({})
  const [room, setRoom] = useState({})

  const router = useRouter()
  const streamId = router.query.streamId

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')

  // Join stream on page load
  useEffect(() => {
    setIsLoading(true)
    const url = hostname + `/stream/join`
    const body = {
      streamId: streamId,
      accountId: accountId,
    }
    axios.post(url, body)
         .then(res => {
           if (res.data){
             const streamParticipantData = res.data
             setStreamParticipantInfo(res.data)
             createLocalTracks({
               audio: true,
               video: false
             }).then(localTracks => {
               return connect(streamParticipantData.twilioAccessToken, {
                 name: streamParticipantData.streamId.toString(),
                 tracks: localTracks
               })
             }).then(room => {
               console.log(`Connected to Room: ${room.name}`)
               setRoom(room)
               // Attach new Participant's Media to a <div> element.
               room.on('participantConnected', participant => {
                 participant.tracks.forEach(publication => {
                   if (publication.isSubscribed) {
                     const track = publication.track
                     document.getElementById('remote-media-div').appendChild(track.attach())
                   }
                 })
                 participant.on('trackSubscribed', track => {
                   document.getElementById('remote-media-div').appendChild(track.attach())
                 })
              })
              // Attach existing Participants' Media to a <div> element.
              room.participants.forEach(participant => {
                participant.tracks.forEach(publication => {
                  if (publication.track) {
                    document.getElementById('remote-media-div').appendChild(publication.track.attach())
                  }
                })

               participant.on('trackSubscribed', track => {
                  document.getElementById('remote-media-div').appendChild(track.attach())
                })
              })
             })
             setStreamIsActive(true)
             const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
             axios.get(streamURL)
                  .then(res => {
                    if (res.data) {
                      setStreamInfo(res.data)
                      setIsLoading(false)
                    }
                  })
                  .catch(error => {
                    window.alert('Failed to join stream')
                    leaveStream(streamParticipantData)
                    console.error(error)
                    setIsLoading(false)
                  })
           }
         })
         .catch(error => {
           window.alert('Failed to join stream')
           console.error(error)
           setIsLoading(false)
           Router.push('/discovery')
         })
    return
  }, [])

  // Leave page
  function leaveStream(streamParticipant){
    setIsLoading(true)
    const url = hostname + `/stream/leave`
    const body = {
      streamParticipantId: streamParticipant.streamParticipantId,
    }
    axios.post(url, body)
         .then(res => {
           room.disconnect()
           setIsLoading(false)
         })
         .catch(error => {
           console.error(error)
           window.alert('Failed to leave stream')
           setIsLoading(false)
         })
  }

  // Confirm leave page
  function confirmLeaveStream(streamParticipant){
    setIsLoading(true)
    const action = window.confirm('Are you sure you want to leave?')
    if (action) {
      leaveStream(streamParticipantInfo)
      setStreamIsActive(false)
      Router.push('/discovery')
    } else {
      setIsLoading(false)
      return
    }
  }

  // Leave stream on navigation away from page (within app)
  useEffect(() => {
    return () => {
      if (streamIsActive) {
        leaveStream(streamParticipantInfo)
      }
    }
  }, [streamIsActive, streamParticipantInfo])

  // Leave stream on navigation away from page (e.g. close tab, navigate to different host, etc)
  useEffect(() => {
    window.addEventListener('beforeunload', alertUser)
    window.addEventListener('unload', endStreamForUser)
    return () => {
      if (streamIsActive){
        window.removeEventListener('beforeunload', alertUser)
        window.removeEventListener('unload', endStreamForUser)
      }
    }
  }, [streamIsActive, streamParticipantInfo])

  const alertUser = e => {
    e.preventDefault()
    e.returnValue = ''
  }

  const endStreamForUser = function(){
    leaveStream(streamParticipantInfo)
  }


  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
        <div id='remote-media-div'>Hello World!</div>
        <button className={streamStyles.leaveStreamButton} onClick={function(){confirmLeaveStream(streamParticipantInfo)}}>Leave</button>
      </div>
    </div>
  )
}
