import React, { useState, useEffect } from 'react'
import commonStyles from '../styles/Common.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'
import { io } from "socket.io-client"
const { sockethostname } = require('../config')
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img src={createPictureURLFromArrayBufferString(src)} className={commonStyles.image} />
})

export default function Header(hostname, accountId, accessToken){
  const [accountInfo, setAccountInfo] = useState({})

  useEffect(() => {
    window.history.replaceState(null, '', '/discovery')
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

  useEffect(() => {
    const socket = io(sockethostname, {query:`accountId=${accountId}`})
    socket.on('online', (id) => {
      console.log('Online Account Id: ', id)
    })
    socket.on('offline', (id) => {
      console.log('Offline Account Id: ', id)
    })
  }, [])

  return (
    <div className={commonStyles.navbar}>
      <div className={commonStyles.navBarContent}>
        <div className={commonStyles.navbarItemLeft}>
        </div>
        <div className={commonStyles.navbarItemCenter}>
          <button className={commonStyles.inviteButton}>Invite to App</button>
        </div>
        <div className={commonStyles.navbarItemRight}>
          <div className={commonStyles.name}>{accountInfo.firstname}</div>
          <Image src={accountInfo.profilePicture}/>
        </div>
      </div>
    </div>
  )
}
