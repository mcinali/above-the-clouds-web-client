import React from 'react'
import Link from 'next/link'
import Router from "next/router"
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Discover() {
  return (
    <div className={commonStyles.container}>
      <header className={commonStyles.header}></header>
      <div id="leftPanel" className={discoveryStyles.leftPanel}>Hello</div>
      <div id="rightPanel" className={discoveryStyles.rightPanel}>Friend</div>
      <footer className={commonStyles.footer}>
        <a
          href="/old"
          target="_blank"
          rel="noopener noreferrer">
            About Us
        </a>
      </footer>
    </div>
  )
}

// TO DO:
// Header/Account component
//
