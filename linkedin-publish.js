const { GoogleGenAI } = require('@google/genai');
const fetch = require('node-fetch');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log('Generating deep strategic insights for LinkedIn...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash', 
      contents: 'Write a professional, short, high-value LinkedIn thought leadership post about AI product management trends.',
    });
    
    const postText = response.text;
    console.log('Content generated successfully.');

    // --- NEW STEP: Dynamically fetch your unique LinkedIn Person URN ---
    console.log('Fetching your unique LinkedIn profile details...');
    const profileResponse = await fetch('https://linkedin.com', {
      headers: { 'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}` }
    });

    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      throw new Error(`Failed to fetch LinkedIn profile: ${profileError}`);
    }

    const profileData = await profileResponse.json();
    const authorUrn = `urn:li:person:${profileData.id}`;
    console.log(`Successfully verified author identity: ${authorUrn}`);
    // -----------------------------------------------------------------

    console.log('Publishing content directly to LinkedIn profile...');
    const linkedinResponse = await fetch('https://linkedin.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: authorUrn, // Dynamically uses the correct person URN format
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: postText },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      })
    });

    if (!linkedinResponse.ok) {
      const errorText = await linkedinResponse.text();
      throw new Error(`LinkedIn API responded with status ${linkedinResponse.status}: ${errorText}`);
    }

    console.log('Successfully published to LinkedIn!');
  } catch (error) {
    console.error('LinkedIn Automation failed:', error);
    process.exit(1);
  }
}

run();
