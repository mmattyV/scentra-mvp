/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'amplify-awsamplifygen2-ma-scentrastoragebucket0c3c-rgnhpqwpo7xa.s3.us-west-2.amazonaws.com',
      's3.us-west-2.amazonaws.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
