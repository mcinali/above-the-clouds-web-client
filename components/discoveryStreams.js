import React, { useEffect, useState } from 'react'
import Router from "next/router"
import { createPictureURLFromArrayBufferString } from '../utilities'
import discoveryStreamsStyles from '../styles/DiscoveryStreams.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={discoveryStreamsStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

const ImageMini = React.memo(function Image({ src }) {
  return <img className={discoveryStreamsStyles.imageMini} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function DiscoveryStreams(hostname, accountId, accessToken, socket, streams, setStreams, streamIsLoading, accountInfo) {
  const [joinedStreamInfo, setJoinedStreamInfo] = useState(null)
  const [leftStreamInfo, setLeftStreamInfo] = useState(null)
  const [date, setDate] = useState(new Date())
  const [socketExists, setSocketExists] = useState(false)

  useEffect(() => {
    const timerId = setInterval(() => tick(), 60000)
    return function cleanup() {
      clearInterval(timerId)
    }
  })

  function tick() {
    setDate(new Date())
  }

  function calcElapsedTime(startTime){
    const start = new Date(startTime)
    const dateDiff = date - start
    // const days = (parseInt(dateDiff / (24*60*60*1000))).toString().padStart(2, '0')
    const hrs = (Math.max(0, parseInt(dateDiff / (60*60*1000)) % 24)).toString().padStart(2, '0')
    const mins = (Math.max(0, parseInt(dateDiff / (60*1000)) % (60)).toString()).padStart(2, '0')
    const result = `${hrs} : ${mins}`
    return result
  }

  useEffect(() => {
    if(Boolean(socket) && !socketExists){
      socket.on('join_stream', (streamInfo) => {
        setJoinedStreamInfo(streamInfo)
      })
      socket.on('leave_stream', (streamLeaveInfo) => {
        setLeftStreamInfo(streamLeaveInfo)
      })
      setSocketExists(true)
    }
  }, [socketExists, streams, socket])

  useEffect(() => {
    if (Boolean(joinedStreamInfo)){
      const streamsFltrd = streams.filter(stream => stream.streamId == joinedStreamInfo.streamId)
      if (streamsFltrd.length==0){
        //  Set streams
        const newStreams = [joinedStreamInfo].concat([...streams])
        setStreams(newStreams)
      } else {
        const newStreams = streams.map(stream => {
          if (stream.streamId==joinedStreamInfo.streamId){
            return joinedStreamInfo
          } else {
            return stream
          }
        })
        setStreams(newStreams)
      }
      setJoinedStreamInfo(null)
    }
  }, [joinedStreamInfo, streams])

  useEffect(() => {
    if (Boolean(leftStreamInfo)){
      const newStreams = streams.map(stream => {
        if (stream.streamId==leftStreamInfo.streamId){
          if (stream.participants && stream.participants.details){
            const participantsFltrd = stream.participants.details.filter(participant => participant.accountId!=leftStreamInfo.accountId)
            if (participantsFltrd.length>0){
              stream['participants']['details'] = participantsFltrd
              return stream
            } else {
              return null
            }
          }
        } else {
          return stream
        }
      })
      const newStreamsFltrd = newStreams.filter(stream => stream!=null)
      setStreams(newStreamsFltrd)
      setLeftStreamInfo(null)
    }
  }, [leftStreamInfo, streams])

  function joinStream(streamInfo){
    try {
      socket.disconnect()
      Router.push(
        {pathname: "/stream",
        query: {streamId: streamInfo.streamId}
      })
    } catch (error) {
      console.error(error)
    }
  }

  function follow(participant, streamIndex, participantIndex){
    const url = hostname + `/follows/follow`
    const body = {
      accountId: accountId,
      followingAccountId: participant.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newStreams = [...streams]
        newStreams[streamIndex].participants.details[participantIndex].following = true
        setStreams(newStreams)
    })
      .catch(error => console.error(error))
  }

  function unfollow(participant, streamIndex, participantIndex){
    const url = hostname + `/follows/unfollow`
    const body = {
      accountId: accountId,
      followingAccountId: participant.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newStreams = [...streams]
        newStreams[streamIndex].participants.details[participantIndex].following = false
        setStreams(newStreams)
      })
      .catch(error => console.error(error))
  }

  function setStreamReminder(stream){
    try {
      const url = hostname + `/stream/reminder`
      const body = {
        accountId: accountId,
        streamId: stream.streamId,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.post(url, body, headers)
        .then(res => {
          // Alter card state
          const newStreams = streams.map(oldStream => {
            if (oldStream.streamId==stream.streamId){
              const newStream = oldStream
              accountInfo['streamReminderId'] = res.data.id
              newStream['reminders'] = oldStream['reminders'].concat([accountInfo])
              return newStream
            } else {
              return oldStream
            }
          })
          setStreams(newStreams)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  }

  function deactivateStreamReminder(stream){
    try {
      const streamReminder = stream.reminders.filter(reminder => reminder.accountId == accountId)[0]
      const url = hostname + `/stream/reminder/deactivate`
      const body = {
        streamReminderId: streamReminder.streamReminderId,
        accountId: streamReminder.accountId,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.post(url, body, headers)
        .then(res => {
          console.log(res)
          // Alter card state
          const streamReminderInfo = res.data
          console.log(streamReminderInfo)
          const newStreams = streams.map(oldStream => {
            if (oldStream.streamId==streamReminderInfo.streamId){
              const newStream = oldStream
              newStream['reminders'] = oldStream['reminders'].filter(reminder => reminder.streamReminderId != streamReminderInfo.id)
              return newStream
            } else {
              return oldStream
            }
          })
          setStreams(newStreams)
        })
        .catch(error => console.error(error))
    } catch (error) {
      console.error(error)
    }
  }

  function formatOrganizer(creatorInfo){
    try {
      const { accountId, firstname, lastname, username } = creatorInfo
      return `${firstname} ${lastname} (${username})`
    } catch (error) {
      console.error(error)
    }
  }

  function formatScheuledDate(dateStr){
    try {
      const date = new Date(dateStr)
      const dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
      const timeOptions = { hour: '2-digit', minute: 'numeric' }
      const time = `${date.toLocaleString('en-US', dayOptions)}  at ${date.toLocaleString('en-US', timeOptions)}`
      return time
    } catch (error) {
      console.error(error)
    }
  }

  function accountReminder(stream){
    try {
      const scheduledStreamReminders = stream.reminders
      const scheduledStreamReminderAccountIds = scheduledStreamReminders.map(account => parseInt(account.accountId))
      const boolean = scheduledStreamReminderAccountIds.includes(parseInt(accountId))
      return boolean
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div id="cardList" className={discoveryStreamsStyles.cardList}>
        <div id="cardContainer">
          {(streams.length==0) ?
            <div className={discoveryStreamsStyles.noStreamsContainer}>
              {(streamIsLoading) ?
                <div></div>
                :
                <div>
                  Looks like there are no audio rooms to discover at the moment :(
                  <br></br>
                  <br></br>
                  Check here for audio rooms you were invited to +  public audio rooms created by your following.
                </div>
              }
            </div>
            :
            <div>
              {streams.map((stream, streamIndex) =>
                <div key={streamIndex.toString()}>
                  {(new Date(stream.startTime).getTime() < new Date().getTime()) ?
                    <div className={discoveryStreamsStyles.card}>
                      <div className={discoveryStreamsStyles.speakerAccessibilityContainer}>
                        <div className={discoveryStreamsStyles.speakerAccessibilitySubContainer}>{(stream.inviteOnly) ? 'Invite-Only' : ''}</div>
                      </div>
                      <div className={discoveryStreamsStyles.topicContainer}>
                        <a className={discoveryStreamsStyles.topicText}>{stream.topic}</a>
                      </div>
                      <div className={discoveryStreamsStyles.timeContainer}>
                        <div className={discoveryStreamsStyles.timeSubContainer}>
                          <div className={discoveryStreamsStyles.time}>{calcElapsedTime(stream.startTime)}</div>
                          <div className={discoveryStreamsStyles.timeLabels}>{'hr : min'}</div>
                        </div>
                      </div>
                      <div className={discoveryStreamsStyles.participantsContainer}>
                        {stream.participants.details.map((participant, participantIndex) =>
                          <div key={participantIndex.toString()} className={discoveryStreamsStyles.participantContainer}>
                            <div>
                              <Image src={participant.profilePicture}/>
                            </div>
                            <div className={discoveryStreamsStyles.participantName}>{`${participant.firstname} ${participant.lastname}`}</div>
                            <div className={discoveryStreamsStyles.participantUsername}>{`${participant.username}`}</div>
                            {
                              (participant.following==null) ?
                              <div></div>
                              :
                              (participant.following) ?
                              <button className={discoveryStreamsStyles.buttonUnfollow} onClick={function(){unfollow(participant, streamIndex, participantIndex)}}>Following</button>
                              :
                              <button className={discoveryStreamsStyles.buttonFollow} onClick={function(){follow(participant, streamIndex, participantIndex)}}>Follow</button>
                            }
                          </div>
                        )}
                      </div>
                      <div className={discoveryStreamsStyles.cardButtonContainer}>
                        <button className={discoveryStreamsStyles.cardButton} onClick={function(){joinStream(stream)}}>Join Room</button>
                      </div>
                    </div>
                    :
                    <div className={discoveryStreamsStyles.card}>
                      <div className={discoveryStreamsStyles.speakerAccessibilityContainer}>
                        <div className={discoveryStreamsStyles.speakerAccessibilitySubContainer}>{(stream.inviteOnly) ? 'Invite-Only' : ''}</div>
                      </div>
                      <div className={discoveryStreamsStyles.topicContainer}>
                        <a className={discoveryStreamsStyles.topicText}>{stream.topic}</a>
                      </div>
                      <div className={discoveryStreamsStyles.detailsContainer}>
                        <div className={discoveryStreamsStyles.detailsText}> <b>Starts:</b><span>&#160;</span> {formatScheuledDate(stream.startTime)} </div>
                        <div className={discoveryStreamsStyles.detailsText}> <b>Organizer:</b><span>&#160;</span>
                          <div>{formatOrganizer(stream.creator)}</div>
                          <ImageMini src={stream.creator.profilePicture}/>
                        </div>
                        <div className={discoveryStreamsStyles.detailsText}> <b>Interested:</b> {} </div>
                        <div className={discoveryStreamsStyles.reminderAccountsContainer}>
                          {stream.reminders.map((reminderAccount, index) => {
                            return (
                              <div key={index.toString()} className={discoveryStreamsStyles.imageMiniContainer}>
                                <ImageMini src={reminderAccount.profilePicture}/>
                                <span className={discoveryStreamsStyles.hoverText}>{`${reminderAccount.firstname} ${reminderAccount.lastname}`}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div className={discoveryStreamsStyles.cardButtonContainer}>
                        {(accountReminder(stream)) ?
                          <button className={discoveryStreamsStyles.cardButtonGrey} onClick={function(){deactivateStreamReminder(stream)}}>Interested </button>
                          :
                          <button className={discoveryStreamsStyles.cardButton} onClick={function(){setStreamReminder(stream)}}>Notify Me</button>
                        }
                      </div>
                    </div>
                  }

                </div>
              )}
            </div>
          }
        </div>
      </div>
    </div>
  )
}
