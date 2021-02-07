import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import Image from 'next/image'
import StreamInviteModal from '../components/StreamInviteModal'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
const { hostname } = require('../config')
const axios = require('axios')
const { connect, createLocalTracks } = require('twilio-video')

export default function Stream(){
  const [showModal, setShowModal] = useState(false)
  const [streamParticipantInfo, setStreamParticipantInfo] = useState({})

  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipants, setStreamParticipants] = useState([])

  const [room, setRoom] = useState({})
  const [mute, setMute] = useState(false)
  const [volume, setVolume] = useState(0.0)

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
    const url = hostname + `/stream/join`
    const body = {
      streamId: parseInt(streamId, 10),
      accountId: parseInt(accountId, 10),
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
               const player = document.getElementById('audio-controller')
               setRoom(room)
               // Attach new Participant's Media to a <div> element.
               room.on('participantConnected', participant => {
                 const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
                 axios.get(streamURL)
                      .then(res => {
                        if (res.data) {
                          setStreamParticipants(res.data.participants)
                        }
                      })
                      .catch(error => {
                        console.error(error)
                      })
                 participant.tracks.forEach(publication => {
                 if (publication.isSubscribed) {
                   player.appendChild(publication.track.attach())
                 }
               })
               participant.on('trackSubscribed', track => {
                 player.appendChild(track.attach())
               })
              })
              // Attach existing Participants' Media to a <div> element.
              room.participants.forEach(participant => {
                participant.tracks.forEach(publication => {
                  if (publication.track) {
                    player.appendChild(publication.track.attach())
                  }
                })
                participant.on('trackSubscribed', track => {
                  player.appendChild(track.attach())
                })
              })
              // Update stream participants on participant disconnect
              room.on('participantDisconnected', participant => {
                const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
                axios.get(streamURL)
                     .then(res => {
                       if (res.data) {
                         setStreamParticipants(res.data.participants)
                       }
                     })
                     .catch(error => {
                       console.error(error)
                     })
              })
              // Print new dominant speaker in the room
              room.on('dominantSpeakerChanged', participant => {
                console.log('The new dominant speaker in the Room is:', participant)
              })
             const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
             axios.get(streamURL)
                  .then(res => {
                    if (res.data) {
                      setStreamInfo(res.data.info)
                      setStreamParticipants(res.data.participants)
                    }
                  })
                  .catch(error => {
                    window.alert('Failed to fetch stream details')
                    leaveStream(streamParticipantData)
                    console.error(error)
                  })
           })
         }})
         .catch(error => {
           window.alert('Failed to join stream')
           console.error(error)
           // Router.push('/discovery')
         })
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

  function muteLocalTracks(){
    if (mute) {
      room.localParticipant.audioTracks.forEach(publication => {
        publication.track.enable()
        setMute(false)
      })
    } else {
      room.localParticipant.audioTracks.forEach(publication => {
        publication.track.disable()
        setMute(true)
      })
    }
  }

  function adjustVolume(volume){
    const player = document.getElementById('audio-controller')
    player.volume = volume / 100
  }

  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
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
          <button className={streamStyles.muteButton} onClick={function(){muteLocalTracks()}}>
            { (mute) ? 'Unmute Mic' : 'Mute Mic'}
          </button>
          <audio id='audio-controller'></audio>
          <input id='vol-control' type='range' min='0' max='100' step='4' onInput={(event) => {adjustVolume(event.target.value)}} onChange={(event) => {adjustVolume(event.target.value)}}></input>
          <button className={streamStyles.inviteButton} onClick={function(){setShowModal(true)}}>Invite</button>
          <button className={streamStyles.leaveStreamButton} onClick={function(){leaveStream()}}>Leave</button>
        </div>
        {StreamInviteModal(accountId, streamId, streamParticipants, showModal, setShowModal)}
      </div>
    </div>
  )
}