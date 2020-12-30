import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Landing() {
  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to
          <a> Above the Clouds!</a>
        </h1>
        <p className={styles.description}>A Space for Meaningful Conversations</p>
        <button className={styles.registrationButton}>
          <Link href="/register">Register</Link>
        </button>
        <p className={styles.textlink}>
          <Link href="/login">Already have an account? Login here</Link>
        </p>
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
