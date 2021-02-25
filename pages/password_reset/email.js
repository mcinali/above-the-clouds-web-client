import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"
import loginStyles from '../../styles/Login.module.css'
import commonStyles from '../../styles/Common.module.css'
import { setCookie } from '../../utilities'
const { hostname } = require('../../config')
const axios = require('axios')

export async function getServerSideProps({ res, query }) {
  try {
    return { props: { hostname: hostname } }
  } catch (error) {
    res.writeHead(307, { Location: '/oops' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function PasswordResetEmail({ hostname }) {
  const [email, setEmail] = useState('')
  const [resetError, setResetError] = useState('')

  function sendPasswordResetEmail(){
    try {
      const url = hostname + `/auth/password_reset/email`
      const body = {
        email: email,
      }
      axios.post(url, body)
        .then(res => {
          Router.push(`/password_reset/confirm?email=${email}`)
        })
        .catch(error => {
          setLoginError('Unable send password reset email')
          console.error(error)
        })

    } catch (error) {
      setResetError('Oops! Something went wrong. Make sure you correctly entered the email associated with your Above the Clouds account.')
      console.error(error)
    }
  }


  return (
    <div className={commonStyles.container}>
      <div className={loginStyles.main}>
        <h1 className={loginStyles.subtitle}>Forgot your password?</h1>
        <div className={loginStyles.formBodyContainer}>
          <div className={loginStyles.formBodyTitle}>Email</div>
          <input className={loginStyles.formBodyInput} placeholder={'Enter the email linked to your Above the Clouds account'} onChange={(event) => {setEmail(event.target.value.trim())}}></input>
        </div>
        <div className={loginStyles.formBodyFootnoteError}>{resetError}</div>
        <button className={loginStyles.loginButton} onClick={function(){sendPasswordResetEmail()}}>Reset Password</button>
      </div>
    </div>
  )
}
