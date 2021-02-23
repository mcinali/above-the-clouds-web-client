import Cookies from 'universal-cookie'

function createPictureURLFromArrayBufferString(arrayBufferString){
  try {
    if (!Boolean(arrayBufferString)){
      return '/images/default_profile_pic.jpg'
    }
    const arrayBuffer = arrayBufferString.split(',')
    const uint8ArrayBuffer = new Uint8Array(arrayBuffer)
    const blob = new Blob( [ uint8ArrayBuffer ] )
    const profilePictureURL = URL.createObjectURL(blob)
    return profilePictureURL
  } catch (error) {
    console.error(error)
    return '/images/default_profile_pic.jpg'
  }
}

function setCookie(name, data){
  try {
    const cookie = new Cookies()
    const age = 60 * 60 * 24 * 365
    cookie.set(name, data, {
      path: '/',
      maxAge: age,
    })
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  createPictureURLFromArrayBufferString,
  setCookie,
}
