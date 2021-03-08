import React, { useState, useEffect } from 'react'
import followsStyles from '../styles/Follows.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img src={createPictureURLFromArrayBufferString(src)} className={followsStyles.image} />
})

export default function OnlineFollowing(hostname, socket, accountId, accessToken){
  const [onlineFollowing, setOnlineFollowing] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const url = hostname + `/follows/online_following?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        console.log('Initial Online Following: ', res.data)
        setOnlineFollowing(res.data)
        setIsLoading(false)
      })
      .catch(error => console.error(error))
  }, [])

  useEffect(() => {
    if (Boolean(socket) && !isLoading){
      socket.on('online', (info) => {
        console.log('Online Account Id: ', info)
        const alreadyOnline = onlineFollowing.filter(account => account.accountId == info.accountId)
        if (!Boolean(alreadyOnline[0])){
          console.log(onlineFollowing)
          const onlineAccounts = [...onlineFollowing].concat([info])
          console.log(onlineAccounts)
          setOnlineFollowing(onlineAccounts)
        }
      })
      socket.on('offline', (info) => {
        console.log('Offline Account Id: ', info)
        console.log(onlineFollowing)
        const stillOnline = onlineFollowing.filter(account => account.accountId != info.accountId)
        console.log(stillOnline)
        setOnlineFollowing(stillOnline)
      })
      socket.on('hello', (hello) => {
        console.log(hello)
      })
    }
  }, [isLoading, socket, onlineFollowing])

  return (
    <div className={followsStyles.container}>
      <div className={followsStyles.title}>Your Online Accounts Following:</div>
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
