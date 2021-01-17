import React, { useEffect, useState } from 'react'
import Invitations from '../components/invitations'
import Image from 'next/image'
import newStreamStyles from '../styles/NewStream.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function NewStreamModal(accountId, showModal, setShowModal){
  const displayModal = showModal ? {"display":"block"} : {"display":"none"}
  const [topic, setTopic] = useState('')
  const [speakerAccessibility, setSpeakerAccessibility] = useState('')
  const [capacity, setCapacity] = useState(5)
  const [invitations, setInvitations] = useState([])
  const [disableCreateStream, setDisableCreateStream] = useState(true)

  useEffect(() => {
    setDisableCreateStream(!(Boolean(topic) && Boolean(speakerAccessibility)))
  })

  function createStream(){
    return
  }

  function closeModal(){
    setTopic('')
    setSpeakerAccessibility('')
    setInvitations([])
    setShowModal(false)
  }

  function queueStreamInvitation(account){
    const invitationsAppended = invitations.concat([account])
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
          <div>
            <form onSubmit={function(){createStream()}}>
              <div>
                <a>Topic: </a>
                <input value={topic} onChange={(e) => setTopic(e.target.value.trim())}></input>
              </div>
              <div>
                <a>Participants: </a>
                <input type="Radio" value="invite-only" checked={speakerAccessibility=="invite-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>invite-only
                <input type="Radio" value="network-only" checked={speakerAccessibility=="network-only"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>network-only
                <input type="Radio" value="public" checked={speakerAccessibility=="public"} onChange={(e) => setSpeakerAccessibility(e.target.value)}/>public
              </div>
              <div>
                <a>Invite Participants:</a>
                {Invitations(accountId, invitations, queueStreamInvitation, false)}
              </div>
            </form>
            <div>
              <a>Invitations:</a>
              {invitations.map((invitation, index) => {
                return (
                  <div key={index.toString()} className={userStyles.row}>
                    <Image src='/bitmoji.png' width='40' height='40' className={userStyles.image} />
                    <div className={userStyles.userInfo}>
                      <a className={userStyles.username}>{invitation.username} </a>
                      <a className={userStyles.name}>{`(${invitation.firstname} ${invitation.lastnameInitial})`}</a>
                    </div>
                    <button className={userStyles.discardButton} onClick={function(){discardInvitation(index)}}>x</button>
                  </div>
                )
              })}
            </div>
            <div>
              <button className={newStreamStyles.requestButton} disabled={disableCreateStream} onClick={function(){createStream()}}> Create Stream </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
