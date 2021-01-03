import React from 'react'
import Link from 'next/link'
import Router from "next/router"
import commonStyles from '../styles/Common.module.css'
import discoveryStyles from '../styles/Discovery.module.css'
const { hostname } = require('../config')
const axios = require('axios')

export default function Discover() {
  return (
    <div id="container" className={commonStyles.container}>
      <header className={commonStyles.header}></header>
      <body></body>
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
