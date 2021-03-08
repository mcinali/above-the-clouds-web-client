import React, { useEffect, useState } from 'react'
import Router from "next/router"
import { createPictureURLFromArrayBufferString } from '../utilities'
import discoveryStreamsStyles from '../styles/DiscoveryStreams.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={discoveryStreamsStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function DiscoveryStreams(hostname, accountId, accessToken, socket) {
  const [streams, setStreams] = useState([])
  const [date, setDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

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
    const hrs = (parseInt(dateDiff / (60*60*1000)) % 24).toString().padStart(2, '0')
    const mins = (parseInt(dateDiff / (60*1000)) % (60)).toString().padStart(2, '0')
    const result = `${hrs} : ${mins}`
    return result
  }

  useEffect(() => {
    const url = hostname+`/discovery?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
         .then(res => {
           setStreams(res.data)
           setIsLoading(false)
         })
         .catch(error => {
           console.error(error)
         })
    return
  }, [])

  useEffect(() => {
    console.log('MADE IT HERE!')
    console.log(socket)
    console.log(isLoading)
    if(Boolean(socket) && !isLoading){
      console.log('AND HERE!')
      // socket.on('create_stream', (streamInfo) => {
      //   console.log('New Stream Info: ', streamInfo)
      //   const streamExists = streams.filter(stream => stream.streamId==streamInfo.streamId)
      //   if (streamExists.length==0){
      //     const newStreams = [streamInfo].concat([...streams])
      //     setStreams(newStreams)
      //   }
      // })
      socket.on('join_stream', (streamInfo) => {
        console.log('New Stream Participants Info: ', streamInfo)
        console.log('Streams: ', streams)
        const streamsFltrd = streams.filter(stream => stream.streamId == streamInfo.streamId)
        if (streamsFltrd.length==0){
          const newStreams = [streamInfo].concat([...streams])
          console.log('Streams: ', streams)
          console.log('New streams: ', newStreams)
          setStreams(newStreams)
        } else {
          const newStreams = streams.map(stream => {
            if (stream.streamId==streamInfo.streamId){
              return streamInfo
            } else {
              return stream
            }
          })
          console.log('Streams: ', streams)
          console.log('New streams: ', newStreams)
          setStreams(newStreams)
        }
      })
      socket.on('leave_stream', (streamLeaveInfo) => {
        console.log('Streams: ', streams)
        console.log('Stream Leave Info: ', streamLeaveInfo)
        const newStreams = streams.map(stream => {
          if (stream.streamId==streamLeaveInfo.streamId){
            if (stream.participants && stream.participants.details){
              const participantsFltrd = stream.participants.details.filter(participant => participant.accountId!=streamLeaveInfo.accountId)
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
        console.log('New Streams: ', newStreamsFltrd)
        setStreams(newStreamsFltrd)
      })
    }
  }, [isLoading, streams, socket])

  function joinStream(streamInfo){
    try {
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

  return (
    <div>
      <div id="cardList" className={discoveryStreamsStyles.cardList}>
        <div id="cardContainer">
          {streams.map((stream, streamIndex) =>
            <div key={streamIndex.toString()}>
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
                  <button className={discoveryStreamsStyles.cardButton} onClick={function(){joinStream(stream)}}>Join</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
