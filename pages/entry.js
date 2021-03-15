import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import entryStyles from '../styles/Entry.module.css'
import commonStyles from '../styles/Common.module.css'
import Cookies from 'universal-cookie'
import Header from '../components/header'
const uuid = require('uuid')
import { setCookie } from '../utilities'
const { hostname } = require('../config')
const axios = require('axios')

export async function getServerSideProps({ req, res, query }) {
  try {
    // Authenticate accountId + token before serving page
    // Get accountId + token from cookies
    const cookie = new Cookies(req.headers.cookie)
    const accountId = cookie.cookies.accountId
    const token = cookie.cookies.token
    const session = (Boolean(cookie.cookies.session)) ? cookie.cookies.session : null
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
      res.writeHead(307, { Location: '/landing' }).end()
      return { props: {ok: false, reason: 'Access not permitted' } }
    }
    // Pass in props to react function
    return { props: { accountId: accountId, accessToken: token, hostname: hostname, session: session } }
  } catch (error) {
    res.writeHead(307, { Location: '/landing' }).end()
    return { props: {ok: false, reason: 'Issues accessing page' } }
  }
}


export default function Entry({ hostname, accountId, accessToken, session }) {
  
  useEffect(() => {
    document.title = 'Above the Clouds'
    if (!Boolean(session)){
      const hrsToExpiration = 6
      setCookie('session', uuid.v4(), hrsToExpiration)
    }
  }, [])

  function newStream(){
    try {
      Router.push("/discovery?newStreamModal=true")
    } catch (error) {
      console.error(error)
    }
  }

  function discovery(){
    try {
      Router.push("/discovery")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className={entryStyles.main} style={{backgroundImage: 'url(/images/clouds_v1.jpg)'}}>
      {Header(hostname, accountId, accessToken)}
      <div>
        <div className={entryStyles.modal}>
          <div className={entryStyles.title}>Welcome to
            <a> Above the Clouds!</a>
          </div>
          <div className={entryStyles.cardContainer}>
            <button className={entryStyles.card} onClick={function(){newStream()}}>
              <div className={entryStyles.cardTitle}> <a>Start</a> a stream</div>
              <div className={entryStyles.cardDescription}>Start a new stream, invite friends, and hang out until your followers and/or invitees to join you.</div>
            </button>
            <button className={entryStyles.card} onClick={function(){discovery()}}>
              <div className={entryStyles.cardTitle}><a>Discover</a> streams</div>
              <div className={entryStyles.cardDescription}>
                Discover your followers streams and streams you've been invited to.
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
