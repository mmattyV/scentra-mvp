import { Amplify } from 'aws-amplify';
import awsconfig from '../../aws-exports';

// Configure AWS Amplify
// This needs to be run on the client side only, so we use a function to initialize it
export function configureAmplify() {
  if (typeof window !== 'undefined') {
    Amplify.configure(awsconfig);
  }
}

// Singleton pattern to ensure Amplify is only configured once
let isConfigured = false;

export function getAmplifyConfig() {
  if (!isConfigured && typeof window !== 'undefined') {
    configureAmplify();
    isConfigured = true;
  }
  return Amplify;
}
