import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"
import Link from 'next/link'
import loginStyles from '../styles/Login.module.css'
import commonStyles from '../styles/Common.module.css'
import { setCookie } from '../utilities'
const { hostname } = require('../config')
const axios = require('axios')

export async function getServerSideProps({ res, query }) {
  try {
    return { props: { hostname: hostname } }
  } catch (error) {
    res.writeHead(307, { Location: '/landing' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function Login({ hostname }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  function login(){
    try {
      const url = hostname + `/auth/login`
      const body = {
        username: username,
        password: password,
      }
      axios.post(url, body)
        .then(res => {
          console.log(res.data)
          setCookie('accountId', res.data.accountId)
          setCookie('hasToken', res.data.hasToken)
          setCookie('token', res.data.token)
          Router.push('/entry')
        })
        .catch(error => {
          setLoginError('Unable to log in - make sure you are using valid login credentials')
          console.error(error)
        })
    } catch (error) {
      setLoginError('Unable to log in - make sure you are using valid login credentials')
      console.error(error)
    }
  }

  return (
    <div className={commonStyles.container}>
      <div className={loginStyles.main}>
        <h1 className={loginStyles.title}>
          <a> Above the Clouds</a>
        </h1>
        <div className={loginStyles.formBodyContainer}>
          <div className={loginStyles.formBodyTitle}>Username</div>
          <input className={loginStyles.formBodyInput} placeholder={'username'} value={username} onChange={(event) => {setUsername(event.target.value.toLowerCase().trim())}}></input>
        </div>
        <div className={loginStyles.formBodyContainer}>
          <div className={loginStyles.formBodyTitle}>Password</div>
          <input className={loginStyles.formBodyInput} placeholder={'password'} value={password} onChange={(event) => {setPassword(event.target.value.trim())}}></input>
        </div>
        <div className={loginStyles.formBodyFootnoteError}>{loginError}</div>
        <button className={loginStyles.loginButton} onClick={function(){login()}}>Log In</button>
        <div className={loginStyles.textlink}>
          <Link href="/password_reset/email">Forgot Password?</Link>
        </div>
      </div>
    </div>
  )
}
