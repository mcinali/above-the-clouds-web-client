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

  function broadcast(){
    try {
      // TO DO: broadcast
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className={menuGuideStyles.background} style={displayMenuGuide}></div>
      <div className={menuGuideStyles.modal} style={displayMenuGuide}>
        <div className={menuGuideStyles.title}>
          Looks like there's <a>no activity</a> at the moment.
        </div>
        <div className={menuGuideStyles.cardContainer}>
          <button className={menuGuideStyles.card} onClick={function(){newStream()}}>
            <div className={menuGuideStyles.cardTitle}> <a>Start</a> a stream</div>
            <div className={menuGuideStyles.cardDescription}>Start a conversation. Invite others.</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){broadcast()}}>
            <div className={menuGuideStyles.cardTitle}><a>Broadcast</a> and hang out</div>
            <div className={menuGuideStyles.cardDescription}>
              Let people know you'll be hanging out for a while.
            </div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){discovery()}}>
            <div className={menuGuideStyles.cardTitle}><a>Hang out</a> quietly</div>
            <div className={menuGuideStyles.cardDescription}>
              Get notified when things are happening.
            </div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){discovery()}}>
            <div className={menuGuideStyles.cardTitle}><a>Come back</a> later</div>
            <div className={menuGuideStyles.cardDescription}>
              We'll help you find a good time to return.
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
