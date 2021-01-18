import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router, { useRouter } from "next/router"
import Cookies from 'universal-cookie'
import Header from '../components/header'
import commonStyles from '../styles/Common.module.css'
import streamStyles from '../styles/Stream.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Stream(){
  const [isLoading, setIsLoading] = useState(false)
  const [streamInfo, setStreamInfo] = useState({})
  const [streamParticipantInfo, setStreamParticipantInfo] = useState({})

  const router = useRouter()
  const streamId = router.query.streamId

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')

  console.log(streamId)
  console.log(accountId)

  function leaveStream(streamParticipant){
    setIsLoading(true)
    const url = hostname + `/stream/leave`
    const body = {
      streamParticipantId: streamParticipant.streamParticipantId,
    }
    axios.post(url, body)
         .then(res => {
           setIsLoading(false)
           Router.push('/discovery')
         })
         .catch(error => {
           console.error(error)
           window.alert('Failed to leave stream')
           setIsLoading(false)
         })
  }

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
             console.log(res.data)
             const streamParticipantData = res.data
             setStreamParticipantInfo(res.data)
             const streamURL = hostname + `/stream/${streamId}?accountId=${accountId}`
             axios.get(streamURL)
                  .then(res => {
                    if (res.data) {
                      console.log(res.data)
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

  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
        <div>Hello World!</div>
        <button className={streamStyles.leaveStreamButton} onClick={function(){leaveStream(streamParticipantInfo)}}>Leave</button>
      </div>
    </div>
  )
}
