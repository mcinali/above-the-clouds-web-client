import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from "next/router"
import Cookies from 'universal-cookie'
import Header from '../components/header'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
import { hostname } from '../config'
import axios from 'axios'
import socketIOClient from "socket.io-client"

export default function Stream(){
  const [isLoading, setIsLoading] = useState(false)
  const [streamIsActive, setStreamIsActive] = useState(false)
  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipantInfo, setStreamParticipantInfo] = useState({})

  const router = useRouter()
  const streamId = router.query.streamId

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')

  // const [recording, setRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioContext, setAudioContext] = useState(null)
  // var audioContext = null
  // // Receive audio stream from backend
  // function startListening(){
  //   console.log("Starting to listen...")
  //   if (!audioContext){
  //
  //     console.log(context)
  //     setAudioContext(context)
  //   }
  // }
  const chunks = []

  function playAudio(data){
    if (audioContext){
      audioContext.decodeAudioData(data, function(buffer) {
        const bufferSource = audioContext.createBufferSource()
        bufferSource.buffer = buffer
        // console.log(audioContext.destination)
        bufferSource.connect(audioContext.destination)
        // auto play
        bufferSource.start(0)
      })
    }
  }

  const socketURL = 'http://0.0.0.0:4200'
  const socket = socketIOClient(socketURL)
  socket.on('listen', data => {
    playAudio(data)
  })

  // setup audo stream to backend
  useEffect(async () => {
    if (audioContext && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
     navigator.mediaDevices.getUserMedia ({ audio: true })
        // Success callback
        .then(function(stream) {
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorder.start(2000)
          mediaRecorder.ondataavailable = function(event) {
            socket.emit('talk', event.data)
          }
          setMediaRecorder(mediaRecorder)
        })
        // Error callback
        .catch(function(err) {
           console.log('The following getUserMedia error occurred: ' + err);
        }
       )
    } else {
       console.log('getUserMedia not supported on your browser!');
    }
  }, [audioContext])
  // }

  // console.log('Media Recorder', mediaRecorder)

  // useEffect(() =>{
  //   if (mediaRecorder){
  //     mediaRecorder.start()
  //     console.log(mediaRecorder.state)
  //     console.log("recorder started")
  //     mediaRecorder.ondataavailable = function(e) {
  //       console.log(e.data)
  //     }
  //   }
  // }, [mediaRecorder])

  // useEffect(() => {
  //
  //   setIsLoading(true)
  //   const url = hostname + `/stream/join`
  //   const body = {
  //     streamId: streamId,
  //     accountId: accountId,
  //   }
  //   axios.post(url, body)
  //        .then(res => {
  //          if (res.data){
  //            const streamParticipantData = res.data
  //            setStreamParticipantInfo(res.data)
  //            setStreamIsActive(true)
  //            const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
  //            axios.get(streamURL)
  //                 .then(res => {
  //                   if (res.data) {
  //                     setStreamInfo(res.data)
  //                     setIsLoading(false)
  //                   }
  //                 })
  //                 .catch(error => {
  //                   window.alert('Failed to join stream')
  //                   leaveStream(streamParticipantData)
  //                   console.error(error)
  //                   setIsLoading(false)
  //                 })
  //          }
  //        })
  //        .catch(error => {
  //          window.alert('Failed to join stream')
  //          console.error(error)
  //          setIsLoading(false)
  //          Router.push('/discovery')
  //        })
  //   return
  // }, [])

  // // Leave page
  // function leaveStream(streamParticipant){
  //   setIsLoading(true)
  //   const url = hostname + `/stream/leave`
  //   const body = {
  //     streamParticipantId: streamParticipant.streamParticipantId,
  //   }
  //   axios.post(url, body)
  //        .then(res => {
  //          setIsLoading(false)
  //        })
  //        .catch(error => {
  //          console.error(error)
  //          window.alert('Failed to leave stream')
  //          setIsLoading(false)
  //        })
  // }
  //
  // // Confirm leave page
  // function confirmLeaveStream(streamParticipant){
  //   setIsLoading(true)
  //   const action = window.confirm('Are you sure you want to leave?')
  //   if (action) {
  //     leaveStream(streamParticipantInfo)
  //     setStreamIsActive(false)
  //     Router.push('/discovery')
  //   } else {
  //     setIsLoading(false)
  //     return
  //   }
  // }
  //
  // // Leave stream on navigation away from page (within app)
  // useEffect(() => {
  //   return () => {
  //     if (streamIsActive) {
  //       leaveStream(streamParticipantInfo)
  //     }
  //   }
  // }, [streamIsActive, streamParticipantInfo])
  //
  // // Leave stream on navigation away from page (e.g. close tab, navigate to different host, etc)
  // useEffect(() => {
  //   window.addEventListener('beforeunload', alertUser)
  //   window.addEventListener('unload', endStreamForUser)
  //   return () => {
  //     if (streamIsActive){
  //       window.removeEventListener('beforeunload', alertUser)
  //       window.removeEventListener('unload', endStreamForUser)
  //     }
  //   }
  // }, [streamIsActive, streamParticipantInfo])
  //
  // const alertUser = e => {
  //   e.preventDefault()
  //   e.returnValue = ''
  // }
  //
  // const endStreamForUser = function(){
  //   leaveStream(streamParticipantInfo)
  // }


  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
        <div>Hello World!</div>
        <button onClick={function(){setAudioContext(new AudioContext())}}>Listen</button>
        <button className={streamStyles.leaveStreamButton} onClick={function(){confirmLeaveStream(streamParticipantInfo)}}>Leave</button>
      </div>
    </div>
  )
}
