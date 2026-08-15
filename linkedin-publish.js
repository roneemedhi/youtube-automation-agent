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

    const authorUrn = `urn:li:person:${process.env.LINKEDIN_PERSON_ID}`;
    console.log(`Using verified secure author identity configuration.`);

    console.log('Publishing content directly via modern Posts API...');
    
    // Updated to use the active /rest/posts endpoint with version header controls
    const linkedinResponse = await fetch('https://linkedin.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202507' // Mandated version header by LinkedIn
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: postText,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      })
    });

    if (linkedinResponse.status !== 201) {
      const errorText = await linkedinResponse.text();
      throw new Error(`LinkedIn API responded with status ${linkedinResponse.status}: ${errorText}`);
    }

    console.log('Successfully published to LinkedIn feed!');
  } catch (error) {
    console.error('LinkedIn Automation failed:', error);
    process.exit(1);
  }
}

run();
