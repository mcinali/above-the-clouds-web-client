import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Router from 'next/router'
import Cookies from 'universal-cookie'
import FollowingSuggestions from '../../components/followingSuggestions'
import accountSetupStyles from '../../styles/AccountSetup.module.css'
import followsStyles from '../../styles/Follows.module.css'
const { hostname } = require('../../config')
const axios = require('axios')

export async function getServerSideProps({ req, res, query }) {
  try {
    // Authenticate accountId + token before serving page
    // Get accountId + token from cookies
    const cookie = new Cookies(req.headers.cookie)
    const accountId = cookie.get('accountId')
    const token = cookie.get('token')
    // Add accountId as query param + token as header
    const url = hostname + `/auth/validate?accountId=${accountId}`
    const headers = {
      headers: {
        'token': token,
      }
    }
    // Check for valid token
    const promise = await axios.get(url, headers)
    if (promise.status != 200){
      res.writeHead(302, {
        Location: "login",
      })
      res.end()
    }
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token } }
  } catch (error) {
    // console.error(error)
    res.writeHead(302, {
      Location: "discovery",
    });
    res.end()
  }
}

export default function AccountSetup({ accountId, accessToken }) {
  const [index, setIndex] = useState(1)
  const [profilePicObject, setProfilePicObject] = useState({})
  const [profilePicURL, setProfilePicURL] = useState('/images/default_profile_pic.jpg')
  const [disableTrashProfilePic, setDisableTrashProfilePic] = useState(true)
  const [disableNextButton, setDisableNextButton] = useState(true)
  const [suggestions, setSuggestions] = useState([])

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
        'Content-Type': 'multipart/form-data',
        'token': accessToken,
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
    if (index==1){
      document.getElementById("index1").style.display = "block"
      document.getElementById("index2").style.display = "none"
    } else {
      document.getElementById("index1").style.display = "none"
      document.getElementById("index2").style.display = "block"
    }
  }, [index])

  return (
    <div className={accountSetupStyles.main}>
      <div className={accountSetupStyles.modal}>
        <div id="index1">
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
        <div id="index2">
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
            {FollowingSuggestions(accountId, accessToken)}
          </div>
          <div className={accountSetupStyles.modalDoneButtonContainer}>
            <button className={accountSetupStyles.modalDoneButton} onClick={done}>Done</button>
          </div>
        </div>
      </div>
    </div>
  )
}
