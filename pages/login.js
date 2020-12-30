import styles from '../styles/Home.module.css'
import Link from 'next/link'

export default function Login() {
  return (
    <div className={styles.container}>

      <main className={styles.main}>
        <button className={styles.button}><Link href="/discovery">Login</Link></button>
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
