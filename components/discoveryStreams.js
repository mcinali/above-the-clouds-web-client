import React, { useEffect, useState } from 'react'
import Router from "next/router"
import { createPictureURLFromArrayBufferString } from '../utilities'
import discoveryStreamsStyles from '../styles/DiscoveryStreams.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={discoveryStreamsStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function DiscoveryStreams(hostname, accountId, accessToken, setShowModal, setForkedTopic) {
  const [streams, setStreams] = useState([])
  const [date, setDate] = useState(new Date())

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
         })
         .catch(error => {
           console.error(error)
         })
    return
  }, [])

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

  function createStreamFromTopic(stream){
    try {
      const topicInfo = {
        topicId: stream.topicId,
        topicText: stream.topic,
      }
      setForkedTopic(topicInfo)
      setShowModal(true)
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
        const newStreams = streams
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
        const newStreams = streams
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
              {(stream.streamId)
                ?
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
                          <button className={discoveryStreamsStyles.buttonUnfollow} onClick={function(){unfollow(participant, streamIndex, participantIndex)}}>Unfollow</button>
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
                :
                <div className={discoveryStreamsStyles.cardTopic}>
                  <div className={discoveryStreamsStyles.speakerAccessibilityContainer}>
                    <div className={discoveryStreamsStyles.speakerAccessibilitySubContainer}>{''}</div>
                  </div>
                  <div className={discoveryStreamsStyles.topicContainer}>
                    <a className={discoveryStreamsStyles.topicText}>{stream.topic}</a>
                  </div>
                  <div className={discoveryStreamsStyles.cardButtonContainer}>
                    <button className={discoveryStreamsStyles.cardButton} onClick={function(){createStreamFromTopic(stream)}}>Create Stream</button>
                  </div>
                </div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
