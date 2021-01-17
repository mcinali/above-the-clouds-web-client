import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import connectionsStyles from '../styles/Connections.module.css'
import newStreamStyles from '../styles/NewStream.module.css'
import { Tab, Tabs } from 'react-bootstrap'
import Cookies from 'universal-cookie'
const { hostname } = require('../config')
const axios = require('axios')



export default function Discovery() {
  const [showModal, setShowModal] = useState(false)

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
          <button className={discoveryStyles.newStreamButton} onClick={function(){setShowModal(true)}}>New Stream+</button>
        </div>
        {DiscoveryStreams(accountId)}
      </div>
      {NewStreamModal(accountId, showModal, setShowModal)}
    </div>
  )
}

// TO DO:
// Header/Account component
// New stream modal

function NewStreamModal(accountId, showModal, setShowModal){
  const displayModal = showModal ? {"display":"block"} : {"display":"none"}
  const [topic, setTopic] = useState('')
  const [speakerAccessibility, setSpeakerAccessibility] = useState('')
  const [capacity, setCapacity] = useState(5)

  function createStream(){
    return
  }

  function closeModal(){
    setTopic('')
    setSpeakerAccessibility('')
    setShowModal(false)
  }

  function fetchConnectionSuggestions(text){
    return
  }

  return (
    <div>
      <div className={newStreamStyles.background} style={displayModal}></div>
      <div className={newStreamStyles.modal} style={displayModal}>
        <div className={newStreamStyles.modalContainer}>
          <div className={newStreamStyles.exitButtonContainer}>
            <button className={newStreamStyles.exitButton} onClick={function(){closeModal()}}>x</button>
          </div>
          <div>
            <form onSubmit={function(){createStream()}}>
              <div>
                <a>Topic: </a>
                <input value={topic} onChange={(e) => setTopic(e.target.value.trim())}></input>
              </div>
              <div>
                <a>Participants: </a>
                <input type="Radio" value="invite-only" checked={speakerAccessibility=="invite-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>invite-only
                <input type="Radio" value="network-only" checked={speakerAccessibility=="network-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>network-only
                <input type="Radio" value="public" checked={speakerAccessibility=="public"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>public
              </div>
              <div>
                <a>Invite Participants:</a>
                <input
                  placeholder={"Search by username, full name, or email"}
                  onChange={(e) => fetchConnectionSuggestions(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function Connections(accountId){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [connectionRequest, setConnectionRequest] = useState({})

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
             }
           })
           .catch(error => {
             if (error.response && error.response.data){
               setError(error.response.data)
             }
             setIsLoading(false)
           })
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
    return
  }

  function fetchConnectionSuggestions(text){
    try {
      setIsLoading(true)
      setSearchText(text.trim())
      const url = hostname+`/connections/${accountId}/suggestions`
      const params = {text: text}
      if (Boolean(text)){
        axios.get(url, {params: params})
             .then(res => {
               if (res.data){
                 res.data.map(entry => console.log(Boolean(entry.status)))
                 const regex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/
                 const suggestions = filterConnectionSuggestions(res.data)
                 if (suggestions.length>0) {
                   setSearchResults(suggestions)
                 } else if (regex.test(text)){
                   const suggestions = [{"accountId":null,"email":text}]
                   setSearchResults(suggestions)
                 } else {
                   setSearchResults([])
                 }
                 setIsLoading(false)
             }})
             .catch(error => {
               if (error.response && error.response.data){
                 setError(error.response.data)
               }
               setIsLoading(false)
             })
      } else {
        setSearchResults([])
      }
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
  }

  function filterConnectionSuggestions(suggestions){
    try {
      const accounts = inboundRequests.map(inboundRequest => inboundRequest.accountId)
      const filtrdSuggestions = suggestions.filter(suggestion => {
        if((!accounts.includes(suggestion.accountId))&&(suggestion.accountId!=accountId)) {return suggestion}
      })
      return filtrdSuggestions.splice(0,5)
    } catch (error) {
      setError(error)
    }
  }

  function queueConnectionRequest(account){
    try {
      setIsLoading(true)
      setConnectionRequest(account)
      setSearchText('')
      setSearchResults([])
      setIsLoading(false)
      return
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
  }

  function discardConnectionRequest(){
    try {
      setIsLoading(true)
      setConnectionRequest({})
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
  }

  function sendConnectionRequest(){
    try{
      setIsLoading(true)
      const connectionAccountId = connectionRequest.accountId
      const connectionEmail = (connectionAccountId) ? null : connectionRequest.email
      const alertName = (connectionRequest.username) ? connectionRequest.username : connectionRequest.email
      const url = hostname+`/connections/new`
      const body = {
        "accountId": accountId,
        "connectionAccountId": connectionAccountId,
        "connectionEmail": connectionEmail,
      }
      axios.post(url, body)
           .then(res => {
             if(res.data){
               setConnectionRequest({})
               alert(`Connection Request Sent to: ${alertName}`)
               setIsLoading(false)
             }
           })
           .catch(error => {
             if (error.response && error.response.data){
               setError(error.response.data)
             }
             setIsLoading(false)
           })
    } catch (error) {
      setError(error)
      setIsLoading(false)
    }
  }

  return (
    <div className={connectionsStyles.mainContainer}>
      <div className={connectionsStyles.subContainer}>
        <div id="newConnections" className={connectionsStyles.headers}>Make Connections:</div>
        {(Boolean(Object.keys(connectionRequest).length)) ?
          <div className={connectionsStyles.request}>
            {(connectionRequest.accountId) ?
              <div className={connectionsStyles.requestContent}>
                <Image src='/bitmoji.png' width='30' height='30' className={connectionsStyles.image} />
                <div className={connectionsStyles.userInfo}>
                  <a className={connectionsStyles.username}>{connectionRequest.username} </a>
                  <a className={connectionsStyles.name}>{`(${connectionRequest.firstname} ${connectionRequest.lastnameInitial} / ${connectionRequest.email})`}</a>
                </div>
                <button className={connectionsStyles.requestDiscardButton} onClick={function(){discardConnectionRequest()}}>x</button>
              </div>
              :
              <div className={connectionsStyles.requestContent}>
                <div className={connectionsStyles.userInfo}>
                  <a className={connectionsStyles.username}>{connectionRequest.email} </a>
                </div>
                <button className={connectionsStyles.requestDiscardButton} onClick={function(){discardConnectionRequest()}}>x</button>
              </div>
            }
          </div>
          :
          <input
            key='searchBar'
            placeholder={"Search by username, full name, or email"}
            onChange={(e) => fetchConnectionSuggestions(e.target.value)}
            className={connectionsStyles.searchBar}
          />
        }
        <div className={connectionsStyles.dropdown}>
          <div className={connectionsStyles.dropdownContent}>
            {searchResults.map((result, index) => {
              return (
                  (result.accountId) ?
                    <button className={connectionsStyles.dropdownButton} key={index.toString()} onClick={function(){queueConnectionRequest(result)}} disabled={Boolean(result.status)}>
                      <Image src='/bitmoji.png' width='30' height='30' className={connectionsStyles.image} />
                      <div className={connectionsStyles.userInfo}>
                        <a className={connectionsStyles.username}>{result.username} </a>
                        <a className={connectionsStyles.name}>{`(${result.firstname} ${result.lastnameInitial} / ${result.email})`}</a>
                      </div>
                      <a className={connectionsStyles.status}>{result.status}</a>
                    </button>
                    :
                    <div className={connectionsStyles.dropdownRow} key={index.toString()} onClick={function(){queueConnectionRequest(result)}}>
                      <div className={connectionsStyles.userInfo}>
                        <a className={connectionsStyles.username}>{result.email} </a>
                        <a className={connectionsStyles.name}>(Send Email Invite)</a>
                      </div>
                    </div>
              )
            })}
          </div>
        </div>
        <button className={connectionsStyles.requestButton} disabled={!Boolean(Object.keys(connectionRequest).length)} onClick={function(){sendConnectionRequest()}}> Send Connection Request </button>
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
