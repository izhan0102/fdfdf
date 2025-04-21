# Deployment Guide

This guide provides instructions for deploying the Muskurahat Foundation website to different hosting environments.

## Prerequisites

- Node.js and npm (for using tools like Firebase CLI)
- A web server with PHP 7.3+ support for the payment gateway integration
- Firebase account (for analytics and database features)

## Local Development

1. Clone the repository
2. Start a local server:
   ```
   # Using PHP's built-in server
   php -S localhost:8000
   
   # Or using Python
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000` in your browser

## Shared Hosting Deployment

1. Upload all files to your web hosting via FTP/SFTP
2. Ensure the PHP files have execute permissions (chmod 755):
   ```
   chmod 755 phonepe_handler.php verify_payment.php
   ```
3. Create a `logs` directory and make it writable:
   ```
   mkdir logs
   chmod 777 logs
   ```
4. Update Firebase configuration in `index.html` with your Firebase project details
5. Update PhonePe API credentials in both PHP files

## Firebase Hosting Deployment

Since Firebase Hosting doesn't support PHP, you'll need to:

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```
   firebase init hosting
   ```

4. Deploy static files to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```

5. Deploy PHP files to a separate PHP-enabled server:
   ```
   # Example using rsync to a separate server
   rsync -avz --include="*.php" --exclude="*" ./ user@your-php-server:/path/to/api/
   ```

6. Update the JavaScript to point to your PHP server endpoints

## Production Configuration

Before deploying to production:

1. Update the CORS headers in PHP files to restrict access to your domain:
   ```php
   header("Access-Control-Allow-Origin: https://yourdomain.com");
   ```

2. Remove any test/debugging code and mock data
3. Secure your API keys (consider using environment variables)
4. Set proper cache headers for static assets
5. Enable HTTPS for all connections

## Troubleshooting

- **Firebase Authentication Issues**: Ensure your Firebase project has Anonymous Authentication enabled
- **PHP Errors**: Check server logs and ensure PHP version is 7.3+
- **Payment Gateway Errors**: Verify API keys and ensure proper SSL/TLS configuration
- **CORS Issues**: Check that proper headers are set on your PHP files

## Regular Maintenance

1. Keep Firebase SDKs updated
2. Monitor logs for errors
3. Keep PHP versions updated
4. Regularly backup the site and database 