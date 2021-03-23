import React, { useState, useEffect } from 'react'
import followsStyles from '../styles/Follows.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img src={createPictureURLFromArrayBufferString(src)} className={followsStyles.image} />
})

export default function OnlineFollowing(hostname, socket, accountId, accessToken, onlineFollowing, setOnlineFollowing){
  const [onlineAccountInfo, setOnlineAccountInfo] = useState(null)
  const [offlineAccountInfo, setOfflineAccountInfo] = useState(null)
  const [socketExists, setSocketExists] = useState(false)

  useEffect(() => {
    if (Boolean(socket) && !socketExists){
      socket.on('online', (info) => {
        setOnlineAccountInfo(info)
      })
      socket.on('offline', (info) => {
        setOfflineAccountInfo(info)
      })
      setSocketExists(true)
    }
  }, [socketExists, socket])

  useEffect(() => {
    if (Boolean(onlineAccountInfo)){
      const alreadyOnline = onlineFollowing.filter(account => account.accountId == onlineAccountInfo.accountId)
      if (!Boolean(alreadyOnline[0])){
        const onlineAccounts = [...onlineFollowing].concat([onlineAccountInfo])
        setOnlineFollowing(onlineAccounts)
        setOnlineAccountInfo(null)
      }
    }
  }, [onlineFollowing, onlineAccountInfo])

  useEffect(() => {
    if (Boolean(offlineAccountInfo)){
      const stillOnline = onlineFollowing.filter(account => account.accountId != offlineAccountInfo.accountId)
      setOnlineFollowing(stillOnline)
      setOfflineAccountInfo(null)
    }
  }, [onlineFollowing, offlineAccountInfo])

  return (
    <div className={followsStyles.container}>
      <div className={followsStyles.title}>Following Online:</div>
      {onlineFollowing.map((following, index) => {
        return (
          <div key={index.toString()} className={followsStyles.row}>
            <Image src={following.profilePicture}/>
            <div className={followsStyles.userInfo}>
              <a className={followsStyles.name}>{`${following.firstname} ${following.lastname}`}</a>
              <a className={followsStyles.username}>{`${following.username}`} </a>
            </div>
            <img src={'/images/green_dot.png'} className={followsStyles.onlineDot}/>
          </div>
        )
      })}
    </div>
  )
 }
