import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'
import { createPictureURLFromArrayBufferString } from '../utilities'

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
          <img className={commonStyles.image} src={createPictureURLFromArrayBufferString(accountInfo.profilePicture)}/>
        </div>
      </div>
    </div>
  )
}
