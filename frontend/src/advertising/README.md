# Advertising README

To implement this solution:

1. Create the advertising page at /app/advertising/page.js with the component code provided

2. Create the CSS file at /app/advertising/Advertising.css

3. Make sure you have the required dependencies installed:

i. @paypal/react-paypal-js for PayPal integration

ii. react-hook-form for form handling

4. Update your next.config.js to include PayPal domains if needed:
```
 module.exports = {
  images: {
    domains: ['www.paypal.com'],
  },
}

```
5. The link to this page already exists in your main app at:

6. The advertising page features:

i. Responsive two-row layout for image and video ads

ii. Radio button selection for different ad durations

iii. Credit card form with validation

iv. PayPal integration

v. Authentication handling (users must be signed in to pay)

vi. Error handling and validation
