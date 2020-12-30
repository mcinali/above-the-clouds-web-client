import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a> Above the Clouds!</a>
        </h1>

        <p className={styles.description}>
          A Space for Meaningful Conversations
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
