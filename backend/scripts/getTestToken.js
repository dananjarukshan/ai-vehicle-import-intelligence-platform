require('dotenv').config({ quiet: true });

const { createClient } = require('@supabase/supabase-js');

const requiredVariables = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD',
];

for (const variableName of requiredVariables) {
  if (!process.env[variableName]) {
    console.error(`Missing environment variable: ${variableName}`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

async function getToken() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  });

  if (error) {
    console.error(`Sign-in failed: ${error.message}`);
    process.exit(1);
  }

  if (!data.session?.access_token) {
    console.error('Sign-in succeeded but no access token was returned.');
    process.exit(1);
  }

  // Print only the token so PowerShell can capture it.
  console.log(data.session.access_token);
}

getToken().catch((error) => {
  console.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});