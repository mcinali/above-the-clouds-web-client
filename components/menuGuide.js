import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import menuGuideStyles from '../styles/MenuGuide.module.css'

export default function MenuGuide(showMenu, setShowMenu, setShowNewStreamModal) {
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

  function discovery(){
    try {
      setShowMenu(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={menuGuideStyles.background} style={displayMenuGuide}></div>
      <div className={menuGuideStyles.modal} style={displayMenuGuide}>
        <div className={menuGuideStyles.title}>Welcome to
          <a> Above the Clouds!</a>
        </div>
        <div className={menuGuideStyles.cardContainer}>
          <button className={menuGuideStyles.card} onClick={function(){newStream()}}>
            <div className={menuGuideStyles.cardTitle}> <a>Start</a> a stream</div>
            <div className={menuGuideStyles.cardDescription}>Start a new stream, invite friends, and hang out until your followers and/or invitees to join you.</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){discovery()}}>
            <div className={menuGuideStyles.cardTitle}><a>Discover</a> streams</div>
            <div className={menuGuideStyles.cardDescription}>
              Discover your followers streams and streams you've been invited to.
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
