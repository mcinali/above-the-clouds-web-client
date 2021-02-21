const env = process.env.RUNTIME_ENV
const localhost = 'http://localhost:8080'
const gcphost = 'https://api.abovethecloudsapp.com'
const hostname = (env=='prod') ? gcphost : localhost

module.exports = {
  hostname,
}
