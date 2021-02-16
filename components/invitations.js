import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { createPictureURLFromArrayBufferString } from '../utilities'
import invitationsStyles from '../styles/Invitations.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Invitations(accountId, filterList, addInvitation, removeInvitation, queuedInvitationInSearch){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])

  function fetchSuggestions(text){
    try {
      const searchText = text.trim()
      setSearchText(searchText)
      const url = hostname+`/suggestions?accountId=${accountId}&text=${searchText}`
      if (Boolean(searchText)){
        axios.get(url)
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
          <img className={userStyles.image} src={createPictureURLFromArrayBufferString(queuedInvitationInSearch.profilePicture)}/>
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
        <input
          key='searchBar'
          value={searchText}
          placeholder={"Search by username, full name, or email"}
          onChange={(e) => fetchSuggestions(e.target.value)}
          className={invitationsStyles.searchBar}
        />
      }
      <div className={invitationsStyles.dropdown}>
        <div className={invitationsStyles.dropdownContent}>
          {searchResults.map((result, index) => {
            return (
              <button className={invitationsStyles.dropdownButton} key={index.toString()} onClick={function(){queueAccount(result)}}>
                <img className={userStyles.image} src={createPictureURLFromArrayBufferString(result.profilePicture)}/>
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
