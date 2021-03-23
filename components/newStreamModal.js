import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import Invitations from '../components/invitations'
import { createPictureURLFromArrayBufferString } from '../utilities'
import modalStyles from '../styles/Modal.module.css'
import newStreamStyles from '../styles/NewStream.module.css'
import userStyles from '../styles/Users.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={userStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function NewStreamModal(hostname, accountId, accessToken, showModal, setShowModal, socket){
  const displayModal = showModal ? {'display':'block'} : {'display':'none'}
  const [topicText, setTopicText] = useState('')
  const [inviteOnly, setInviteOnly] = useState(false)
  const [capacity, setCapacity] = useState(5)
  const [invitations, setInvitations] = useState([])
  const [disableCreateStream, setDisableCreateStream] = useState(true)

  useEffect(() => {
    setDisableCreateStream(!Boolean(topicText))
  }, [topicText])


  function createStream(){
    try {
      const invitationAccountIds = invitations.map(item => {return {accountId: item.accountId}})
      const streamURL = hostname + `/stream`
      const streamBody = {
        accountId: accountId,
        inviteOnly: inviteOnly,
        capacity: 5,
        invitees:invitationAccountIds,
      }
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      const topicURL = hostname + `/topic`
      const topicBody = {
        accountId: accountId,
        topic: topicText,
      }
      axios.post(topicURL, topicBody, headers)
           .then(res => {
             if (res.data){
               streamBody['topicId'] = res.data.topicId
               axios.post(streamURL, streamBody, headers)
                    .then(res => {
                      if (res.data && res.data.streamId){
                        socket.disconnect()
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
    const invitationsSpliced = invitations.filter((invitation,arrayIndex) => arrayIndex!=index)
    setInvitations(invitationsSpliced)
  }

  return (
    <div>
      <div className={modalStyles.background} style={displayModal}></div>
      <div className={modalStyles.modal} style={displayModal}>
        <div className={newStreamStyles.modalContainer}>
          <div className={newStreamStyles.bodyContainer}>
            <div className={newStreamStyles.formContainer}>
              <form>
                <div className={newStreamStyles.header}>Room Topic: </div>
                <div className={newStreamStyles.checkboxContainer}>
                  <input className={newStreamStyles.checkbox} type='checkbox' checked={inviteOnly} onChange={(e) => setInviteOnly(!inviteOnly)}/>
                  <div className={newStreamStyles.checkboxLabel}>Invite-Only</div>
                </div>
                <textarea area maxLength='64' cols='32' rows='2' value={topicText} className={newStreamStyles.textForm} onChange={(e) => setTopicText(e.target.value)}></textarea>
              </form>
            </div>
            <div className={newStreamStyles.invitationsContainer}>
              <div className={newStreamStyles.header}>Invite People in Your Network:</div>
              {Invitations(hostname, accountId, accessToken, invitations, queueStreamInvitation, discardInvitation, {})}
            </div>
            <div className={newStreamStyles.inviteesContainer}>
              <div className={newStreamStyles.header}>Invitees:</div>
              <div className={newStreamStyles.inviteesQueuedContainer}>
                {invitations.map((invitation, index) => {
                  return (
                    <div key={index.toString()} className={userStyles.row}>
                      <div className={userStyles.row}>
                        <Image src={invitation.profilePicture}/>
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
              <button className={newStreamStyles.createStreamButton} disabled={disableCreateStream} onClick={function(){createStream()}}>Create Audio Room</button>
            </div>
          </div>
        </div>
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
