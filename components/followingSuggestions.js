import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { createPictureURLFromArrayBufferString } from '../utilities'
import followsStyles from '../styles/Follows.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function FollowingSuggestions(accountId){
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const url = hostname + `/follows/suggestions/${accountId}`
    axios.get(url)
      .then(res => {
        setSuggestions(res.data.suggestions)
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
            <img className={followsStyles.image} src={createPictureURLFromArrayBufferString(suggestion.profilePicture)}/>
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
