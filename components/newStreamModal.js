import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import Invitations from '../components/invitations'
import Image from 'next/image'
import { createPictureURLFromArrayBufferString } from '../utilities'
import newStreamStyles from '../styles/NewStream.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function NewStreamModal(accountId, showModal, setShowModal, forkedTopic){
  const displayModal = showModal ? {'display':'block'} : {'display':'none'}
  const [topicText, setTopicText] = useState('')
  const [topic, setTopic] = (forkedTopic) ? useState(forkedTopic) : useState({})
  const [inviteOnly, setInviteOnly] = useState(false)
  const [capacity, setCapacity] = useState(5)
  const [invitations, setInvitations] = useState([])
  const [disableCreateStream, setDisableCreateStream] = useState(true)

  useEffect(() => {
    setDisableCreateStream(!Boolean(topicText))
  })

  function createStream(){
    try {
      const invitationAccountIds = invitations.map(item => {return {accountId: item.accountId}})
      const streamURL = hostname + `/stream`
      const streamBody = {
        topicId: topic.topicId,
        accountId: accountId,
        inviteOnly: inviteOnly,
        capacity: 5,
        invitees:invitationAccountIds,
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
                        if (res.data && res.data.streamId){
                          Router.push(
                            {pathname:'/stream',
                            query: {streamId: res.data.streamId}
                          })
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
                 Router.push(
                   {pathname:'/stream',
                   query: {streamId: res.data.streamId}
                 })
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
    setInviteOnly(false)
    setInvitations([])
    setShowModal(false)
  }

  function queueStreamInvitation(account){
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
          <div className={newStreamStyles.bodyContainer}>
            <div className={newStreamStyles.formContainer}>
              <form>
                <div className={newStreamStyles.header}>Topic: </div>
                <div className={newStreamStyles.checkboxContainer}>
                  <input className={newStreamStyles.checkbox} type='checkbox' checked={inviteOnly} onChange={(e) => setInviteOnly(!inviteOnly)}/>
                  <div className={newStreamStyles.checkboxLabel}>Invite-Only</div>
                </div>
                <textarea area maxLength='64' cols='32' rows='2' value={topicText} className={newStreamStyles.textForm} onChange={(e) => setTopicText(e.target.value)}></textarea>
              </form>
            </div>
            <div className={newStreamStyles.invitationsContainer}>
              <div className={newStreamStyles.header}>Invite Participants:</div>
              {Invitations(accountId, invitations, queueStreamInvitation, discardInvitation, {})}
            </div>
            <div className={newStreamStyles.inviteesContainer}>
              <div className={newStreamStyles.header}>Invitees:</div>
              <div className={newStreamStyles.inviteesQueuedContainer}>
                {invitations.map((invitation, index) => {
                  return (
                    <div key={index.toString()} className={userStyles.row}>
                      <div className={userStyles.row}>
                        <img className={userStyles.image} src={createPictureURLFromArrayBufferString(invitation.profilePicture)}/>
                        <div className={userStyles.userInfo}>
                          <a className={userStyles.name}>{`${invitation.firstname} ${invitation.lastname}`}</a>
                          <a className={userStyles.username}>{invitation.username} </a>
                        </div>
                        <div className={userStyles.rightContainer}>
                          <a className={userStyles.status}>{(invitation.following) ? '(Following)': ''}</a>
                        </div>
                      </div>
                      <div className={userStyles.rightContainer}>
                        <button className={newStreamStyles.removeInviteeButton} onClick={function(){discardInvitation(index)}}>Remove</button>
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
    </div>
  )
}
