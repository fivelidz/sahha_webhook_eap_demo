#!/usr/bin/env node

/**
 * Script to manually set Sahha API credentials in localStorage
 * Run this in the browser console to set up credentials
 */

const credentials = {
  appId: 'NqrB0AYlviHruQVbF0Cp5Jch2utzQNwe',
  appSecret: 'VsU94PUlVPj7LM9dFAZ4sHPRAYFqgtfmG0WuANKLErtQlbFk8LZNLHIJA1AEnbtC',
  clientId: 'tFcIJ0UjCnV9tL7eyUKeW6s8nhIAkjkW',
  clientSecret: 'uGJFFzeLuifFEHC2y3dgs6J3O2vui3eiptuxlH5D810DmS8NshymlIJUu14nZ3y8'
};

// To use this, copy and paste the following into your browser console:
console.log(`
Copy and paste this into your browser console on http://localhost:3000:

localStorage.setItem('sahha_credentials', JSON.stringify(${JSON.stringify(credentials, null, 2)}));
console.log('✅ Sahha credentials saved!');
console.log('Credentials:', JSON.parse(localStorage.getItem('sahha_credentials')));
`);

console.log('\nOr use the API Key Manager in the dashboard with these credentials:');
console.log('App ID:', credentials.appId);
console.log('App Secret:', credentials.appSecret);
console.log('Client ID:', credentials.clientId);
console.log('Client Secret:', credentials.clientSecret);