import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import Cookies from 'universal-cookie'
import accountSetupStyles from '../../styles/AccountSetup.module.css'
const { hostname } = require('../../config')
const axios = require('axios')

export default function AccountSetup() {
  const [index, setIndex] = useState(1)
  const [profilePicObject, setProfilePicObject] = useState({})
  const [profilePicURL, setProfilePicURL] = useState('/images/default_profile_pic.jpg')
  const [disableTrashProfilePic, setDisableTrashProfilePic] = useState(true)
  const [disableNextButton, setDisableNextButton] = useState(true)
  const cookie = new Cookies()
  const accountId = cookie.get('accountId')

  const upload = () => {
    document.getElementById('file-upload').click()
  }

  const handleChange = () => {
    const picObject = event.target.files[0]
    const picObjectURL = URL.createObjectURL(picObject)
    setProfilePicObject(picObject)
    setProfilePicURL(picObjectURL)
    setDisableTrashProfilePic(false)
    setDisableNextButton(false)
  }

  const trashImage = () => {
    document.getElementById('file-upload').value = ''
    setProfilePicObject({})
    setProfilePicURL('/images/default_profile_pic.jpg')
    setDisableTrashProfilePic(true)
    setDisableNextButton(true)
  }

  const saveProfilePic = () => {
    // TO DO: send request to backed to store profile pic for account
    const url = hostname + '/account/profilePicture'
    const formData = new FormData()
    formData.append('file', profilePicObject, profilePicObject.name)
    formData.append('accountId', accountId)
    axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        const arrayBufferString = res.data.profilePicture
        const arrayBuffer = arrayBufferString.split(',')
        const uint8ArrayBuffer = new Uint8Array(arrayBuffer)
        const blob = new Blob( [ uint8ArrayBuffer ] )
        const imageURL = URL.createObjectURL(blob)
        setProfilePicURL(imageURL)
        setIndex(index + 1)
      })
      .catch(error => console.error(error))
  }

  const skip = () => {
    setIndex(index + 1)
  }

  const back = () => {
    setIndex(index - 1)
  }

  const done = () => {
    Router.push("/discovery")
  }

  useEffect(() => {
    console.log(profilePicURL)
  }, [profilePicURL])

  return (
    <div className={accountSetupStyles.main}>
      <div className={accountSetupStyles.modal}>
        {
          (index==1)
          ?
          <div>
            <div className={accountSetupStyles.modalTitle}>
              Welcome <b>{}</b>!
            </div>
            <div className={accountSetupStyles.modalSubtitle}>
              Upload a profile picture for your account:
            </div>
            <div className={accountSetupStyles.modalProfilePicContainer}>
              <div className={accountSetupStyles.modalProfilePicTrashButtonContainer}>
                <button className={accountSetupStyles.modalProfilePicTrashButton} disabled={disableTrashProfilePic} onClick={trashImage}>
                  x
                </button>
              </div>
              <img className={accountSetupStyles.modalProfilePic} src={profilePicURL}/>
              <div className={accountSetupStyles.modalProfilePicButtonContainer}>
                <label onClick={upload} className={accountSetupStyles.modalProfilePicUploadButton}>
                  Upload
                </label>
                <input id='file-upload' hidden type='file' accept='.png,.jpg,.jpeg,.ico' onChange={handleChange}/>
              </div>
            </div>
            <div className={accountSetupStyles.modalNavigationButtonContainer}>
              <button className={accountSetupStyles.modalNextButton} disabled={disableNextButton} onClick={saveProfilePic}>
                Next
              </button>
              <div className={accountSetupStyles.modalSkipButton} onClick={skip}>
                Skip
              </div>
            </div>
          </div>
          :
          <div>
            <div className={accountSetupStyles.modalTitle}>
              Find people to follow!
            </div>
            <div className={accountSetupStyles.modalSubtitle}>
              Discover conversations involving people you follow and people they follow.
            </div>
            <div className={accountSetupStyles.modalFollowSuggestionsContainer}>
              <div className={accountSetupStyles.modalFollowSuggestions} onClick={back}>
                back
                <img className={accountSetupStyles.modalProfilePic} src={profilePicURL}/>
              </div>
            </div>
            <div className={accountSetupStyles.modalDoneButtonContainer}>
              <button className={accountSetupStyles.modalDoneButton} onClick={done}>Done</button>
            </div>
          </div>
        }

      </div>
    </div>
  )
}
