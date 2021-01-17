import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import Cookies from 'universal-cookie'
import NewStreamModal from '../components/newStreamModal'
import Connections from '../components/connections'
import DiscoveryStreams from '../components/DiscoveryStreams'

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
      <div className={commonStyles.panelLeft}>
        {Connections(accountId)}
      </div>
      <div className={commonStyles.panelRight}>
        <div className={commonStyles.newStreamContainer}>
          <button className={commonStyles.newStreamButton} onClick={function(){setShowModal(true)}}>New Stream+</button>
        </div>
        {DiscoveryStreams(accountId)}
      </div>
      {NewStreamModal(accountId, showModal, setShowModal)}
    </div>
  )
}
