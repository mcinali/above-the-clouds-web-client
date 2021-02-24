import landingStyles from '../styles/Landing.module.css'
import commonStyles from '../styles/Common.module.css'
import Link from 'next/link'

export default function Landing() {
  return (
    <div className={commonStyles.container}>
      <div className={landingStyles.main}>
        <h1 className={landingStyles.title}>Welcome to
          <a> Above the Clouds!</a>
        </h1>
        <p className={landingStyles.description}>A Space for Meaningful Conversations</p>
        <button className={landingStyles.registrationButton}>
          <Link href="/login">Log In</Link>
        </button>
      </div>
    </div>
  )
}
