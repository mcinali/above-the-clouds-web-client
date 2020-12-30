import styles from '../styles/Common.module.css'
import Link from 'next/link'

export default function Register() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <a> Above the Clouds</a>
        </h1>
        <p className={styles.description}>A Space for Meaningful Conversations</p>
        <button className={styles.registrationButton}>
          <Link href="/discovery">Register</Link>
        </button>
      </main>

      <footer className={styles.footer}>
        <a
          href="/old"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Us
        </a>
      </footer>
    </div>
  )
}
