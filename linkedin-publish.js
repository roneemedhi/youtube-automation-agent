const { GoogleGenAI } = require('@google/genai');
const fetch = require('node-fetch');

async function run() {
  try {
    console.log('Fetching your unique ID using your new token...');
    const profileResponse = await fetch('https://linkedin.com', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    const profileData = await profileResponse.json();
    console.log('====================================');
    console.log(`YOUR UNIQUE PERSON ID IS: ${profileData.id}`);
    console.log('====================================');
    
    process.exit(0); // Exit safely once we see it
  } catch (error) {
    console.error('Lookup failed:', error);
    process.exit(1);
  }
}

run();
