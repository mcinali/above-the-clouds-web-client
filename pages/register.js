import React, { useState, useEffect } from 'react'
import Router, { useRouter } from "next/router"
import { setCookie } from '../utilities'
import registrationStyles from '../styles/Registration.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export async function getServerSideProps({ res, query }) {
  try {
    const code = query.code
    const url = hostname + `/invitation/check?code=${code}`
    const promise = await axios.get(url)
    if (promise.status > 299){
      res.writeHead(307, { Location: '/landing' }).end()
      return { props: {ok: false, reason: 'Invalid invitation code' } }
    }
    return { props: { code: code, hostname: hostname } }
  } catch (error) {
    res.writeHead(307, { Location: '/landing' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}

export default function Register({ code, hostname }) {
  const [pageIndex, setPageIndex] = useState(1)
  const [backButton, setBackButton] = useState('')

  const [disbaleAccountFormCheckButton, setDisbaleAccountFormCheckButton] = useState(true)
  const [disbaleVerifyEmailAccessCodeButton, setDisbaleVerifyEmailAccessCodeButton] = useState(true)
  const [disableSendCodeButton, setDisableSendCodeButton] = useState(true)
  const [disableRegisterButton, setDisableRegisterButton] = useState(true)

  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')

  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLengthColor, setPasswordLengthColor] = useState({'color':'grey'})
  const [passwordCharactersColor, setPasswordCharactersColor] = useState({'color':'grey'})
  const [showPassword, setShowPassword] = useState(false)

  const [accountCheckError, setAccountCheckError] = useState('')

  const [emailAccessCode, setEmailAccessCode] = useState('')
  const [emailAccessCodeError, setEmailAccessCodeError] = useState('')
  const [emailAccessToken, setEmailAccessToken] = useState('')

  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneNumberError, setPhoneNumberError] = useState('')

  const [phoneAccessCode, setPhoneAccessCode] = useState('')
  const [phoneAccessCodeError, setPhoneAccessCodeError] = useState('')

  useEffect(() => {
    document.title = 'Above the Clouds'
  }, [])

  useEffect(() => {
    const regex = new RegExp('^[a-zA-Z0-9]*$')
    if ((username.length > 0) && (!regex.test(username))){
      setUsernameError('username can only consists of letters and numbers')
    } else {
      setUsernameError('')
    }
  }, [username])

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

    if (password.length==0){
      setPasswordError(false)
    } else if (password.length >= 8 && password.length <= 20 && regex.test(password)){
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }, [password])

  useEffect(() => {
    if (Boolean(firstname.trim()) && Boolean(lastname.trim()) && Boolean(username) && Boolean(email) && Boolean(password) && !Boolean(usernameError) && !passwordError){
      setDisbaleAccountFormCheckButton(false)
    } else {
      setDisbaleAccountFormCheckButton(true)
    }
  }, [firstname, lastname, username, email, password, usernameError, passwordError])

  useEffect(() => {
    try {
      const accessCodeLength = emailAccessCode.length
      const accessCodeNumber = Number(emailAccessCode)
      const accessCodeInteger = accessCodeNumber % 1
      if (Number.isNaN(accessCodeNumber) || accessCodeInteger!=0){
        setEmailAccessCodeError('Enter a valid 6-digit access code')
      } else {
        setEmailAccessCodeError('')
      }
      if (accessCodeLength==6){
        setDisbaleVerifyEmailAccessCodeButton(false)
      } else {
        setDisbaleVerifyEmailAccessCodeButton(true)
      }
    } catch (error) {
      console.error(error)
      setDisbaleVerifyEmailAccessCodeButton(true)
    }
  }, [emailAccessCode])

  useEffect(() => {
    try {
      const phoneNumberCheckNumber = Number(phoneNumber)
      const phoneNumberCheckInteger = phoneNumberCheckNumber % 1
      const validInteger = (Number.isNaN(phoneNumberCheckNumber) || phoneNumberCheckInteger!=0) ? false : true
      if (!validInteger){
        setPhoneNumberError('Enter a valid phone number')
      } else {
        setPhoneNumberError('')
      }
      if ((phoneNumberCheckNumber >= 2010000000) && (phoneNumberCheckNumber <= 9899999999) && validInteger){
        setDisableSendCodeButton(false)
      } else {
        setDisableSendCodeButton(true)
      }
    } catch (error) {
      console.error(error)
      setDisableSendCodeButton(true)
    }
  }, [phoneNumber])

  useEffect(() => {
    try {
      const accessCodeLength = phoneAccessCode.length
      const accessCodeNumber = Number(phoneAccessCode)
      const accessCodeInteger = accessCodeNumber % 1
      const validInteger = (Number.isNaN(accessCodeNumber) || accessCodeInteger!=0) ? false : true
      if (!validInteger){
        setPhoneAccessCodeError('Enter a valid 6-digit access code')
      } else {
        setPhoneAccessCodeError('')
      }
      if (accessCodeLength==6 && validInteger){
        setDisableRegisterButton(false)
      } else {
        setDisableRegisterButton(true)
      }
    } catch (error) {
      console.error(error)
      setDisableRegisterButton(true)
    }
  }, [phoneAccessCode])

  useEffect(() => {
    if (pageIndex > 1){
      setBackButton('< Back')
    } else {
      setBackButton('')
    }
  }, [pageIndex])

  function checkAccountForm(){
    try {
      const url = hostname + `/preregistration/accountDetails/check?code=${code}`
      const body = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        username: username,
        email: email,
        password: password,
      }
      axios.post(url, body)
        .then(res => {
          setAccountCheckError('')
          setEmailAccessToken('')
          setEmailAccessCodeError('')
          setPageIndex(pageIndex + 1)
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error){
            setAccountCheckError(error.response.data.error)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  function verifyEmailAccessCode(){
    try {
      const url = hostname + `/preregistration/verify/email?code=${code}`
      const body = {
        email: email,
        accessCode: emailAccessCode,
      }
      axios.post(url, body)
        .then(res => {
          if (res.data && res.data.accessToken) {
            const accessToken = res.data.accessToken
            setEmailAccessToken(accessToken)
            setEmailAccessCodeError('')
            setPhoneNumber('')
            setPhoneNumberError('')
            setPageIndex(pageIndex + 1)
          } else {
            setEmailAccessCodeError('Empty response')
          }
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error){
            setEmailAccessCodeError(error.response.data.error)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  function sendPhoneAccessCode(){
    try {
      const url = hostname + `/preregistration/phone/code?code=${code}`
      const body = {
        phone: phoneNumber,
      }
      axios.post(url, body)
        .then(res => {
          setPhoneNumberError('')
          setPhoneAccessCode('')
          setPhoneAccessCodeError('')
          setPageIndex(pageIndex + 1)
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error){
            setPhoneNumberError(error.response.data.error)
          }
        })
    } catch (error) {
      console.error(error)
    }

  }

  function register(){
    // TO DO: API request to register user
    try {
      const url = hostname + `/preregistration/verify/phone?code=${code}`
      const body = {
        phone: phoneNumber,
        accessCode: phoneAccessCode,
      }
      axios.post(url, body)
        .then(res => {
          if (res.data && res.data.accessToken){
            const phoneAccessToken = res.data.accessToken
            const registrationURL = hostname + `/account/register?code=${code}`
            const registrationBody = {
              firstname: firstname.trim(),
              lastname: lastname.trim(),
              username: username,
              email: email,
              password: password,
              phone: phoneNumber,
              emailAccessToken: emailAccessToken,
              phoneAccessToken: phoneAccessToken,
            }
            axios.post(registrationURL, registrationBody)
              .then(res => {
                setCookie('accountId', res.data.accountId)
                setCookie('hasToken', res.data.hasToken)
                setCookie('token', res.data.token)
                Router.push("/discovery")
              })
              .catch(error => {
                if (error.response && error.response.data && error.response.data.error){
                  setPhoneAccessCodeError(error.response.data.error)
                }
              })
          }
        })
        .catch(error => {
          if (error.response && error.response.data && error.response.data.error){
            setPhoneAccessCodeError(error.response.data.error)
          } else {
            console.error(error)
          }
        })
    } catch (error) {
      console.error(error)
    }
  }

  function back(){
    setPageIndex(pageIndex - 1)
  }

  return (
    <div className={registrationStyles.main} style={{backgroundImage: 'url(/images/clouds_v1.jpg)'}}>
      <div className={registrationStyles.modal}>
        <div className={registrationStyles.modalHeader}>
          <div className={registrationStyles.modalHeaderNavigationButton} onClick={() => {back()}}>
            {backButton}
          </div>
        </div>
        <div className={registrationStyles.modalTitle}>
          Sign Up
        </div>
        {(pageIndex==1) ?
          <div>
            <div className={registrationStyles.modalAccountCheckError}>{accountCheckError}</div>
            <form onSubmit={e => { e.preventDefault()}} className={registrationStyles.modalFormBody}>
              <div>
                <div className={registrationStyles.modalFormBodyLeftContainer}>
                  <div className={registrationStyles.modalFormBodyTitle}>First name</div>
                  <input className={registrationStyles.modalFormBodyInput} value={firstname} onChange={(event) => {setFirstname(event.target.value)}}></input>
                </div>
                <div className={registrationStyles.modalFormBodyRightContainer}>
                  <div className={registrationStyles.modalFormBodyTitle}>Last name</div>
                  <input className={registrationStyles.modalFormBodyInput} value={lastname} onChange={(event) => {setLastname(event.target.value)}}></input>
                </div>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Username</div>
                <input className={registrationStyles.modalFormBodyInput} value={username} onChange={(event) => {setUsername(event.target.value.toLowerCase().trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{usernameError}</div>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Email</div>
                <input className={registrationStyles.modalFormBodyInput} value={email} onChange={(event) => {setEmail(event.target.value.toLowerCase().trim())}}></input>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Password</div>
                <input className={registrationStyles.modalFormBodyInput} value={password} type={showPassword ? 'text' : 'password'} onChange={(event) => {setPassword(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormShowHidePassword} onClick={() => setShowPassword(prevType => !prevType)}>{showPassword ? 'hide password' : 'show password'}</div>
                <div className={registrationStyles.modalFormBodyFootnoteTitle}>Your Password must have:</div>
                <div className={registrationStyles.modalFormBodyFootnote} style={passwordLengthColor}> - At least 8 characters</div>
                <div className={registrationStyles.modalFormBodyFootnote} style={passwordCharactersColor}> - At least 1 of each: uppercase letter, lowercase letter, number, and special character</div>
              </div>
            </form>
            <button className={registrationStyles.modalFormButton} disabled={disbaleAccountFormCheckButton} onClick={() => {checkAccountForm()}}>Next</button>
          </div>
          :
          (pageIndex==2) ?
          <div>
            <form onSubmit={e => { e.preventDefault()}} className={registrationStyles.modalFormBody}>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div>An email has been sent to <b>{email}</b></div>
                <input className={registrationStyles.modalFormBodyInputAccessCode} placeholder="Enter 6-digit code" value={emailAccessCode} onChange={(event) => {setEmailAccessCode(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{emailAccessCodeError}</div>
              </div>
            </form>
            <button className={registrationStyles.modalFormButton} disabled={disbaleVerifyEmailAccessCodeButton} onClick={() => {verifyEmailAccessCode()}}>Next</button>
          </div>
          :
          (pageIndex==3) ?
          <div>
            <form onSubmit={e => { e.preventDefault()}} className={registrationStyles.modalFormBody}>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Verify Phone Number</div>
                <div className={registrationStyles.modalFormBodyUSPhone}>
                  US +1
                </div>
                <div className={registrationStyles.modalFormBodyLeftContainer}>
                  <input className={registrationStyles.modalFormBodyInput} value={phoneNumber} onChange={(event) => {setPhoneNumber(event.target.value.trim())}}></input>
                </div>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{phoneNumberError}</div>
              </div>
            </form>
            <div className={registrationStyles.modalFormButtonContainer}>
              <button className={registrationStyles.modalFormButton} disabled={disableSendCodeButton} onClick={() => {sendPhoneAccessCode()}}>Send Code</button>
            </div>
          </div>
          :
          <div>
            <form onSubmit={e => { e.preventDefault()}} className={registrationStyles.modalFormBody}>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div>A text message has been sent to <b>{phoneNumber}</b></div>
                <input className={registrationStyles.modalFormBodyInputAccessCode} placeholder="Enter 6-digit code" value={phoneAccessCode} onChange={(event) => {setPhoneAccessCode(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{phoneAccessCodeError}</div>
              </div>
            </form>
            <button className={registrationStyles.modalFormButton} disabled={disableRegisterButton} onClick={() => {register()}}>Register</button>
          </div>
        }
      </div>
    </div>
  )
}
