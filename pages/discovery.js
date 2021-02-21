import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import NewStreamModal from '../components/newStreamModal'
import FollowingSuggestions from '../components/followingSuggestions'
import DiscoveryStreams from '../components/discoveryStreams'
const { hostname } = require('../config')
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
      res.writeHead(302, {
        Location: "/login",
      })
      res.end()
    }
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token } }
  } catch (error) {
    res.writeHead(302, {
      Location: "/login",
    });
    res.end()
  }
}


export default function Discovery({ accountId, accessToken }) {
  const [showModal, setShowModal] = useState(false)
  const [accountInfo, setAccountInfo] = useState({})
  const [forkedTopic, setForkedTopic] = useState({})

  useEffect(() => {
    const url = hostname + `/account/${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        setAccountInfo(res.data)
      })
      .catch(error => console.error(error))
  }, [])

  return (
    <div className={commonStyles.container}>
      {NewStreamModal(accountId, accessToken, showModal, setShowModal, forkedTopic, setForkedTopic)}
      {Header(accountInfo)}
      <div className={commonStyles.bodyContainer}>
        <div className={discoveryStyles.panelLeft}>
          <div className={discoveryStyles.panelLeftMainContainer}>
            {FollowingSuggestions(accountId, accessToken)}
          </div>
        </div>
        <div className={discoveryStyles.panelRight}>
          <div className={discoveryStyles.newStreamContainer}>
            <button className={discoveryStyles.newStreamButton} onClick={function(){setShowModal(true)}}>New Stream+</button>
          </div>
          {DiscoveryStreams(accountId, accessToken, setShowModal, setForkedTopic)}
        </div>
      </div>
    </div>
  )
}
