import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Cookies from 'universal-cookie'
import commonStyles from '../styles/Common.module.css'
import registrationStyles from '../styles/Registration.module.css'
const { hostname } = require('../config')
const axios = require('axios')


export default function Register() {
  const [pageIndex, setPageIndex] = useState(1)
  const [backButton, setBackButton] = useState('')

  const [disableNextButton, setDisbaleNextButton] = useState(true)
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

  const [accountCheckError, setAccountCheckError] = useState('')

  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneNumberError, setPhoneNumberError] = useState('')

  const [accessCode, setAccessCode] = useState('')
  const [accessCodeError, setAccessCodeError] = useState('')

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
    } else if (password.length >= 8 && password.length <=20){
      setPasswordLengthColor({'color':'#2E8B57'})
    } else {
      setPasswordLengthColor({'color':'#cb4154'})
    }

    const regex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,32}$')
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
    if (Boolean(firstname) && Boolean(lastname) && Boolean(username) && Boolean(email) && Boolean(password) && !Boolean(usernameError) && !passwordError){
      setDisbaleNextButton(false)
    } else {
      setDisbaleNextButton(true)
    }
  }, [firstname, lastname, username, email, password, usernameError, passwordError])

  useEffect(() => {
    try {
      const phoneNumberCheckNumber = Number(phoneNumber)
      const phoneNumberCheckInteger = phoneNumberCheckNumber % 1
      if (Number.isNaN(phoneNumberCheckNumber) || phoneNumberCheckInteger!=0){
        setPhoneNumberError('Enter a valid phone number')
      } else {
        setPhoneNumberError('')
      }
      if ((phoneNumberCheckNumber >= 2010000000) && (phoneNumberCheckNumber <= 9899999999)){
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
      const accessCodeLength = accessCode.length
      const accessCodeNumber = Number(accessCode)
      const accessCodeInteger = accessCodeNumber % 1
      if (Number.isNaN(accessCodeNumber) || accessCodeInteger!=0){
        setAccessCodeError('Enter a valid 6-digit access code')
      } else {
        setAccessCodeError('')
      }
      if (accessCodeLength==6){
        setDisableRegisterButton(false)
      } else {
        setDisableRegisterButton(true)
      }
    } catch (error) {
      console.error(error)
      setDisableRegisterButton(true)
    }
  }, [accessCode])

  useEffect(() => {
    if (pageIndex > 1){
      setBackButton('< Back')
    } else {
      setBackButton('')
    }
  }, [pageIndex])

  function next(){
    // TO DO: Check if account already exists
    const url = hostname + '/account/check'
    const body = {
      firstname: firstname,
      lastname: lastname,
      username: username,
      email: email,
      password: password,
    }
    axios.post(url, body)
          .then(res => {
            setAccountCheckError('')
            setPageIndex(pageIndex + 1)
          })
          .catch(error => {
            if (error.response && error.response.data && error.response.data.errors){
              setAccountCheckError(error.response.data.errors[0])
            }
          })
  }

  function sendAccessCode(){
    // TO DO: API request to text user access code
    setPageIndex(pageIndex + 1)
  }

  function register(){
    // TO DO: API request to register user
  }

  function back(){
    setPageIndex(pageIndex - 1)
  }

  return (
    <div className={registrationStyles.main} style={{backgroundImage: 'url(/images/clouds_v1.jpg)'}}>
      Above the Clouds
      <div className={registrationStyles.modal}>
        <div className={registrationStyles.modalHeader}>
          <div className={registrationStyles.modalHeaderNavigationButton} onClick={() => {back()}}>
            {backButton}
          </div>
          <div className={registrationStyles.modalHeaderPageIndex}>
            Page {pageIndex} of 3
          </div>
        </div>
        <div className={registrationStyles.modalTitle}>
          Sign Up
        </div>
        {(pageIndex==1) ?
          <div>
            <div className={registrationStyles.modalAccountCheckError}>{accountCheckError}</div>
            <form className={registrationStyles.modalFormBody}>
              <div>
                <div className={registrationStyles.modalFormBodyLeftContainer}>
                  <div className={registrationStyles.modalFormBodyTitle}>First name</div>
                  <input className={registrationStyles.modalFormBodyInput} value={firstname} onChange={(event) => {setFirstname(event.target.value.trim())}}></input>
                </div>
                <div className={registrationStyles.modalFormBodyRightContainer}>
                  <div className={registrationStyles.modalFormBodyTitle}>Last name</div>
                  <input className={registrationStyles.modalFormBodyInput} value={lastname} onChange={(event) => {setLastname(event.target.value.trim())}}></input>
                </div>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Username</div>
                <input className={registrationStyles.modalFormBodyInput} value={username} onChange={(event) => {setUsername(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{usernameError}</div>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Email</div>
                <input className={registrationStyles.modalFormBodyInput} value={email} onChange={(event) => {setEmail(event.target.value.trim())}}></input>
              </div>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Password</div>
                <input className={registrationStyles.modalFormBodyInput} value={password} onChange={(event) => {setPassword(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteTitle}>Your Password must have:</div>
                <div className={registrationStyles.modalFormBodyFootnote} style={passwordLengthColor}> - 8 to 20 characters</div>
                <div className={registrationStyles.modalFormBodyFootnote} style={passwordCharactersColor}> - At least 1 of each: uppercase letter, lowercase letter, number, and special character</div>
              </div>
            </form>
            <button className={registrationStyles.modalFormButton} disabled={disableNextButton} onClick={() => {next()}}>Next</button>
          </div>
          :
          (pageIndex==2) ?
          <div>
            <form className={registrationStyles.modalFormBody}>
              <div className={registrationStyles.modalFormBodyContainer}>
                <div className={registrationStyles.modalFormBodyTitle}>Phone</div>
                <div>
                  <div className={registrationStyles.modalFormBodyUSPhone}>
                    US +1
                  </div>
                  <div className={registrationStyles.modalFormBodyLeftContainer}>
                    <input className={registrationStyles.modalFormBodyInput} value={phoneNumber} onChange={(event) => {setPhoneNumber(event.target.value.trim())}}></input>
                  </div>
                  <button className={registrationStyles.modalFormSideButton} disabled={disableSendCodeButton} onClick={() => {sendAccessCode()}}>Send Code</button>
                </div>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{phoneNumberError}</div>
              </div>
            </form>
          </div>
          :
          <div>
            <form className={registrationStyles.modalFormBody}>
              <div className={registrationStyles.modalFormBodyContainer}>
                <input className={registrationStyles.modalFormBodyInputAccessCode} placeholder="Enter 6-digit code" value={accessCode} onChange={(event) => {setAccessCode(event.target.value.trim())}}></input>
                <div className={registrationStyles.modalFormBodyFootnoteError}>{accessCodeError}</div>
                <button className={registrationStyles.modalFormButton} disabled={disableRegisterButton} onClick={() => {register()}}>Register</button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  )
}
