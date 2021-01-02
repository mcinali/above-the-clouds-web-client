import React, { useState } from 'react'
import styles from '../styles/Common.module.css'
import Link from 'next/link'
import Router from "next/router"
const { registerAccount, validateAccountFields } = require('../api/accounts')


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
      <p className={styles.textlink}>
        <Link href="/login">Already have an account? Login here</Link>
      </p>

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
      phone: '',
      validationErrors: new Array(),
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validateForm = this.validateForm.bind(this)
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value.trim()})
  }

  validateForm(event){
    let valid = true
    this.setState(prevState => ({
      validationErrors: new Array()
    }))
    if (!Boolean(this.state.username)){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a username']
      }))
    }
    if (this.state.password.length<8){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a password between 8-20 characters with at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character']
      }))
    }
    if (!Boolean(this.state.firstname)){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a first name']
      }))
    }
    if (!Boolean(this.state.lastname)){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a last name']
      }))
    }
    if (!Boolean(this.state.lastname)){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a valid email address']
      }))
    }
    if (!Boolean(this.state.lastname)){
      valid = false
      this.setState(prevState => ({
        validationErrors: [...prevState.validationErrors, 'Please enter a valid (10-digit) US phone number']
      }))
    }
    return valid
  }

  handleSubmit(event) {
    event.preventDefault()
    const valid = this.validateForm()
    if (!valid){
      return
    } else {
      const accountDetails = registerAccount({
        'username': this.state.username,
        'password': this.state.password,
        'email': this.state.email,
        'phone': this.state.phone,
        'firstname': this.state.firstname,
        'lastname': this.state.lastname,
      })
    }
    Router.push("/discovery")
  }

  render(){
    console.log(this.state.validationErrors)
    return (
      <form onSubmit={this.handleSubmit} className={styles.form}>
        <input name="username" placeholder="username" value={this.state.username} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="password" placeholder="password" value={this.state.password} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="firstname" placeholder="firstname" value={this.state.firstname} onChange={this.handleChange} className={styles.inputNarrowLeft}/>
        <input name="lastname" placeholder="lastname" value={this.state.lastname} onChange={this.handleChange} className={styles.inputNarrowRight}/>
        <input name="email" placeholder="email" value={this.state.email} onChange={this.handleChange} className={styles.inputWide}/>
        <input name="phone" placeholder="phone number" value={this.state.phone} onChange={this.handleChange} className={styles.inputWide}/>
        <button type="submit" className={styles.registrationButton}>Create Account</button>
        <ul>{this.state.validationErrors.map((item,index) => <li key={index.toString()} className={styles.error}>{item}</li>)}</ul>
    </form>
    )
  }
}
