import React, { useEffect, useState } from 'react'
import { createPictureURLFromArrayBufferString } from '../utilities'
import followsStyles from '../styles/Follows.module.css'
import userStyles from '../styles/Users.module.css'
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={followsStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function FollowingSuggestions(hostname, accountId, accessToken){
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    const url = hostname + `/follows/suggestions?accountId=${accountId}`
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.get(url, headers)
      .then(res => {
        setSuggestions(res.data.suggestions)
      })
      .catch(error => console.error(error))
  }, [])

  function follow(suggestions, index){
    const suggestion = suggestions[index]
    const url = hostname + `/follows/follow`
    const body = {
      accountId: accountId,
      followingAccountId: suggestion.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newSuggestions = suggestions.map((suggestion, suggestionIndex) => {
          if (index==suggestionIndex){
            suggestion.following = true
            return suggestion
          } else {
            return suggestion
          }
        })
        setSuggestions(newSuggestions)
      })
      .catch(error => console.error(error))
  }

  function unfollow(suggestions, index){
    const suggestion = suggestions[index]
    const url = hostname + `/follows/unfollow`
    const body = {
      accountId: accountId,
      followingAccountId: suggestion.accountId,
    }
    const headers = {
      headers: {
        'token': accessToken,
      }
    }
    axios.post(url, body, headers)
      .then(res => {
        const newSuggestions = suggestions.map((suggestion, suggestionIndex) => {
          if (index==suggestionIndex){
            suggestion.following = false
            return suggestion
          } else {
            return suggestion
          }
        })
        setSuggestions(newSuggestions)
      })
      .catch(error => console.error(error))
  }

  return (
    <div className={followsStyles.container}>
      <div className={followsStyles.title}>Suggested Accounts:</div>
      {suggestions.map((suggestion, index) => {
        return (
          <div key={index.toString()} className={followsStyles.row}>
            <Image src={suggestion.profilePicture}/>
            <div className={followsStyles.userInfo}>
              <a className={followsStyles.name}>{`${suggestion.firstname} ${suggestion.lastname}`}</a>
              <a className={followsStyles.username}>{`${suggestion.username}`} </a>
            </div>
            {
              (suggestion.following) ?
              <button className={followsStyles.buttonUnfollow} onClick={function(){unfollow(suggestions, index)}}>Following</button>
              :
              <button className={followsStyles.buttonFollow} onClick={function(){follow(suggestions, index)}}>Follow</button>
            }
          </div>
        )
      })}
    </div>
  )
}
