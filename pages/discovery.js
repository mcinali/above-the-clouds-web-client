import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
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
      <div id="rightPanel" className={discoveryStyles.rightPanel}>{DiscoveryStreams()}</div>
    </div>
  )
}

// TO DO:
// Discovery component (styling + join button + start new button)
// Connections component
// Header/Account component

function DiscoveryStreams() {
  const [streams, setStreams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({})

  useEffect(() => {
    setIsLoading(true)
    const cookie = new Cookies()
    const accountId = cookie.get('accountId')
    axios.get(hostname+`/discovery/${accountId}`)
         .then(res => {
           if(isLoading){
             setStreams(res.data)
             setIndex(0)
             setIsLoading(false)
           }
         })
         .catch(error => {
           if (error.response && error.response.data){
             if (isLoading){
               setError(error.response.data)
               setIsLoading(false)
             }
           }
         })
    return
  }, [isLoading])

  return (
    <div className={discoveryStyles.cardList}>
      <div>
        {console.log(streams)}
        {streams.map((stream, index) =>
          <div key={index.toString()} className={discoveryStyles.card}>
            <p>Topic: {stream.info.topic}</p>
            <p>Capacity: {stream.info.capacity}</p>
            <p>Participants:</p>
            <ul>
              {stream.participants.map((participant,index) => <li key={index.toString()}>{`${participant.username} (${participant.firstname} ${participant.lastnameInitial})`}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
