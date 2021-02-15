import React, { useEffect, useState } from 'react'
import Router from "next/router"
import Invitations from '../components/invitations'
import Image from 'next/image'
import { createPictureURLFromArrayBufferString } from '../utilities'
import streamInvitesStyles from '../styles/StreamInvites.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function StreamInviteModal(accountId, streamId, streamParticipants, showModal, setShowModal){
  const displayModal = showModal ? {"display":"block"} : {"display":"none"}
  const [queuedInvite, setQueuedInvite] = useState({})
  const [streamInvitees, setStreamInvitees] = useState([])

  useEffect(() => {
    if (showModal){
      const url = hostname + `/stream/${streamId}?accountId=${accountId}`
      axios.get(url)
           .then(res => {
             if (res.data && res.data.invitees){
               const invitees = res.data.invitees
               const inviteesFiltered = filterStreamInvitees(invitees)
              setStreamInvitees(inviteesFiltered)
             }
           })
           .catch(error => {
             console.error(error)
           })
    }
  }, [showModal])

  function filterStreamInvitees(invitees){
    const participantAccountIds = streamParticipants.map(participant => participant.accountId)
    const inviteesFiltered = invitees.filter(invitee => {
      if (!Boolean(invitee.inviteeAccountId) || !participantAccountIds.includes(invitee.inviteeAccountId)) { return invitee }
    })
    return inviteesFiltered
  }

  function closeModal(){
    setShowModal(false)
  }

  function queueInvite(account){
    setQueuedInvite(account)
  }

  function removedQueuedInvite(){
    setQueuedInvite({})
  }

  function sendInvite(){
    const url = hostname + `/stream/invite`
    const body = {
      streamId: streamId,
      accountId: accountId,
      inviteeAccountId: (queuedInvite.accountId) ? queuedInvite.accountId : null,
      inviteeEmail: (queuedInvite.accountId) ? null : queuedInvite.email,
    }
    axios.post(url, body)
        .then(res => {
          console.log(res)
          if (res.data){
            const invitees = [res.data].concat(streamInvitees)
            setStreamInvitees(invitees)
          }
          removedQueuedInvite()
        })
        .catch(error => {
          console.error(error)
        })
  }

  return (
    <div>
      <div className={streamInvitesStyles.modalBackground} style={displayModal}>
        <div className={streamInvitesStyles.modalContainer}>
          <div className={streamInvitesStyles.exitButtonContainer}>
            <button className={streamInvitesStyles.exitButton} onClick={function(){closeModal()}}>x</button>
          </div>
          <div>
            <div className={streamInvitesStyles.header}>Invite Participants:</div>
            <div>
              {Invitations(accountId, streamInvitees, queueInvite, removedQueuedInvite, false, queuedInvite)}
            </div>
            <button className={streamInvitesStyles.inviteButton} onClick={function(){sendInvite()}} disabled={Object.keys(queuedInvite).length==0}>Send Invite!</button>
          </div>
          <div>
            <div className={streamInvitesStyles.header}>Invitees:</div>
            <div className={streamInvitesStyles.inviteesContainer}>
              {streamInvitees.map((invitation, index) => {
                return (
                  <div key={index.toString()} className={userStyles.row}>
                    {(invitation.inviteeAccountId) ?
                      <div className={userStyles.row}>
                        <img className={userStyles.image} src={createPictureURLFromArrayBufferString(invitation.profilePicture)}/>
                        <div className={userStyles.userInfo}>
                          <a className={userStyles.name}>{`${invitation.firstname} ${invitation.lastname}`}</a>
                          <a className={userStyles.username}>{invitation.username} </a>
                        </div>
                      </div>
                      :
                      <div className={userStyles.userInfo}>
                        <a className={userStyles.username}>{invitation.inviteeEmail} </a>
                      </div>
                    }
                    <div className={userStyles.rightContainer}>
                      <div className={userStyles.status}>{invitation.status}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
