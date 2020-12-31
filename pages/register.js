import React from 'react'
import styles from '../styles/Common.module.css'
import Link from 'next/link'
import Router from "next/router"
const { registerAccount } = require('../api/accounts')


export default function Register() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <a> Above the Clouds</a>
        </h1>
        <p className={styles.description}>A Space for Meaningful Conversations</p>
        <RegistrationForm></RegistrationForm>
      </main>

      <footer className={styles.footer}>
        <a
          href="/old"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Us
        </a>
      </footer>
    </div>
  )
}

class RegistrationForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      firstname: '',
      lastname: '',
      email: '',
      phone: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value.trim()})
  }

  handleSubmit(event) {
    event.preventDefault()
    const accountDetails = registerAccount({
      'username': this.state.username,
      'password': this.state.password,
      'email': this.state.email,
      'phone': this.state.phone,
      'firstname': this.state.firstname,
      'lastname': this.state.lastname,
    })
    Router.push("/discovery")
  }

  onRedirectCallback(appState) {
    history.push(appState?.returnTo || window.location.pathname);
  };

  render(){
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
        <input name="username" placeholder="username" value={this.state.username} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="password" placeholder="password" value={this.state.password} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="firstname" placeholder="firstname" value={this.state.firstname} onChange={this.handleChange} className={styles.inputNarrowLeft}/>
        <input name="lastname" placeholder="lastname" value={this.state.lastname} onChange={this.handleChange} className={styles.inputNarrowRight}/>
        <input name="email" placeholder="email" value={this.state.email} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="phone" placeholder="phone number" value={this.state.phone} onChange={this.handleChange} className={styles.inputWide}/>
        <p></p>
        <button type="submit" className={styles.registrationButton}>Register</button>
    </form>
    )
  }
}