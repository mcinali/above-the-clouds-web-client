import Image from 'next/image'
import commonStyles from '../styles/Common.module.css'

export default function Header(){
  return (
    <div className={commonStyles.navbar}>
      <div className={commonStyles.navBarContent}>
        <div className={commonStyles.navbarItemCenter}>
          <a className={commonStyles.navbarLink}></a>
        </div>
        <div className={commonStyles.navbarItemRight}>
          <Image src='/bitmoji.png' width='30' height='30' className={commonStyles.image} />
        </div>
      </div>
    </div>
  )
}
