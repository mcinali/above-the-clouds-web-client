import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import connectionsStyles from '../styles/Connections.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Connections(accountId){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [connectionRequest, setConnectionRequest] = useState({})

  const [connections, setConnections] = useState([])
  const [inboundRequests, setInboundRequests] = useState([])

  useEffect(() => {
    const url = hostname+`/connections/${accountId}`
    axios.get(url)
         .then(res => {
           setConnections(res.data.connections)
           setInboundRequests(res.data.inboundRequests)
         })
         .catch(error => {
           console.error(error)
         })
    return
  }, [])

  function connect(index, request){
    try {
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
             }
           })
           .catch(error => {
             console.error(error)
           })
    } catch (error) {
      console.error(error)
    }
    return
  }

  function fetchConnectionSuggestions(text){
    try {
      setSearchText(text.trim())
      const url = hostname+`/connections/${accountId}/suggestions`
      const params = {text: text}
      if (Boolean(text)){
        axios.get(url, {params: params})
             .then(res => {
               if (res.data){
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
             }})
             .catch(error => {
               console.error(error)
             })
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error(error)
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
      console.error(error)
    }
  }

  function queueConnectionRequest(account){
    try {
      setConnectionRequest(account)
      setSearchText('')
      setSearchResults([])
      return
    } catch (error) {
      console.error(error)
    }
  }

  function discardConnectionRequest(){
    try {
      setConnectionRequest({})
    } catch (error) {
      console.error(error)
    }
  }

  function sendConnectionRequest(){
    try{
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
             }
           })
           .catch(error => {
             console.error(error)
           })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={connectionsStyles.mainContainer}>
      <div className={connectionsStyles.subContainer}>
        <div id="newConnections" className={connectionsStyles.headers}>Make Connections:</div>
        {(Boolean(Object.keys(connectionRequest).length)) ?
          <div className={connectionsStyles.request}>
            {(connectionRequest.accountId) ?
              <div className={userStyles.container}>
                <Image src='/bitmoji.png' width='30' height='30' className={userStyles.image} />
                <div className={userStyles.userInfo}>
                  <a className={userStyles.username}>{connectionRequest.username} </a>
                  <a className={userStyles.name}>{`(${connectionRequest.firstname} ${connectionRequest.lastnameInitial} / ${connectionRequest.email})`}</a>
                </div>
                <button className={connectionsStyles.requestDiscardButton} onClick={function(){discardConnectionRequest()}}>x</button>
              </div>
              :
              <div className={userStyles.container}>
                <div className={userStyles.userInfo}>
                  <a className={userStyles.username}>{connectionRequest.email} </a>
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
                      <div className={userStyles.userInfo}>
                        <a className={userStyles.username}>{result.username} </a>
                        <a className={userStyles.name}>{`(${result.firstname} ${result.lastnameInitial} / ${result.email})`}</a>
                      </div>
                      <a className={userStyles.status}>{result.status}</a>
                    </button>
                    :
                    <div className={connectionsStyles.dropdownRow} key={index.toString()} onClick={function(){queueConnectionRequest(result)}}>
                      <div className={userStyles.userInfo}>
                        <a className={userStyles.username}>{result.email} </a>
                        <a className={userStyles.name}>(Send Email Invite)</a>
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
