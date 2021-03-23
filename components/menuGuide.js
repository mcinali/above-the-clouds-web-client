import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import modalStyles from '../styles/Modal.module.css'
import menuGuideStyles from '../styles/MenuGuide.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'

const Image = React.memo(function Image({ src }) {
  return <img className={menuGuideStyles.image} src={src}/>
})

export default function MenuGuide(showMenu, setShowMenu, setShowNewStreamModal, setShowNotificationsModal, setShowBroadcastModal, setShowScheduleModal) {
  const [displayMenuGuide, setDisplayMenuGuide] = useState({'display':'none'})

  useEffect(() => {
    if (showMenu){
      setDisplayMenuGuide({'display':'block'})
    } else {
      setDisplayMenuGuide({'display':'none'})
    }
  }, [showMenu])

  function newStream(){
    try {
      setShowNewStreamModal(true)
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  function notifications(){
    try {
      setShowNotificationsModal(true)
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  function broadcast(){
    try {
      setShowBroadcastModal(true)
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  function schedule(){
    try {
      setShowScheduleModal(true)
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  function closeModal(){
    try {
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={modalStyles.background} style={displayMenuGuide}></div>
      <div className={modalStyles.modal} style={displayMenuGuide}>
        <div className={modalStyles.title}>
          Welcome to <a>Above the Clouds!</a>
        </div>
        <div className={menuGuideStyles.cardContainer}>
          <button className={menuGuideStyles.card} onClick={function(){newStream()}}>
            <Image src={'/images/new_stream.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}> <a>Create</a> audio room</div>
              <div className={menuGuideStyles.cardDescription}>Pick a topic. Start an audio chat. Let your followers pop in or invite people to join.</div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){notifications()}}>
            <Image src={'/images/notifications.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Hang out</a></div>
              <div className={menuGuideStyles.cardDescription}>
                Enable desktop notifications. We'll keep you updated as things happen.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){broadcast()}}>
            <Image src={'/images/broadcast.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Let people know</a> you're online</div>
              <div className={menuGuideStyles.cardDescription}>
                Send out a feeler to see who wants to hang out now.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){schedule()}}>
            <Image src={'/images/schedule.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Come back</a> later</div>
              <div className={menuGuideStyles.cardDescription}>
                Let us help you find a good time to return.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
        </div>
        <div className={modalStyles.closeButtonContainer}>
          <button className={modalStyles.closeButton} onClick={function(){closeModal()}}>close</button>
        </div>
      </div>
    </div>
  )
}
