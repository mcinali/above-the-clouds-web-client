import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import Cookies from 'universal-cookie'
import FollowingSuggestions from '../../components/followingSuggestions'
import accountSetupStyles from '../../styles/AccountSetup.module.css'
import followsStyles from '../../styles/Follows.module.css'
const { hostname } = require('../../config')
const axios = require('axios')

export default function AccountSetup() {
  const [index, setIndex] = useState(1)
  const [profilePicObject, setProfilePicObject] = useState({})
  const [profilePicURL, setProfilePicURL] = useState('/images/default_profile_pic.jpg')
  const [disableTrashProfilePic, setDisableTrashProfilePic] = useState(true)
  const [disableNextButton, setDisableNextButton] = useState(true)
  const [suggestions, setSuggestions] = useState([])

  const cookie = new Cookies()
  const accountId = cookie.get('accountId')
  const followingSuggestions = FollowingSuggestions(accountId)

  function createPictureURLFromArrayBufferString(arrayBufferString){
    try {
      const arrayBuffer = arrayBufferString.split(',')
      const uint8ArrayBuffer = new Uint8Array(arrayBuffer)
      const blob = new Blob( [ uint8ArrayBuffer ] )
      const profilePictureURL = URL.createObjectURL(blob)
      return profilePictureURL
    } catch (error) {
      console.error(error)
      return '/images/default_profile_pic.jpg'
    }
  }

  useEffect(() => {
    const url = hostname + `/follows/following/suggestions/onboarding/${accountId}`
    axios.get(url)
      .then(res => {
        const suggestionsResponse = res.data.suggestions
        const suggestionsFrmtd = suggestionsResponse.map(suggestion => {
          const profilePictureURL = (suggestion.profilePicture) ? createPictureURLFromArrayBufferString(suggestion.profilePicture) : '/images/default_profile_pic.jpg'
          return {
            accountId: suggestion.accountId,
            firstname: suggestion.firstname,
            lastname: suggestion.lastname,
            username: suggestion.username,
            profilePicture: profilePictureURL,
            following: false,
          }
        })
        setSuggestions(suggestionsFrmtd)
      })
  }, [])

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
    console.log(suggestions)
  }, [suggestions])

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
            <div className={accountSetupStyles.modalHeader}>
              <div className={accountSetupStyles.modalHeaderNavigationButton} onClick={back}>
                {"< back"}
              </div>
            </div>
            <div className={accountSetupStyles.modalTitle}>
              Find people to follow!
            </div>
            <div className={accountSetupStyles.modalSubtitle}>
              Discover conversations involving people you follow and people they follow.
            </div>
            <div className={accountSetupStyles.modalFollowSuggestionsContainer}>
              {followingSuggestions}
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
