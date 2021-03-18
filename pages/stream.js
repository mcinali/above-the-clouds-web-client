import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import Cookies from 'universal-cookie'
import Header from '../components/header'
const uuid = require('uuid')
import StreamInviteModal from '../components/streamInviteModal'
import NotificationsModal from '../components/notificationsModal'
import BroadcastModal from '../components/broadcastModal'
import ScheduleModal from '../components/scheduleModal'
import { createPictureURLFromArrayBufferString, setCookie } from '../utilities'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
const { hostname, sockethostname } = require('../config')
import { io } from 'socket.io-client'
const axios = require('axios')
const { connect, createLocalTracks } = require('twilio-video')

const Image = React.memo(function Image({ src }) {
  return <img src={createPictureURLFromArrayBufferString(src)} className={streamStyles.participantImage} />
})

export async function getServerSideProps({ req, res, query }) {
  try {
    // Authenticate accountId + token before serving page
    // Get accountId + token from cookies
    const cookie = new Cookies(req.headers.cookie)
    const accountId = cookie.cookies.accountId
    const token = cookie.cookies.token
    const session = (Boolean(cookie.cookies.session)) ? cookie.cookies.session : null
    // Add accountId as query param + token as header
    const url = hostname + `/auth/validate?accountId=${accountId}`
    const headers = {
      headers: {
        'token': token,
      }
    }
    // Check for valid token
    const promise = await axios.get(url, headers)
    if (promise.status != 200){
      res.writeHead(307, { Location: '/landing' }).end()
      return { props: {ok: false, reason: 'Access not permitted' } }
    }
    // Return streamId from query before serving page
    if (Object.keys(query).length==0){
      throw Error('bad query')
    }
    const streamId = query.streamId
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token, streamId: streamId, hostname: hostname, sockethostname: sockethostname, session: session } }
  } catch (error) {
    res.writeHead(307, { Location: '/discovery' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function Stream({ accountId, accessToken, streamId, hostname, sockethostname, session }){
  const [isActive, setIsActive] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showNewStreamModal, setNewStreamShowModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [handlePermission, setHandlePermission] = useState(true)

  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipants, setStreamParticipants] = useState([])
  const [room, setRoom] = useState({})

  // const [room, setRoom] = useState({})
  const [mute, setMute] = useState(false)
  const [volume, setVolume] = useState(0.0)

  const [date, setDate] = useState(new Date())
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    document.title = 'Above the Clouds'
    const socketConnection = io(sockethostname, {
      auth: {
        accountId: accountId,
        token: accessToken,
      },
      transports: ['websocket'],
      withCredentials: true,
    })
    setSocket(socketConnection)
    socketConnection.on('notification', (message) => {
      new Notification('Above the Clouds', {
        body: message,
        requireInteraction: true,
        silent: true,
      })
    })
  }, [])


  useEffect(() => {
    if (!Boolean(session)){
      const hrsToExpiration = 6
      setCookie('session', uuid.v4(), hrsToExpiration)
    }
  }, [])

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
    const result = `${hrs} : ${mins}`
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
           setIsActive(true)
           if (res.data){
             const streamParticipantData = res.data
             window.sessionStorage.setItem('streamParticipantId', streamParticipantData.streamParticipantId)
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
               window.sessionStorage.setItem('twilioRoomSID', room.sid)
               window.sessionStorage.setItem('twilioParticipantSID', room.localParticipant.sid)
               const player = document.getElementById('audio-controller')
               // setRoom(room)
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
                      // TO DO: Set document.title based to topic
                      // document.title = res.data.info.topic
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
           Router.push('/discovery')
         })
    return
  }, [])

  // Confirm leave stream
  function confirmLeaveStream(){
    try {
      const action = window.confirm('Are you sure you want to leave?')
      if (action){
        leaveStream()
        Router.push('/discovery')
      }
    } catch (error) {
      console.error(error)
      window.alert('Failed to leave stream')
    }
  }

  // Leave stream
  function leaveStream(){
    try {
      socket.disconnect()
      const url = hostname + `/stream/leave`
      const streamParticipantId = window.sessionStorage.getItem('streamParticipantId')
      const twilioRoomSID = window.sessionStorage.getItem('twilioRoomSID')
      const twilioParticipantSID = window.sessionStorage.getItem('twilioParticipantSID')
      const body = {
        accountId: accountId,
        streamId: streamId,
        streamParticipantId: streamParticipantId,
        twilioRoomSID: twilioRoomSID,
        twilioParticipantSID: twilioParticipantSID,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.post(url, body, headers)
           .then(res => {
             console.log(`User ${twilioParticipantSID} left room ${twilioRoomSID}`)
           })
           .catch(error => {
             console.error(error)
             throw new Error(error)
           })
    } catch (error) {
      console.error(error)
      throw new Error(error)
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
        const newStreamParticipants = [...streamParticipants]
        newStreamParticipants[index].following = true
        setStreamParticipants(newStreamParticipants)
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
        const newStreamParticipants = [...streamParticipants]
        newStreamParticipants[index].following = false
        setStreamParticipants(newStreamParticipants)
      })
      .catch(error => console.error(error))
  }

  useEffect(() => {
    console.log(streamParticipants)
  }, [streamParticipants])

  // Alert user before exiting page
  useEffect(() => {
    const active = window.sessionStorage.getItem('active')
    if (isActive){
      window.addEventListener('beforeunload', leaveStreamInBackground)
      window.addEventListener('popstate', leaveStreamInBackground)
      return () => {
        window.removeEventListener('beforeunload', leaveStreamInBackground)
        window.removeEventListener('popstate', leaveStreamInBackground)
      }
    }
  }, [isActive])

  const leaveStreamInBackground = (event) => {
    event.preventDefault()
    leaveStream()
    return event.returnValue = ''
  }


  return (
    <div className={commonStyles.container}>
      {StreamInviteModal(hostname, accountId, accessToken, streamId, showModal, setShowModal)}
      {NotificationsModal(showNotificationsModal, setShowNotificationsModal, setHandlePermission)}
      {BroadcastModal(hostname, accountId, accessToken, showBroadcastModal, setShowBroadcastModal)}
      {ScheduleModal(hostname, accountId, accessToken, showScheduleModal, setShowScheduleModal)}
      {Header(hostname, accountId, accessToken, true, null, setShowNotificationsModal, setShowBroadcastModal, setShowScheduleModal)}
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
            <div className={streamStyles.timeLabels}>{'hr : min'}</div>
          </div>
        </div>
        <div className={streamStyles.participantsContainer}>
          {streamParticipants.map((participant,index) =>
            <div key={index.toString()} className={streamStyles.participantContainer}>
              <div>
                <Image src={participant.profilePicture}/>
              </div>
              <div className={streamStyles.participantName}>{`${participant.firstname} ${participant.lastname}`}</div>
              <div className={streamStyles.participantUsername}>{`${participant.username}`}</div>
              {
                (participant.following==null) ?
                <div></div>
                :
                (participant.following) ?
                <button className={streamStyles.buttonUnfollow} onClick={function(){unfollow(participant, index)}}>Following</button>
                :
                <button className={streamStyles.buttonFollow} onClick={function(){follow(participant, index)}}>Follow</button>
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
          <button className={streamStyles.leaveStreamButton} onClick={function(){confirmLeaveStream()}}>Leave</button>
        </div>
      </div>
    </div>
  )
}
