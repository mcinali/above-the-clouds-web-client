import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import menuGuideStyles from '../styles/MenuGuide.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'

const Image = React.memo(function Image({ src }) {
  return <img className={menuGuideStyles.image} src={src}/>
})

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
            <Image src={'/images/new_stream.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}> <a>Start</a> a stream</div>
              <div className={menuGuideStyles.cardDescription}>Start a conversation, invite friends, and hang out until people join you.</div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){discovery()}}>
            <Image src={'/images/notifications.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Hang out</a></div>
              <div className={menuGuideStyles.cardDescription}>
                Leave us on in the background. Enable notifications to get updates when things happen.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){broadcast()}}>
            <Image src={'/images/broadcast.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Let people know</a> you're online</div>
              <div className={menuGuideStyles.cardDescription}>
                Let people know you'll be hanging out for a while. Leave us on in the background.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
          <button className={menuGuideStyles.card} onClick={function(){discovery()}}>
            <Image src={'/images/schedule.png'}/>
            <div className={menuGuideStyles.cardText}>
              <div className={menuGuideStyles.cardTitle}><a>Come back</a> later</div>
              <div className={menuGuideStyles.cardDescription}>
                We'll help you find a good time to return.
              </div>
            </div>
            <div className={menuGuideStyles.arrow}>{'>'}</div>
          </button>
        </div>
      </div>
    </div>
  )
}
