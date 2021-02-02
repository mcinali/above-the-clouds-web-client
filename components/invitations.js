import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import invitationsStyles from '../styles/Invitations.module.css'
import userStyles from '../styles/Users.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Invitations(accountId, filterList, addInvitation, removeInvitation, disableOptions, queuedInvitationInSearch){
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])

  function fetchSuggestions(text){
    try {
      setSearchText(text.trim())
      const url = hostname+`/connections/${accountId}/suggestions`
      const params = {text: text}
      if (Boolean(text)){
        axios.get(url, {params: params})
             .then(res => {
               if (res.data){
                 const regex = /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/
                 const suggestions = filterSuggestions(res.data)
                 if (suggestions.length>0) {
                   setSearchResults(suggestions)
                 } else if (regex.test(text)){
                   const suggestions = [{"accountId":null,"email":text}]
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
      console.log(account)
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
        <div>
          {(queuedInvitationInSearch.accountId) ?
            <div className={userStyles.row}>
              <Image src='/bitmoji.png' width='40' height='40' className={userStyles.image} />
              <div className={userStyles.userInfo}>
                <a className={userStyles.username}>{queuedInvitationInSearch.username} </a>
                <a className={userStyles.name}>{`(${queuedInvitationInSearch.firstname} ${queuedInvitationInSearch.lastnameInitial})`}</a>
              </div>
              <div className={userStyles.rightContainer}>
                <div className={userStyles.status}>{queuedInvitationInSearch.status}</div>
                <button className={userStyles.discardButton} onClick={function(){discardAccount()}}>x</button>
              </div>
            </div>
            :
            <div className={userStyles.row}>
              <div className={userStyles.userInfo}>
                <a className={userStyles.username}>{queuedInvitationInSearch.email} </a>
              </div>
              <div className={userStyles.rightContainer}>
                <div className={userStyles.status}>{queuedInvitationInSearch.status}</div>
                <button className={userStyles.discardButton} onClick={function(){discardAccount()}}>x</button>
              </div>
            </div>
          }
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
                (result.accountId) ?
                  <button className={invitationsStyles.dropdownButton} key={index.toString()} onClick={function(){queueAccount(result)}} disabled={!(disableOptions) ? disableOptions : Boolean(result.status)}>
                    <Image src='/bitmoji.png' width='30' height='30' className={userStyles.image} />
                    <div className={userStyles.userInfo}>
                      <a className={userStyles.username}>{result.username} </a>
                      <a className={userStyles.name}>{`(${result.firstname} ${result.lastnameInitial})`}</a>
                    </div>
                    <div className={userStyles.rightContainer}>
                      <a className={userStyles.status}>{result.status}</a>
                    </div>
                  </button>
                  :
                  <div className={invitationsStyles.dropdownRow} key={index.toString()} onClick={function(){queueAccount(result)}}>
                    <div className={userStyles.userInfo}>
                      <a className={userStyles.username}>{result.email} </a>
                      <a className={userStyles.name}>(Send Email Invite)</a>
                    </div>
                  </div>
            )
          })}
        </div>
      </div>
    </div>
  )

}
