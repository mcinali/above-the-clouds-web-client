export function createPictureURLFromArrayBufferString(arrayBufferString){
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
