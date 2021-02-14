import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import followsStyles from '../styles/Follows.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function FollowingSuggestions(accountId){
  const [suggestions, setSuggestions] = useState([])

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
    const url = hostname + `/follows/suggestions/${accountId}`
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
        console.log(suggestionsFrmtd)
        setSuggestions(suggestionsFrmtd)
      })
      .catch(error => console.error(error))
  }, [])

  function follow(suggestion, index){
    const url = hostname + `/follows/follow`
    const body = {
      accountId: suggestion.accountId,
      followerAccountId: accountId,
    }
    axios.post(url, body)
      .then(res => {
        const newSuggestion = {
          accountId: suggestion.accountId,
          firstname: suggestion.firstname,
          lastname: suggestion.lastname,
          username: suggestion.username,
          profilePicture: suggestion.profilePicture,
          following: true,
        }
        const newSuggestions = suggestions.map((oldSuggestion, mapIndex) => {
          if (index===mapIndex){
            return newSuggestion
          } else {
            return oldSuggestion
          }
        })
        setSuggestions(newSuggestions)
      })
      .catch(err => console.error(error))
  }

  function unfollow(suggestion, index){
    const url = hostname + `/follows/unfollow`
    const body = {
      accountId: suggestion.accountId,
      followerAccountId: accountId,
    }
    axios.post(url, body)
      .then(res => {
        const newSuggestion = {
          accountId: suggestion.accountId,
          firstname: suggestion.firstname,
          lastname: suggestion.lastname,
          username: suggestion.username,
          profilePicture: suggestion.profilePicture,
          following: false,
        }
        const newSuggestions = suggestions.map((oldSuggestion, mapIndex) => {
          if (index===mapIndex){
            return newSuggestion
          } else {
            return oldSuggestion
          }
        })
        setSuggestions(newSuggestions)
      })
      .catch(err => console.error(error))
  }

  return (
    <div>
      <div className={followsStyles.title}>Suggested Accounts:</div>
      {suggestions.map((suggestion, index) => {
        return (
          <div key={index.toString()} className={followsStyles.row}>
            <img className={followsStyles.image} src={suggestion.profilePicture}/>
            <div className={followsStyles.userInfo}>
              <a className={followsStyles.name}>{`${suggestion.firstname} ${suggestion.lastname}`}</a>
              <a className={followsStyles.username}>{`${suggestion.username}`} </a>
            </div>
            {
              (suggestion.following) ?
              <button className={followsStyles.buttonUnfollow} onClick={function(){unfollow(suggestion, index)}}>Unfollow</button>
              :
              <button className={followsStyles.buttonFollow} onClick={function(){follow(suggestion, index)}}>Follow</button>
            }
          </div>
        )
      })}
    </div>
  )
}
