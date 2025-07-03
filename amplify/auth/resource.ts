import { defineAuth } from '@aws-amplify/backend';

const auth = defineAuth({
  loginWith: {
    email: true,
    phone: false,
    username: false,
    
    // Optional: Configure social providers
    // socialProviders: ['google', 'facebook'],
  },
  
  // Optional: Configure MFA
  // mfa: {
  //   required: true,
  //   methods: ['totp'],
  // },
  
  // Optional: Configure password requirements
  verification: {
    email: {
      required: true,
    },
  },
}); 