module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/discovery',
        permanent: false,
      }
    ]
  },
}
