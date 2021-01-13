import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import connectionsStyles from '../styles/Connections.module.css'
import { Tab, Tabs } from 'react-bootstrap'
import Cookies from 'universal-cookie'
const { hostname } = require('../config')
const axios = require('axios')



export default function Discovery() {
  const cookie = new Cookies()
  const accountId = cookie.get('accountId')
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.navbar}>
        <div className={commonStyles.navBarContent}>
          <div className={commonStyles.navbarItemCenter}>
            <a className={commonStyles.navbarLink}>Give Us Feedback!</a>
          </div>
          <div className={commonStyles.navbarItemRight}>
            <Image src='/bitmoji.png' width='30' height='30' className={commonStyles.image} />
          </div>
        </div>
      </div>
      <div className={discoveryStyles.panelLeft}>
        {Connections(accountId)}
      </div>
      <div className={discoveryStyles.panelRight}>
        <div className={discoveryStyles.newStreamContainer}>
          <button className={discoveryStyles.newStreamButton}>New Stream+</button>
        </div>
        {DiscoveryStreams(accountId)}
      </div>
    </div>
  )
}

// TO DO:
// Discovery component (styling + join button + start new button)
// Connections component
// Header/Account component

function Connections(accountId){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [dropdownContent, setDropdownContent] = useState(connectionsStyles.dropdownContent)
  const [connections, setConnections] = useState([])
  const [inboundRequests, setInboundRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({})

  useEffect(() => {
    setIsLoading(true)
    const url = hostname+`/connections/${accountId}`
    axios.get(url)
         .then(res => {
           if(isLoading){
             setConnections(res.data.connections)
             setInboundRequests(res.data.inboundRequests)
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

  function connect(index, request){
    try {
      setIsLoading(true)
      const connectionAccountId = request.accountId
      const url = hostname+`/connections/new`
      const body = {
        "accountId": accountId,
        "connectionAccountId": connectionAccountId,
      }
      axios.post(url, body)
           .then(res => {
             if(res.data){
               const connection = {
                 'accountId': res.data.connectionAccountId,
                 'username': res.data.connectionUsername,
                 'firstname': res.data.connectionFirstname,
                 'lastnameInitial': res.data.connectionLastnameInitial,
                 'email': res.data.connectionEmail,
               }
               connections.unshift(connection)
               inboundRequests.splice(index, 1)
               setConnections(connections)
               setInboundRequests(inboundRequests)
               setIsLoading(false)
               console.log(connections)
               console.log(inboundRequests)
             }
           })
           .catch(error => {
             if (error.response && error.response.data){
               setError(error.response.data)
               setIsLoading(false)
             }
           })
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
    return
  }

  function fetchConnectionSuggestions(text){
    try {
      setSearchText(text)
      const url = hostname+`/connections/search/suggestions`
      const params = {text: text}
      if (Boolean(text.trim())){
        setIsLoading(true)
        axios.get(url, {params: params})
             .then(res => {
               if (res.data){
                 console.log(res.data)
                 setSearchResults(res.data)
                 setDropdownContent(connectionsStyles.dropdownContent.show)
                 console.log(dropdownContent)
                 console.log(connectionsStyles.dropdownContent.show)
                 setIsLoading(false)
               }
             })
             .catch(error => {
               if (error.response && error.response.data){
                 setError(error.response.data)
                 setIsLoading(false)
               }
             })
      } else {
        console.log("HERE")
        setSearchResults([])
        setDropdownContent(connectionsStyles.dropdownContent)
        console.log(dropdownContent)
      }
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
  }

  return (
    <div className={connectionsStyles.mainContainer}>
      <div className={connectionsStyles.subContainer}>
        <div id="newConnections" className={connectionsStyles.headers}>Make Connections:</div>
        <input
          key='searchBar'
          placeholder={"Search by username, full name, or email"}
          onChange={(e) => fetchConnectionSuggestions(e.target.value)}
          className={connectionsStyles.searchBar}
        />
        <div className={connectionsStyles.dropdown}>
          <div className={dropdownContent}>
            {searchResults.map((result, index) => {
              return (
                <div id="connectionSuggestion" key={index.toString()} className={connectionsStyles.dropdownRow}>
                  <Image src='/bitmoji.png' width='30' height='30' className={connectionsStyles.image} />
                  <div className={connectionsStyles.userInfo}>
                    <a className={connectionsStyles.username}>{result.username} </a>
                    <a className={connectionsStyles.name}>{`(${result.firstname} ${result.lastnameInitial} / ${result.email})`}</a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <button className={connectionsStyles.requestButton} disabled={true}> Send Connection Request </button>
      </div>
      <div id="connectionRequests" className={connectionsStyles.subContainer}>
        <div className={connectionsStyles.headers}>Connection Requests: ({inboundRequests.length}) </div>
          {inboundRequests.map((request, index) => {
            return (
              <div id="connectionRequest" key={index.toString()} className={connectionsStyles.row}>
                <Image src='/bitmoji.png' width='40' height='40' className={connectionsStyles.image} />
                <div className={connectionsStyles.userInfo}>
                  <a className={connectionsStyles.username}>{request.username} </a>
                  <a className={connectionsStyles.name}>{`(${request.firstname} ${request.lastnameInitial})`}</a>
                </div>
                <button className={connectionsStyles.connectButton} onClick={function(){connect(index, request)}}> Connect </button>
              </div>
            )
          })}
      </div>
      <div id="connections" className={connectionsStyles.subContainer}>
        <div className={connectionsStyles.headers}>Connections: ({connections.length})</div>
          {connections.map((connection, index) => {
            return (
              <div id="connectionRequest" key={index.toString()} className={connectionsStyles.row}>
                <Image src='/bitmoji.png' width='40' height='40' className={connectionsStyles.image} />
                <div className={connectionsStyles.userInfo}>
                  <a className={connectionsStyles.username}>{connection.username} </a>
                  <a className={connectionsStyles.name}>{`(${connection.firstname} ${connection.lastnameInitial})`}</a>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

function DiscoveryStreams(accountId) {
  const [streams, setStreams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState({})
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
            <div className={discoveryStyles.speakerAccessibilityContainer}>
              <a>{stream.info.speakerAccessibility}</a>
            </div>
            <div className={discoveryStyles.topicContainer}>
              <a className={discoveryStyles.topicText}>{stream.info.topic}</a>
            </div>
            <div className={discoveryStyles.timeContainer}>
              <div className={discoveryStyles.timeSubContainer}>
                <div className={discoveryStyles.time}>{calcElapsedTime(stream.info.startTime)}</div>
                <div className={discoveryStyles.timeLabels}>{'hr : min : sec'}</div>
              </div>
            </div>
            <div className={discoveryStyles.participantsContainer}>
              {stream.participants.map((participant,index) =>
                <div key={index.toString()} className={discoveryStyles.participantContainer}>
                  <div className={discoveryStyles.participantContainerElement}>
                    <Image src='/bitmoji.png' width='60' height='60' className={discoveryStyles.image} />
                  </div>
                  <div className={discoveryStyles.participantUsername}>{`${participant.username}`}</div>
                  <div className={discoveryStyles.participantName}>{`(${participant.firstname} ${participant.lastnameInitial})`}</div>
                </div>
              )}
            </div>
            <div className={discoveryStyles.cardButtonContainer}>
              <button className={discoveryStyles.cardButton}>Join</button>
              <button className={discoveryStyles.cardButton}>Fork</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
