import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import commonStyles from '../styles/Common.module.css'
import userStyles from '../styles/Users.module.css'
import modalStyles from '../styles/Modal.module.css'
import broadcastStyles from '../styles/Broadcast.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={userStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function BroadcastModal(hostname, accountId, accessToken, showBroadcastModal, setShowBroadcastModal) {
  const [displayBroadcastModal, setDisplayBroadcastModal] = useState({'display':'none'})

  const [followers, setFollowers] = useState([])
  const [fetchingFollowers, setFetchingFollowers] = useState(false)

  const [recentOnlineBroadcasts, setRecentOnlineBroadcasts] = useState([])
  const [fetchingRecentOnlineBroadcasts, setFetchingRecentOnlineBroadcasts] = useState(false)

  const [ready, setReady] = useState(true)

  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (showBroadcastModal){
      setReady(false)
      if (document.getElementById('online-broadcast-loader')){
        document.getElementById('online-broadcast-loader').style.display = 'block'
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      const url1 = hostname + `/follows/followers?accountId=${accountId}`
      setFetchingFollowers(true)
      axios.get(url1, headers)
        .then(res => {
          const followersSelected = res.data.map(follower => {
            follower['selected'] = true
            return follower
          })
          setFollowers(followersSelected)
          setFetchingFollowers(false)
        })
        .catch(err => new Error(err))
      const url2 = hostname + `/broadcast/recent?accountId=${accountId}`
      setFetchingRecentOnlineBroadcasts(true)
      axios.get(url2, headers)
        .then(res => {
          setRecentOnlineBroadcasts(res.data)
          setFetchingRecentOnlineBroadcasts(false)
        })
        .catch(err => console.error(err))
    }
  }, [showBroadcastModal])

  useEffect(() => {
    if (!(fetchingFollowers || fetchingRecentOnlineBroadcasts) && !ready){
      setSelectAll(true)
      setReady(true)
    }
  }, [fetchingFollowers, fetchingRecentOnlineBroadcasts, followers, ready])

  useEffect(() => {
    if (document.getElementById('online-broadcast-loader')){
      if (ready){
        document.getElementById('online-broadcast-loader').style.display = 'none'
      }
    }
  }, [ready])

  function changeSelection(index){
    try {
      const newFollowers = followers.map((follower,arrayIndex) => {
        if (arrayIndex==index){
          follower['selected'] = !follower['selected']
          return follower
        } else {
          return follower
        }
      })
      console.log(newFollowers)
      setFollowers(newFollowers)
      setSelectAll(false)
    } catch (error) {
      console.error(error)
    }
  }

  function clickSelectAll(){
    try {
      const newFollowers = followers.map(follower => {
        follower['selected'] = !selectAll
        return follower
      })
      setFollowers(newFollowers)
      setSelectAll(!selectAll)
    } catch (error) {
      console.error(error)
    }
  }

  function broadcast(){
    try {
      const recipients = followers.filter(follower => follower.selected)
      const recipientAccountIds = recipients.map(recipient => recipient.accountId)
      const url = hostname + `/broadcast/online`
      const body = {
        accountId: accountId,
        broadcastAccountIds: recipientAccountIds,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.post(url, body, headers)
        .then(res => {
          // TBD
        })
        .catch(err => console.error(err))
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (showBroadcastModal){
      setDisplayBroadcastModal({'display':'block'})
    } else {
      setDisplayBroadcastModal({'display':'none'})
    }
  }, [showBroadcastModal])

  function closeModal(){
    try {
      setShowBroadcastModal(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={modalStyles.background} style={displayBroadcastModal}></div>
      <div className={modalStyles.modal} style={displayBroadcastModal}>
        <div>
          <div className={modalStyles.title}>
            <a>Let people know</a> you're hanging out
          </div>
          <div className={modalStyles.subtitle}>
            You can only notify someone once every 24hrs
          </div>
        </div>
        <div className={broadcastStyles.container}>
          <div className={broadcastStyles.selectionContainer}>
            <div className={broadcastStyles.checkboxContainer}>
              <input className={broadcastStyles.checkbox} type='checkbox' checked={selectAll} onChange={(e) => clickSelectAll()}/>
              <div className={broadcastStyles.checkboxLabel}>Select All</div>
            </div>
            <div className={broadcastStyles.rowContainer}>
              <div id='online-broadcast-loader' className={broadcastStyles.loaderContainer}>
                <div className={commonStyles.loader}></div>
              </div>
              {followers.map((follower, index) => {
                return (
                  <div key={index.toString()} className={userStyles.row}>
                    <input className={broadcastStyles.checkbox} type='checkbox' checked={follower.selected} onChange={(e) => changeSelection(index)}/>
                    <Image src={follower.profilePicture}/>
                    <div className={userStyles.userInfo}>
                      <a className={userStyles.name}>{`${follower.firstname} ${follower.lastname}`}</a>
                      <a className={userStyles.username}>{`${follower.username}`} </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div>
          <button className={broadcastStyles.broadcastButton} onClick={function(){broadcast()}}>Broadcast</button>
        </div>
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
