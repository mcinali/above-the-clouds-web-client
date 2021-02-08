import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from "next/router"
import Cookies from 'universal-cookie'
import accountSetupStyles from '../../styles/AccountSetup.module.css'
const { hostname } = require('../../config')
const axios = require('axios')

export default function AccountSetup() {
  const [index, setIndex] = useState(1)
  const [profilePic, setProfilePic] = useState('/images/default_profile_pic.jpg')
  const [disableTrashProfilePic, setDisableTrashProfilePic] = useState(true)
  const [disableNextButton, setDisableNextButton] = useState(true)

  const upload = () => {
    document.getElementById("file-upload").click()
  }

  const handleChange = () => {
    const picObject = URL.createObjectURL(event.target.files[0])
    setProfilePic(picObject)
    setDisableTrashProfilePic(false)
    setDisableNextButton(false)
  }

  const trashImage = () => {
    document.getElementById("file-upload").value = ""
    setProfilePic('/images/default_profile_pic.jpg')
    setDisableTrashProfilePic(true)
    setDisableNextButton(true)
  }

  const saveProfilePic = () => {
    // TO DO: send request to backed to store profile pic for account
    setIndex(index + 1)
  }

  const skip = () => {
    setIndex(index + 1)
  }

  const back = () => {
    setIndex(index - 1)
  }

  useEffect(() => {
    console.log(profilePic)
    console.log(disableTrashProfilePic)
    console.log(disableNextButton)
  }, [profilePic, disableTrashProfilePic, disableNextButton])


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
              <img className={accountSetupStyles.modalProfilePic} src={profilePic}/>
              <div className={accountSetupStyles.modalProfilePicButtonContainer}>
                <label onClick={upload} className={accountSetupStyles.modalProfilePicUploadButton}>
                  Upload
                </label>
                <input id="file-upload" hidden type="file" onChange={handleChange}/>
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
              </div>
            </div>
            <div className={accountSetupStyles.modalDoneButtonContainer}>
              <button className={accountSetupStyles.modalDoneButton}>Done</button>
            </div>
          </div>
        }

      </div>
    </div>
  )
}
