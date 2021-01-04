import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import { Card, Slide, makeStyles } from '@material-ui/core'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
const { hostname } = require('../config')
const axios = require('axios')
import Cookies from 'universal-cookie';

export default function Discover() {
  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}></header>
      <div id="leftPanel" className={discoveryStyles.leftPanel}>Hello</div>
      <div id="rightPanel" className={discoveryStyles.rightPanel}>{DiscoveryCarousel()}</div>
    </div>
  )
}

// TO DO:
// Discovery component (styling + join button + start new button)
// Connections component
// Header/Account component

function DiscoveryCarousel() {
  const [index, setIndex] = useState(0)
  const [threads, setThreads] = useState([])
  const [isLoading, setIsLoadting] = useState(true)
  const [error, setError] = useState({})
  const [elapsedTime, setElapsedTime] = useState('')


  const thread = threads[index]
  const threadInfo = (thread) ? thread.info : null
  const threadTopic = (threadInfo) ? threadInfo.topic : null
  const threadCapacity = (threadInfo) ? threadInfo.capacity : null
  const threadStartTime = (threadInfo) ? new Date(threadInfo.startTime).getTime() : null

  const threadParticipants = (thread) ? thread.participants : []

  const updateCard = (change) => {
    const numThreads = threads.length
    const newIndex = (index + change + numThreads) % numThreads
    setIndex(newIndex)
  }

  function tick() {
    const now = Date.now()
    const timeDiff = (now - threadStartTime) / 1000
    const hrDiff = Math.floor(timeDiff / 3600) % 24
    const minDiff = Math.floor(timeDiff / 60) % 60
    const secDiff = Math.floor(timeDiff % 60)
    const timeDiffFrmtd = `${hrDiff} (Hours) ${minDiff} (Minutes) ${secDiff} (Seconds)`
    setElapsedTime(timeDiffFrmtd)
   }

  useEffect(() => {
    const timerID = setInterval( () => tick(), 1000 )
    return function cleanup() {
      clearInterval(timerID);
    }
  })

   useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.keyCode === 39) {
                updateCard(1);
            }
            if (e.keyCode === 37) {
                updateCard(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    })

  useEffect(() => {
    const cookie = new Cookies()
    const accountId = cookie.get('accountId')
    axios.get(hostname+`/discovery/${accountId}`)
         .then(res => {
           setThreads(res.data)
           setIndex(0)
           setIsLoading(false)
         })
         .catch(error => {
           if (error.response && error.response.data){
             setError(error.response.data)
             setIsLoading(false)
           }
         })
    return
  }, [isLoading])

  return (
    <div className={discoveryStyles.carousel}>
      <FaChevronLeft onClick={() => updateCard(-1)}></FaChevronLeft>
      <Card className={discoveryStyles.card}>
        <p>Topic: {threadTopic}</p>
        <p>Capacity: {threadCapacity}</p>
        <p>Elapsed Time: {elapsedTime}</p>
        <p>Participants:</p>
        <ul>
          {threadParticipants.map(participant => <li key={index.toString()}>{`${participant.username} (${participant.firstname} ${participant.lastnameInitial})`}</li>)}
        </ul>
      </Card>
      <FaChevronRight onClick={() => updateCard(1)}></FaChevronRight>
    </div>
  )
}
