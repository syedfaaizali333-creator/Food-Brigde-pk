# FoodBridge PK

A responsive food-donation and food-sharing website prototype for a Bano Qabil Frontend Web Development midterm project. The project uses HTML5, CSS3, Bootstrap 5 and beginner-friendly vanilla JavaScript. It has no backend and does not permanently store user input.

## Setup

1. Download and unzip `FoodBridge-PK.zip`. The archive contains a top-level `FoodBridge-PK/` project folder (or use this repository folder directly).
2. Open `index.html` in a modern browser. An internet connection is needed to load the Bootstrap 5 stylesheet and responsive navigation bundle from jsDelivr.
3. Navigate using the menu and footer links. For local development, a static-file preview such as VS Code Live Server can also be used; there is no build step.

## Folder structure

```text
FoodBridge-PK/
├── index.html
├── login.html
├── register.html
├── explore.html
├── food-details.html
├── add-food.html
├── donor-dashboard.html
├── receiver-dashboard.html
├── admin-dashboard.html
├── my-requests.html
├── marketplace.html
├── cart.html
├── impact.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── data.js
    │   ├── app.js
    │   ├── account.js
    │   ├── explore.js
    │   ├── details.js
    │   ├── add-food.js
    │   ├── dashboard.js
    │   ├── marketplace.js
    │   ├── cart.js
    │   └── impact.js
    └── images/
        └── food-sharing-hero.jpg
```

## Implemented features

- Responsive navigation, footer, home hero, introduction, sample impact figures, how-it-works steps and featured food listings.
- Demo login and registration forms with browser validation and role-based dashboard navigation.
- Explore page with food-name search, category filter, food cards, details links and request actions.
- Food details page with sample quantity, preparation/pickup times, storage guidance and allergen notes.
- Add-food form for donation or sale listings, quantity, category, description, pickup details, preparation time, deadline, storage and allergens. It checks required fields and that the deadline follows preparation time.
- Donor dashboard listing statuses and temporary collected/completed actions.
- Receiver dashboard and request tracking with the Available → Requested → Approved → Collected → Completed progression and alternate Rejected/Expired statuses.
- Admin sample request queue with working approve/reject buttons.
- Marketplace cards for Biryani (Rs. 250), Zinger Burger (Rs. 450), Sandwich (Rs. 200) and Pizza Slice (Rs. 180), quantity selection and a demo cart.
- Food impact and food safety guidance, with a clear notice that listing information does not guarantee food safety.
- Accessible skip link, labels, focus states, responsive layouts and small status/toast feedback interactions.

## Frontend demonstrations only

- Login and registration do not create or verify real accounts. No OTP, authentication or personal data is stored.
- Listing submissions, dashboard actions, requests and status updates use in-memory sample data and are temporary. Refreshing or leaving a page resets these interactions.
- A request link can show a sample Requested item in the request page for that visit; it does not notify a donor or reserve food.
- Marketplace cart selection is a browser-side demonstration. The cart page uses URL query values when navigated from the marketplace and sample items when opened directly.
- Checkout does not place an order or process a real payment.
- Impact statistics, people, locations, food listings, allergens, quantities and statuses are illustrative sample content, not live or verified information.
- FoodBridge PK cannot inspect, certify, or guarantee food safety. Users would need to verify freshness, ingredients, allergens, storage and pickup arrangements directly in a real-world service.

## Technology notes

- HTML pages are linked directly; there is no compilation or installation step.
- Bootstrap 5 is included by CDN. Custom styling lives in `assets/css/style.css`.
- JavaScript is split into small page-focused files under `assets/js/`.
- The project intentionally does not use React, Vue, Angular, jQuery, Node.js, Firebase, Supabase, LocalStorage or SessionStorage.
