import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"
import loginStyles from '../../styles/Login.module.css'
import commonStyles from '../../styles/Common.module.css'
import { setCookie } from '../../utilities'
const { hostname } = require('../../config')
const axios = require('axios')

export async function getServerSideProps({ res, query }) {
  try {
    const code = query.code
    const token = query.token
    const url = hostname + `/auth/password_reset/phone_code?code=${code}&token=${token}`
    const promise = await axios.get(url)
    if (promise.status != 200){
      res.writeHead(307, { Location: '/password_reset/email' }).end()
      return { props: {ok: false, reason: 'Access not permitted' } }
    }
    const phone = promise.data.phone
    return { props: { hostname: hostname, code: code, token: token, phone: phone } }
  } catch (error) {
    res.writeHead(307, { Location: '/oops' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function PasswordResetEmail({ hostname, code, token, phone }) {
  const [index, setIndex] = useState(1)

  const [verificationCode, setVerificationCode] = useState('')
  const [verificationCodeError, setVerificationCodeError] = useState('')
  const [verificationCodeDisableButton, setVerificationCodeDisableButton] = useState(true)

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordLengthColor, setPasswordLengthColor] = useState({'color':'grey'})
  const [passwordCharactersColor, setPasswordCharactersColor] = useState({'color':'grey'})
  const [passwordMatchColor, setPasswordMatchColor] = useState({'color':'grey'})
  const [disabledResetPasswordButton, setDisabledResetPasswordButton] = useState(true)
  const [passwordError, setPasswordError] = useState('')



  function updatePassword(){
    try {
      const url = hostname + `/auth/password_reset/update`
      const body = {
        password: password,
        passwordConfirmation: passwordConfirmation,
        resetCode: code,
        token: token,
        verificationCode: verificationCode,
      }
      axios.post(url, body)
        .then(res => {
          Router.push(`/password_reset/success`)
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error){
            setPasswordError(error.response.data.error)
          }
        })

    } catch (error) {
      setResetError('Oops! Something went wrong. Make sure you correctly entered the email associated with your Above the Clouds account.')
      console.error(error)
    }
  }

  const next = () => {
    setIndex(index + 1)
  }

  useEffect(() => {
    try {
      const verificationCodeNumber = Number(verificationCode)
      const verificationCodeInteger = verificationCodeNumber % 1
      const validInteger = (Number.isNaN(verificationCodeNumber) || verificationCodeInteger!=0) ? false : true
      if (!validInteger){
        setVerificationCodeError('Enter a valid 6-digit access code')
      } else {
        setVerificationCodeError('')
      }
      if (verificationCode.length==6 && validInteger){
        setVerificationCodeDisableButton(false)
      } else {
        setVerificationCodeDisableButton(true)
      }
    } catch (error) {
      setVerificationCodeDisableButton(true)
    }
  }, [verificationCode])

  useEffect(() => {
    if (password.length==0){
      setPasswordLengthColor({'color':'grey'})
    } else if (password.length >= 8){
      setPasswordLengthColor({'color':'#2E8B57'})
    } else {
      setPasswordLengthColor({'color':'#cb4154'})
    }

    const regex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])')
    if (password.length==0){
      setPasswordCharactersColor({'color':'grey'})
    }
    else if (regex.test(password)){
      setPasswordCharactersColor({'color':'#2E8B57'})
    } else {
      setPasswordCharactersColor({'color':'#cb4154'})
    }

    if (password.length==0 || passwordConfirmation.length==0){
      setPasswordMatchColor({'color':'grey'})
    } else if (password==passwordConfirmation){
      setPasswordMatchColor({'color':'#2E8B57'})
    } else {
      setPasswordMatchColor({'color':'#cb4154'})
    }

    if (password.length >= 8 && regex.test(password) && password==passwordConfirmation){
      setDisabledResetPasswordButton(false)
    } else {
      setDisabledResetPasswordButton(true)
    }
  }, [password, passwordConfirmation])

  useEffect(() => {
    if (index==1){
      document.getElementById("index1").style.display = "block"
      document.getElementById("index2").style.display = "none"
    } else {
      document.getElementById("index1").style.display = "none"
      document.getElementById("index2").style.display = "block"
    }
  }, [index])


  return (
    <div className={commonStyles.container}>
      <div className={loginStyles.main}>
        <div id='index1'>
          <div className={loginStyles.subHeading}>Enter the verification code sent to <b>{phone}</b></div>
          <div className={loginStyles.formBodyContainer}>
            <input className={loginStyles.formBodyInput} placeholder={'Enter 6-digit code'} value={verificationCode} onChange={(event) => {setVerificationCode(event.target.value.trim())}}></input>
            <div className={loginStyles.formBodyFootnoteError}>{verificationCodeError}</div>
          </div>
          <button className={loginStyles.loginButton} onClick={function(){next()}} disabled={verificationCodeDisableButton}>Next</button>
        </div>
        <div id='index2'>
          <div className={loginStyles.subtitle}>Forgot your password?</div>
          <div className={loginStyles.formBodyContainer}>
            <div className={loginStyles.formBodyTitle}>Choose a password</div>
            <input className={loginStyles.formBodyInput} placeholder={'password'} value={password} onChange={(event) => {setPassword(event.target.value.trim())}}></input>
          </div>
          <div className={loginStyles.formBodyContainer}>
            <div className={loginStyles.formBodyTitle}>Confirm password</div>
            <input className={loginStyles.formBodyInput} placeholder={'re-type password'} value={passwordConfirmation} onChange={(event) => {setPasswordConfirmation(event.target.value.trim())}}></input>
          </div>
          <div className={loginStyles.formBodyContainer}>
            <div className={loginStyles.formBodyFootnoteTitle}>Passwords must:</div>
            <div className={loginStyles.formBodyFootnote} style={passwordLengthColor}> - Have at least 8 characters</div>
            <div className={loginStyles.formBodyFootnote} style={passwordCharactersColor}> - Have at least 1 of each: uppercase letter, lowercase letter, number, and special character</div>
            <div className={loginStyles.formBodyFootnote} style={passwordMatchColor}> - Match each other </div>
          </div>
          <div className={loginStyles.formBodyFootnoteError}>{passwordError}</div>
          <button className={loginStyles.loginButton} onClick={function(){updatePassword()}} disabled={disabledResetPasswordButton}>Reset Password</button>
        </div>
      </div>
    </div>
  )
}
