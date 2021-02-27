import React, { useEffect, useState, useCallback } from 'react'
import { createPictureURLFromArrayBufferString } from '../utilities'
import invitationsStyles from '../styles/Invitations.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

const Image = React.memo(function Image({ src }) {
  return <img className={userStyles.image} src={createPictureURLFromArrayBufferString(src)}/>
})

export default function Invitations(hostname, accountId, accessToken, filterList, addInvitation, removeInvitation, queuedInvitationInSearch){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])

  function fetchSuggestions(text){
    try {
      setSearchText(text)
      const searchText = text.trim()
      const url = hostname+`/suggestions?accountId=${accountId}&text=${searchText}`
      const headers = {
        headers: {
          'token': accessToken,
        }
      }
      if (Boolean(searchText)){
        axios.get(url, headers)
             .then(res => {
               if (res.data){
                 const suggestions = filterSuggestions(res.data)
                 if (suggestions.length>0) {
                   setSearchResults(suggestions)
                 } else {
                   setSearchResults([])
                 }
             }})
             .catch(error => {
               console.error(error)
             })
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (Object.keys(queuedInvitationInSearch).length==0){
      document.getElementById('loader').style.display = 'none'
    }
  }, [queuedInvitationInSearch])

  useEffect(() => {
    if (document.getElementById('loader')){
      document.getElementById('loader').style.display = 'block'
    }
    const timeOutId = setTimeout(() => {
      fetchSuggestions(searchText)
    }, 1000)
    return () => {
      clearTimeout(timeOutId)
    }
  }, [searchText])

  useEffect(() => {
    if (document.getElementById('loader')){
      document.getElementById('loader').style.display = 'none'
    }
  }, [searchResults])

  function filterSuggestions(suggestions){
    try {
      const accounts = filterList.map(filterItem => filterItem.accountId)
      const filtrdSuggestions = suggestions.filter(suggestion => {
        if((!accounts.includes(suggestion.accountId))&&(suggestion.accountId!=accountId)) {return suggestion}
      })
      return filtrdSuggestions.splice(0,5)
    } catch (error) {
      console.error(error)
    }
  }

  function queueAccount(account){
    try {
      addInvitation(account)
      setSearchText('')
      setSearchResults([])
      return
    } catch (error) {
      console.error(error)
    }
  }

  function discardAccount(){
    try {
      removeInvitation()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      {(Object.keys(queuedInvitationInSearch).length>0) ?
        <div className={userStyles.row}>
          <Image src={queuedInvitationInSearch.profilePicture}/>
          <div className={userStyles.userInfo}>
            <a className={userStyles.name}>{`${queuedInvitationInSearch.firstname} ${queuedInvitationInSearch.lastname}`}</a>
            <a className={userStyles.username}>{queuedInvitationInSearch.username} </a>
          </div>
          <div className={userStyles.rightContainer}>
            <a className={userStyles.status}>{(queuedInvitationInSearch.following) ? '(Following)': ''}</a>
          </div>
          <div className={userStyles.rightContainer}>
            <button className={invitationsStyles.removeInviteeButton} onClick={function(){discardAccount()}}>Remove</button>
          </div>
        </div>
        :
        <div className={invitationsStyles.wrapper}>
          <div id='loader' className={invitationsStyles.loader}></div>
          <input
            key='searchBar'
            value={searchText}
            placeholder={"Search by username, full name, or email"}
            onChange={(e) => setSearchText(e.target.value)}
            className={invitationsStyles.searchBar}
          />
        </div>
      }
      <div className={invitationsStyles.dropdown}>
        <div className={invitationsStyles.dropdownContent}>
          {searchResults.map((result, index) => {
            return (
              <button className={invitationsStyles.dropdownButton} key={index.toString()} onClick={function(){queueAccount(result)}}>
                <Image src={result.profilePicture}/>
                <div className={userStyles.userInfo}>
                  <a className={userStyles.name}>{`${result.firstname} ${result.lastname}`}</a>
                  <a className={userStyles.username}>{result.username} </a>
                </div>
                <div className={userStyles.rightContainer}>
                  <a className={userStyles.status}>{(result.following) ? '(Following)': ''}</a>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

}
