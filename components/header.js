import React from 'react'
import commonStyles from '../styles/Common.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'

const Image = React.memo(function Image({ src }) {
  return <img src={createPictureURLFromArrayBufferString(src)} className={commonStyles.image} />
})

export default function Header(accountInfo){
  return (
    <div className={commonStyles.navbar}>
      <div className={commonStyles.navBarContent}>
        <div className={commonStyles.navbarItemLeft}>
        </div>
        <div className={commonStyles.navbarItemCenter}>
          <button className={commonStyles.inviteButton}>Invite to App</button>
        </div>
        <div className={commonStyles.navbarItemRight}>
          <div className={commonStyles.name}>{accountInfo.firstname}</div>
          <Image src={accountInfo.profilePicture}/>
        </div>
      </div>
    </div>
  )
}
