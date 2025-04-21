# Muskurahat Foundation Website

This repository contains the source code for the Muskurahat Foundation website.

## Features
- Responsive design with mobile-first approach
- PhonePe payment gateway integration for donations
- Firebase integration for analytics and data storage
- Image gallery with lazy loading
- Contact form

## PhonePe Integration Setup
The website uses PhonePe payment gateway for processing donations. To set up the payment gateway:

1. Make sure your server supports PHP (7.3 or higher recommended)
2. Configure your PhonePe API key in the following files:
   - `phonepe_handler.php`
   - `verify_payment.php`
3. Replace the `merchantId` value with your actual PhonePe merchant ID
4. For production, modify the `Access-Control-Allow-Origin` header in `phonepe_handler.php` to specify your domain

## Deployment
To deploy the website:

1. Upload all files to your web server
2. Ensure the PHP files (`phonepe_handler.php` and `verify_payment.php`) have execute permissions
3. If using Firebase, ensure the Firebase configuration in `index.html` is updated with your project details
4. Test the donation flow by making a small test donation

## Development
For local development:
1. Clone this repository
2. Open `index.html` in your browser
3. For testing donations, you'll need a local server with PHP support (e.g., XAMPP, WAMP, or PHP's built-in server)

## Security Notes
- The API key used in this repository is for demonstration purposes only
- In a production environment, keep your API keys secure and don't commit them to public repositories
- Consider implementing additional security measures for the payment process
