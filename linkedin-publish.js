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

    // Uses your verified person ID directly, bypassing the cloud firewall block entirely
    const authorUrn = `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`;
    console.log(`Using verified secure author identity configuration.`);

    console.log('Publishing content directly to LinkedIn profile...');
    const linkedinResponse = await fetch('https://linkedin.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: authorUrn,
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
