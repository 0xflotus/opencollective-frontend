// Load environment variables
import debug from 'debug';
import dotenv from 'dotenv';

dotenv.config();
debug.enable(process.env.DEBUG);

// Only load newrelic when we explicitly want it
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

const defaults = {
  PORT: 3000,
  NODE_ENV: 'development',
  IMAGES_URL: 'https://images.opencollective.com',
  PAYPAL_ENVIRONMENT: 'sandbox',
  STRIPE_KEY: 'pk_test_5aBB887rPuzvWzbdRiSzV3QB',
  GOOGLE_MAPS_API_KEY: 'AIzaSyCRLIexl7EkMQk_0_yNsjO4Vqb_MccD-RI',
  RECAPTCHA_SITE_KEY: '6LcyeXoUAAAAAFtdHDZfsxncFUkD9NqydqbIFcCK',
  USE_NEW_CREATE_ORDER: false,
};

for (const key in defaults) {
  if (process.env[key] === undefined) {
    process.env[key] = defaults[key];
  }
}
