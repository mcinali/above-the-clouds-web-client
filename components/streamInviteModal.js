import React, { useEffect, useState } from 'react'
import Router from "next/router"
import Invitations from '../components/invitations'
import Image from 'next/image'
import { createPictureURLFromArrayBufferString } from '../utilities'
import streamInvitesStyles from '../styles/StreamInvites.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function StreamInviteModal(hostname, accountId, accessToken, streamId, showModal, setShowModal){
  const displayModal = showModal ? {"display":"block"} : {"display":"none"}
  const [queuedInvite, setQueuedInvite] = useState({})
  const [streamInvitees, setStreamInvitees] = useState([])
  const [inviteesFilterList, setInviteesFilterList] = useState([])

  useEffect(() => {
    if (showModal || inviteesFilterList.length==0){
      const url = hostname + `/stream/${streamId}?accountId=${accountId}`
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      axios.get(url, headers)
           .then(res => {
             if (res.data && res.data.invitees && res.data.participants){
               const participants = res.data.participants
               const invitees = res.data.invitees
               const inviteesFiltered = filterStreamInvitees(invitees, participants)
               const combinedAccountIds = createInviteesFilterList(invitees, participants)
              setStreamInvitees(inviteesFiltered)
              setInviteesFilterList(combinedAccountIds)
             }
           })
           .catch(error => {
             console.error(error)
           })
    }
  }, [showModal, inviteesFilterList])

  function filterStreamInvitees(invitees, participants){
    const participantAccountIds = participants.map(participant => participant.accountId)
    const inviteesFiltered = invitees.filter(invitee => {
      if (!Boolean(invitee.inviteeAccountId) || !participantAccountIds.includes(invitee.inviteeAccountId)) { return invitee }
    })
    return inviteesFiltered
  }

  function createInviteesFilterList(invitees, participants){
    const participantAccountIds = participants.map(participant => participant.accountId)
    const inviteeAccountIds = invitees.map(invitee => invitee.inviteeAccountId)
    const combinedAccountIds = [...new Set(participantAccountIds.concat(inviteeAccountIds))]
    const inviteesFilterListObjects = combinedAccountIds.map(id => { return {accountId: id }})
    return inviteesFilterListObjects
  }

  function closeModal(){
    setShowModal(false)
  }

  function queueInvite(account){
    setQueuedInvite(account)
  }

  function removeQueuedInvite(){
    setQueuedInvite({})
  }

  function sendInvite(){
    const url = hostname + `/stream/invite`
    const body = {
      streamId: streamId,
      accountId: accountId,
      inviteeAccountId: queuedInvite.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
        .then(res => {
          if (res.data){
            const invitees = [res.data].concat(streamInvitees)
            setStreamInvitees(invitees)
          }
          removeQueuedInvite()
        })
        .catch(error => {
          console.error(error)
        })
  }

  return (
    <div>
      <div className={streamInvitesStyles.modalBackground} style={displayModal}></div>
      <div className={streamInvitesStyles.modalContainer} style={displayModal}>
        <div className={streamInvitesStyles.exitButtonContainer}>
          <button className={streamInvitesStyles.exitButton} onClick={function(){closeModal()}}>x</button>
        </div>
        <div className={streamInvitesStyles.bodyContainer}>
          <div className={streamInvitesStyles.invitationsContainer}>
            <div className={streamInvitesStyles.header}>Invite Participants:</div>
            {Invitations(hostname, accountId, accessToken, inviteesFilterList, queueInvite, removeQueuedInvite, queuedInvite)}
          </div>
          <button className={streamInvitesStyles.inviteButton} onClick={function(){sendInvite()}} disabled={Object.keys(queuedInvite).length==0}>Send Invite!</button>
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
