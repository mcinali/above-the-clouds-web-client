import React, { useEffect, useState } from 'react'
import Router from "next/router"
import Invitations from '../components/invitations'
import Image from 'next/image'
import newStreamStyles from '../styles/NewStream.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function NewStreamModal(accountId, showModal, setShowModal, forkedTopic){
  const displayModal = showModal ? {"display":"block"} : {"display":"none"}
  const [topicText, setTopicText] = useState('')
  const [topic, setTopic] = (forkedTopic) ? useState(forkedTopic) : useState({})
  const [speakerAccessibility, setSpeakerAccessibility] = useState('')
  const [capacity, setCapacity] = useState(5)
  const [invitations, setInvitations] = useState([])
  const [disableCreateStream, setDisableCreateStream] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDisableCreateStream(!(Boolean(topicText) && Boolean(speakerAccessibility)))
  })

  function createStream(){
    try {
      setIsLoading(true)
      const streamURL = hostname + `/stream`
      const streamBody = {
        topicId: topic.topicId,
        accountId: accountId,
        speakerAccessibility: speakerAccessibility,
        capacity: 5,
        invitees:invitations,
      }
      if (!streamBody.topicId){
        const topicURL = hostname + `/topic`
        const topicBody = {
          accountId: accountId,
          topic: topicText,
        }
        axios.post(topicURL, topicBody)
             .then(res => {
               if (res.data){
                 setTopic(res.data)
                 streamBody['topicId'] = res.data.topicId
                 axios.post(streamURL, streamBody)
                      .then(res => {
                        if (res.data){
                          setIsLoading(false)
                          Router.push("/stream")
                        }
                      })
                      .catch(error => {
                        console.error(error)
                      })
               }
             })
             .catch(error => {
                console.error(error)
             })
      } else {
        axios.post(streamURL, streamBody)
             .then(res => {
               if (res.data){
                 setIsLoading(false)
                 Router.push("/stream")
               }
             })
             .catch(error => {
               console.error(error)
             })
      }
    } catch (error) {
      console.error(error)
    }
  }

  function closeModal(){
    setTopicText('')
    setSpeakerAccessibility('')
    setInvitations([])
    setShowModal(false)
  }

  function queueStreamInvitation(account){
    console.log(account)
    const invitationsAppended = [account].concat(invitations)
    setInvitations(invitationsAppended)
  }

  function discardInvitation(index){
    invitations.splice(index, 1)
    setInvitations(invitations)
  }

  return (
    <div>
      <div className={newStreamStyles.background} style={displayModal}></div>
      <div className={newStreamStyles.modal} style={displayModal}>
        <div className={newStreamStyles.modalContainer}>
          <div className={newStreamStyles.exitButtonContainer}>
            <button className={newStreamStyles.exitButton} onClick={function(){closeModal()}}>x</button>
          </div>
          <div className={newStreamStyles.formContainer}>
            <form>
              <div className={newStreamStyles.topicContainer}>
                <div className={newStreamStyles.header}>Topic: </div>
                <input value={topicText} className={newStreamStyles.textForm} onChange={(e) => setTopicText(e.target.value)}></input>
              </div>
              <div className={newStreamStyles.speakerAccessibilityContainer}>
                <div className={newStreamStyles.header}>Participants: </div>
                <input type="Radio" className={newStreamStyles.radioContainer} value="invite-only" checked={speakerAccessibility=="invite-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>invite-only
                <input type="Radio" className={newStreamStyles.radioContainer} value="network-only" checked={speakerAccessibility=="network-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>network-only
                <input type="Radio" className={newStreamStyles.radioContainer} value="public" checked={speakerAccessibility=="public"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>public
              </div>
            </form>
          </div>
          <div className={newStreamStyles.invitationsContainer}>
            <div className={newStreamStyles.header}>Invite Participants:</div>
            {Invitations(accountId, invitations, queueStreamInvitation, discardInvitation, false)}
          </div>
          <div>
            <div className={newStreamStyles.header}>Invitees:</div>
            <div className={newStreamStyles.inviteesContainer}>
              {invitations.map((invitation, index) => {
                return (
                  <div key={index.toString()} className={userStyles.row}>
                    {(invitation.accountId) ?
                      <div className={userStyles.row}>
                        <Image src='/bitmoji.png' width='40' height='40' className={userStyles.image} />
                        <div className={userStyles.userInfo}>
                          <a className={userStyles.username}>{invitation.username} </a>
                          <a className={userStyles.name}>{`(${invitation.firstname} ${invitation.lastnameInitial} / ${invitation.email})`}</a>
                        </div>
                      </div>
                      :
                      <div className={userStyles.userInfo}>
                        <a className={userStyles.username}>{invitation.email} </a>
                      </div>
                    }
                    <div className={userStyles.rightContainer}>
                      <div className={userStyles.status}>{invitation.status}</div>
                      <button className={userStyles.discardButton} onClick={function(){discardInvitation(index)}}>x</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={newStreamStyles.createStreamButtonContainer}>
            <button className={newStreamStyles.createStreamButton} disabled={disableCreateStream} onClick={function(){createStream()}}>Create Stream</button>
          </div>
        </div>
      </div>
    </div>
  )
}
