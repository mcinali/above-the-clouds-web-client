import Link from 'next/link'
import loginStyles from '../../styles/Login.module.css'
import commonStyles from '../../styles/Common.module.css'
import { useEffect } from 'react'

export default function PasswordResetEmailConfirm({ email }) {

  useEffect(() => {
    document.title = 'Above the Clouds'
  }, [])

  return (
    <div className={commonStyles.container}>
      <div className={loginStyles.main}>
        <div className={loginStyles.description}>Your password has been reset successfully!</div>
        <button className={loginStyles.loginButtonInverse}>
          <Link href="/login">Return to Login</Link>
        </button>
      </div>
    </div>
  )
}
