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
    
    const linkedinResponse = await fetch('https://linkedin.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-RestLi-Protocol-Version': '2.0.0',
        'X-RestLi-Method': 'CREATE', // Mandated header to declare programmatic creations
        'LinkedIn-Version': '202507'
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

    // Check if the server still sent an HTML captcha or page
    const contentType = linkedinResponse.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && linkedinResponse.status === 200) {
      throw new Error("LinkedIn firewall intercepted the request with a captcha block. The cloud IP is flagged.");
    }

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
