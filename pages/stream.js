import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import Image from 'next/image'
import StreamInviteModal from '../components/StreamInviteModal'
import { createPictureURLFromArrayBufferString } from '../utilities'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
import followsStyles from '../styles/Follows.module.css'
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

  const [accountInfo, setAccountInfo] = useState({})
  const cookie = new Cookies()
  const accountId = cookie.get('accountId')
  const hasToken = cookie.get('hasToken')
  const accessToken = (hasToken) ? cookie.get('token') : null

  useEffect(() => {
    const url = hostname + `/account/${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        setAccountInfo(res.data)
      })
      .catch(error => console.error(error))
  }, [])

  const router = useRouter()
  const streamId = router.query.streamId

  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timerId = setInterval(() => tick(), 60000)
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
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
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
                 axios.get(streamURL, headers)
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
                axios.get(streamURL, headers)
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
             axios.get(streamURL, headers)
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
        accountId: accountId,
        streamId: streamId,
        streamParticipantId: streamParticipantInfo.streamParticipantId,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.post(url, body, headers)
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

  function follow(participant, index){
    const url = hostname + `/follows/follow`
    const body = {
      accountId: accountId,
      followingAccountId: participant.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newStreamParticipants = streamParticipants
        newStreamParticipants[index].following = true
        setSuggestions(newStreamParticipants)
      })
      .catch(error => console.error(error))
  }

  function unfollow(participant, index){
    const url = hostname + `/follows/unfollow`
    const body = {
      accountId: accountId,
      followingAccountId: participant.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newStreamParticipants = streamParticipants
        newStreamParticipants[index].following = false
        setSuggestions(newStreamParticipants)
      })
      .catch(error => console.error(error))
  }

  return (
    <div className={commonStyles.container}>
      {StreamInviteModal(accountId, accessToken, streamId, showModal, setShowModal)}
      {Header(accountInfo)}
      <div className={commonStyles.bodyContainer}>
        <div className={streamStyles.speakerAccessibilityContainer}>
          <a>{(streamInfo.inviteOnly) ? 'Invite-Only' : ''}</a>
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
                <img className={streamStyles.participantImage} src={createPictureURLFromArrayBufferString(participant.profilePicture)}/>
              </div>
              <div className={streamStyles.participantName}>{`${participant.firstname} ${participant.lastname}`}</div>
              <div className={streamStyles.participantUsername}>{`${participant.username}`}</div>
              {
                (participant.following==null) ?
                <div></div>
                :
                (participant.following) ?
                <button className={followsStyles.buttonUnfollow} onClick={function(){unfollow(participant, index)}}>Unfollow</button>
                :
                <button className={followsStyles.buttonFollow} onClick={function(){follow(participant, index)}}>Follow</button>
              }
            </div>
          )}
        </div>
        <div className={streamStyles.buttonContainer}>
          <button className={streamStyles.muteButton} onClick={function(){muteLocalTracks()}}>
            { (mute) ? 'Unmute Mic' : 'Mute Mic'}
          </button>
          <audio id='audio-controller'></audio>
          <button className={streamStyles.inviteButton} onClick={function(){setShowModal(true)}}>Invite</button>
          <button className={streamStyles.leaveStreamButton} onClick={function(){leaveStream()}}>Leave</button>
        </div>
      </div>
    </div>
  )
}
