import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
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

export default function Discovery() {
  const [showModal, setShowModal] = useState(false)
  const [accountInfo, setAccountInfo] = useState({})

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')
  const hasToken = cookie.get('hasToken')
  const accessToken = (hasToken) ? cookie.get('token') : null

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
      {NewStreamModal(accountId, accessToken, showModal, setShowModal)}
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
          {DiscoveryStreams(accountId, accessToken)}
        </div>
      </div>
    </div>
  )
}
