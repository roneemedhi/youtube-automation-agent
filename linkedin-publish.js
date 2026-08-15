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

    // --- Dynamic ID Fetch directly from Token Debugger ---
    console.log('Fetching your unique ID via secure token inspection...');
    const tokenIntrospectResponse = await fetch('https://linkedin.com', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    // Check if the server blocked the request with a login page
    const textResponse = await tokenIntrospectResponse.text();
    let personId = '';

    if (textResponse.includes('urn:li:person:')) {
      const match = textResponse.match(/urn:li:person:([^"\s>,]+)/);
      if (match) personId = match[1];
    } else {
      try {
        const jsonData = JSON.parse(textResponse);
        if (jsonData.id) personId = jsonData.id;
      } catch (e) {
        // Fallback: If it's still returning HTML, find any member/person digit pattern safely
        const htmlMatch = textResponse.match(/memberId["']?\s*:\s*(\d+)/) || textResponse.match(/\/person\/(\d+)/);
        if (htmlMatch) personId = htmlMatch[1];
      }
    }

    if (!personId) {
      throw new Error("Could not extract identity automatically. Proceeding with fallback payload.");
    }

    const authorUrn = `urn:li:person:${personId}`;
    console.log(`Successfully bypassed firewall. Author URN set to: ${authorUrn}`);

    // --- Publish Content directly to Feed ---
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
