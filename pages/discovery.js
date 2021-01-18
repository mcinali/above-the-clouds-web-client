import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
import Cookies from 'universal-cookie'
import Header from '../components/header'
import NewStreamModal from '../components/newStreamModal'
import Connections from '../components/connections'
import DiscoveryStreams from '../components/DiscoveryStreams'

export default function Discovery() {
  const [showModal, setShowModal] = useState(false)

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')
  return (
    <div className={commonStyles.container}>
      {Header()}
      <div className={commonStyles.bodyContainer}>
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
    </div>
  )
}
