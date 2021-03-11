import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import NewStreamModal from '../components/newStreamModal'
import FollowingSuggestions from '../components/followingSuggestions'
import OnlineFollowing from '../components/onlineFollowing'
import DiscoveryStreams from '../components/discoveryStreams'
const { hostname, sockethostname } = require('../config')
import { io } from "socket.io-client"
const axios = require('axios')

export async function getServerSideProps({ req, res, query }) {
  try {
    // Authenticate accountId + token before serving page
    // Get accountId + token from cookies
    const cookie = new Cookies(req.headers.cookie)
    const accountId = cookie.get('accountId')
    const token = cookie.get('token')
    const session = cookie.get('session')
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
    if (!Boolean(session)){
      res.writeHead(302, { Location: '/entry' }).end()
      return { props: {ok: true } }
    }
    const newStreamModal = (Object.keys(query).length==0) ? false : Boolean(query.newStreamModal)
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token, hostname: hostname, sockethostname: sockethostname, newStreamModal: newStreamModal } }
  } catch (error) {
    res.writeHead(307, { Location: '/landing' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}


export default function Discovery({ accountId, accessToken, hostname, sockethostname, newStreamModal }) {
  const [showModal, setShowModal] = useState(newStreamModal)
  const [isLoading, setIsLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
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
  }, [])

  return (
    <div className={commonStyles.container}>
      {NewStreamModal(hostname, accountId, accessToken, showModal, setShowModal, socket)}
      {Header(hostname, accountId, accessToken)}
      <div className={commonStyles.bodyContainer}>
        <div className={discoveryStyles.panelLeft}>
          <div className={discoveryStyles.panelLeftMainContainer}>
            {FollowingSuggestions(hostname, accountId, accessToken)}
            {OnlineFollowing(hostname, socket, accountId, accessToken)}
          </div>
        </div>
        <div className={discoveryStyles.panelRight}>
          <div className={discoveryStyles.newStreamContainer}>
            <button className={discoveryStyles.newStreamButton} onClick={function(){setShowModal(true)}}>New Stream+</button>
          </div>
          {DiscoveryStreams(hostname, accountId, accessToken, socket)}
        </div>
      </div>
    </div>
  )
}
