const https = require('https');
require('dotenv').config({ path: '.env' }); // load .env

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('--- Google Credential Verifier ---');
console.log(`Client ID:     ${clientId ? clientId.substring(0, 15) + '...' : 'MISSING'}`);
console.log(`Client Secret: ${clientSecret ? clientSecret.substring(0, 5) + '...' : 'MISSING'} (Length: ${clientSecret ? clientSecret.length : 0})`);

if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

// Minimal request to Google's Token Endpoint with a dummy code
// We EXPECT checking for "invalid_grant" (bad code)
// If we get "invalid_client", the credentials are wrong.

const postData = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    code: 'invalid_dummy_code_123',
    redirect_uri: 'http://localhost:3000/api/auth/callback/google'
}).toString();

const options = {
    hostname: 'oauth2.googleapis.com',
    port: 443,
    path: '/token',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
};

console.log('\nTesting Credential Acceptance by Google...');
const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        try {
            const json = JSON.parse(data);
            console.log('Response Body:', json);

            if (json.error === 'invalid_client') {
                console.error('\n❌ FAILURE: Google rejected the Client ID / Secret pair. ("invalid_client")');
                console.error('   -> This means the credentials in .env are INCORRECT, REVOKED, or for the WRONG PROJECT TYPE.');
            } else if (json.error === 'invalid_grant') {
                console.log('\n✅ SUCCESS: Google accepted the credentials! (It rejected the dummy code, which is expected).');
                console.log('   -> This indicates the credentials in .env are VALID.');
                console.log('   -> The issue likely lies in the NextAuth configuration or Callback URI matching.');
            } else {
                console.log('\n❓ UNKNOWN RESULT: See response body above.');
            }
        } catch (e) {
            console.error('Failed to parse response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.write(postData);
req.end();
