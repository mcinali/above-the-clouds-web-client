import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import NotificationPermissions from '../components/notificationPermissions'
import NewStreamModal from '../components/newStreamModal'
import FollowingSuggestions from '../components/followingSuggestions'
import OnlineFollowing from '../components/onlineFollowing'
import DiscoveryStreams from '../components/discoveryStreams'
const { hostname, sockethostname } = require('../config')
import { io } from 'socket.io-client'
const axios = require('axios')

export async function getServerSideProps({ req, res, query }) {
  try {
    // Authenticate accountId + token before serving page
    // Get accountId + token from cookies
    const cookie = new Cookies(req.headers.cookie)
    const accountId = cookie.get('accountId')
    const token = cookie.get('token')
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
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token, hostname: hostname, sockethostname: sockethostname } }
  } catch (error) {
    res.writeHead(307, { Location: '/landing' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}


export default function Discovery({ accountId, accessToken, hostname, sockethostname }) {
  const [showModal, setShowModal] = useState(false)

  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true)
  const [streams, setStreams] = useState([])

  const [isLoadingFollowSuggestions, setIsLoadingFollowSuggestions] = useState(true)
  const [suggestions, setSuggestions] = useState([])

  const [isLoadingOnlineFollowing, setIsLoadingOnlineFollowing] = useState(true)
  const [onlineFollowing, setOnlineFollowing] = useState([])

  const [showMenu, setShowMenu] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const url = hostname+`/discovery?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
         .then(res => {
           setStreams(res.data)
           setIsLoadingDiscovery(false)
         })
         .catch(error => {
           console.error(error)
         })
    return
  }, [])

  useEffect(() => {
    const url = hostname + `/follows/suggestions?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        setSuggestions(res.data.suggestions)
        setIsLoadingFollowSuggestions(false)
      })
      .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    const url = hostname + `/follows/online_following?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        setOnlineFollowing(res.data)
        setIsLoadingOnlineFollowing(false)
      })
      .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    if (!(isLoadingDiscovery || isLoadingFollowSuggestions || isLoadingOnlineFollowing)){
      if (streams.length>0){
        console.log('No menu')
      } else {
        console.log('Menu')
      }
    }
  }, [isLoadingDiscovery, isLoadingFollowSuggestions, isLoadingOnlineFollowing])

  useEffect(() => {
    document.title = 'Above the Clouds'
    window.history.replaceState(null, '', '/discovery')
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

  return (
    <div className={commonStyles.container}>
      {NewStreamModal(hostname, accountId, accessToken, showModal, setShowModal, socket)}
      {NotificationPermissions()}
      <div>
        {Header(hostname, accountId, accessToken)}
        <div className={commonStyles.bodyContainer}>
          <div className={discoveryStyles.panelLeft}>
            <div className={discoveryStyles.panelLeftMainContainer}>
              {FollowingSuggestions(hostname, accountId, accessToken, suggestions, setSuggestions)}
              {OnlineFollowing(hostname, socket, accountId, accessToken, onlineFollowing, setOnlineFollowing)}
            </div>
          </div>
          <div className={discoveryStyles.panelRight}>
            <div className={discoveryStyles.newStreamContainer}>
              <button className={discoveryStyles.newStreamButton} onClick={function(){setShowModal(true)}}>New Stream+</button>
            </div>
            {DiscoveryStreams(hostname, accountId, accessToken, socket, streams, setStreams)}
          </div>
        </div>
      </div>
    </div>
  )
}
