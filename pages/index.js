import landingStyles from '../styles/Landing.module.css'
import commonStyles from '../styles/Common.module.css'
import Link from 'next/link'

export default function Landing() {
  return (
    <div className={commonStyles.container}>
      <body className={commonStyles.main}>
        <h1 className={landingStyles.title}>Welcome to
          <a> Above the Clouds!</a>
        </h1>
        <p className={landingStyles.description}>A Space for Meaningful Conversations</p>
        <button className={landingStyles.registrationButton}>
          <Link href="/register">Sign Up</Link>
        </button>
        <p className={landingStyles.textlink}>
          <Link href="/login">Already have an account? Login here</Link>
        </p>
      </body>
      <div id="footer" className={commonStyles.footer}>
        <footer>
          <a
            href="/old"
            target="_blank"
            rel="noopener noreferrer"
          >
            About Us
          </a>
        </footer>
      </div>
    </div>
  )
}
