import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import connectionsStyles from '../styles/Connections.module.css'
const { hostname } = require('../config')
const axios = require('axios')
import Cookies from 'universal-cookie'
import Image from 'next/image'

export default function Discover() {
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.navbar}>
        <div className={commonStyles.navBarContent}>
          <div className={commonStyles.navbarItemCenter}>
            <a className={commonStyles.navbarLink}>Feedback</a>
          </div>
          <div className={commonStyles.navbarItemRight}>
            <Image src='/bitmoji.png' width='30' height='30' className={commonStyles.image} />
          </div>
        </div>
      </div>
      <div className={discoveryStyles.panelLeft}>
        {Connections()}
      </div>
      <div className={discoveryStyles.panelRight}>
        <div className={discoveryStyles.newStreamContainer}>
          <button className={discoveryStyles.newStreamButton}>New Stream</button>
        </div>
        {DiscoveryStreams()}
      </div>
    </div>
  )
}

// TO DO:
// Discovery component (styling + join button + start new button)
// Connections component
// Header/Account component

function Connections(){
  const [connections, setConnections] = useState([])
  const [outboundRequests, setOutboundRequests] = useState([])
  const [inboundRequests, setInboundRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({})

  useEffect(() => {
    setIsLoading(true)
    const cookie = new Cookies()
    const accountId = cookie.get('accountId')
    axios.get(hostname+`/connections/${accountId}`)
         .then(res => {
           if(isLoading){
             setConnections(res.data.connections)
             setInboundRequests(res.data.inboundRequests)
             setOutboundRequests(res.data.outboundRequests)
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
  }, [])

  return (
    <div className={connectionsStyles.connectionsContainer}>
      <div className={connectionsStyles.tab}>
        <button className={connectionsStyles.button}>Connections</button>
        <button className={connectionsStyles.button}>Requests</button>
        <button className={connectionsStyles.button}>Outbound</button>
      </div>
    </div>
  )
}

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
  }, [])

  return (

    <div id="cardList" className={discoveryStyles.cardList}>
      <div id="cardContainer">
        {streams.map((stream, index) =>
          <div id="card" key={index.toString()} className={discoveryStyles.card}>
            <p className={discoveryStyles.speakerAccessibility}>{stream.info.speakerAccessibility}</p>
            <h1 className={discoveryStyles.topic}>{stream.info.topic}</h1>
            <p>Capacity: {stream.info.capacity}</p>
            <p>Participants:</p>
            <ul>
              {stream.participants.map((participant,index) => <li key={index.toString()}>{`${participant.username} (${participant.firstname} ${participant.lastnameInitial})`}</li>)}
            </ul>
            <button className={discoveryStyles.cardButton}>Join</button>
            <button className={discoveryStyles.cardButton}>Fork</button>
          </div>
        )}
      </div>
    </div>
  )
}
