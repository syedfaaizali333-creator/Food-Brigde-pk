# FoodBridge PK

FoodBridge PK connects surplus food from restaurants and food businesses with verified welfare organizations, and helps individuals and families find FoodBridge or partner meal locations. This repository is the maintained Vite/Firebase application; the old `FoodBridge-PK/` folder and ZIP are historical snapshots and are **not** included in the production build.

## What is implemented

- Email/password and Google sign-in using Firebase Authentication, plus email password reset.
- One application per Firebase account: restaurant/food business, welfare organization, or individual/family. Businesses and organizations provide contact and location details and a website/social page or links to photos/videos for verification. The website stores only the URLs; it does not upload files or use Firebase Storage. Applications are stored as `pending`; only an administrator can approve them. Applicants asked for changes can update and resubmit.
- A separate administrator build, available at `/` or `/admin-dashboard.html` on its own deployment. It displays all three application types, reviews them with an optional note (required when asking for changes), and manages FoodBridge centers and partner meal locations. Administrator access is enforced by a Firebase custom claim, not by hiding the URL.
- Approved restaurants can publish surplus food at an active FoodBridge center, include preparation and safety details, cancel unbooked listings and confirm collection.
- Approved organizations can browse available food, book the **whole** listing, provide their collector, phone, planned pickup time, transport and optional notes, and cancel a booking. Booking and release update the listing and booking atomically, preventing double-booking. **FoodBridge does not provide delivery**; the business arranges for the food to reach the center and the organization arranges collection.
- Individuals can see active FoodBridge centers and partners immediately after registering, including while their application is under review. They cannot access food listings or booking/donation tools. Admins can still review individual registrations.
- Firestore rules enforce roles, ownership, administrator review, verification-link limits and transactional booking transitions independently of the UI. Expired listings and listings tied to changed or unpublished center details cannot be newly booked. A restaurant whose approval is revoked cannot receive new bookings; the admin interface also attempts to withdraw its available listings.

The homepage hero is an illustrative AI-generated image, not a photograph of a confirmed FoodBridge location. The Firebase Web app configuration for project `food-bridge-53bb7` is included in `src/firebase.js`; no service-account credentials or real center addresses are included. Adding this configuration does not enable Firebase services or deploy security rules. Add only real, confirmed locations through the admin workspace; there are no fabricated locations or sample bookings.

## Connect Firebase

Use Node.js 22.13+ (or a supported newer LTS release) and npm.

1. In Firebase project `food-bridge-53bb7`, enable **Email/Password** and **Google** under Authentication → Sign-in method. Add `localhost`, your Vercel domain, and any custom/preview domains you intend to use to Authentication → Settings → Authorized domains. Google pop-ups must be allowed by the browser.
2. Create the default **Cloud Firestore** database in Native mode. **Cloud Storage is not required**: applicants provide externally hosted photo/video links instead of uploading files.
3. The Firebase **Web** configuration is already in `src/firebase.js`. To run locally:

   ```sh
   npm install
   npm run dev
   ```

   To use a different Firebase project without editing the JavaScript, optionally copy `.env.example` to `.env.local` and supply **all** required `VITE_FIREBASE_*` values; the storage bucket, messaging sender ID and measurement ID are optional. A partial override disables initialization rather than mixing projects. Web config values identify the project and are included in the browser build; they are not administrator credentials. Security depends on the rules below. Never put a service-account private key in a `VITE_` variable or commit it to this repository.
4. Deploy `firestore.rules` to the **same Firebase project before collecting real data**. For example, from a trusted machine with the Firebase CLI signed in and access to that project:

   ```sh
   npx firebase-tools deploy --only firestore:rules --project food-bridge-53bb7
   ```

   Review existing project rules and data before deploying: this command replaces the deployed rules. The rules are designed for the collections and fields in this app, and reject other access by default.
5. Run `npm run lint:rules` and the official emulator tests described below before launch. Test email/Google registration, verification links, approval, bookings and cancellation with real test accounts in your own project as well.

## Create an administrator

Create a dedicated user in Firebase Authentication first. For Google, the person can sign in once on the admin deployment (or at `/admin-dashboard.html` in local development) to create the Firebase user; the page will deny access until the claim is granted. On a trusted machine, use a service account or Application Default Credentials with Firebase Authentication administration permissions. Keep any JSON key **outside the repository**:

```sh
export FIREBASE_PROJECT_ID="food-bridge-53bb7"
export GOOGLE_APPLICATION_CREDENTIALS="/secure/path/outside-the-repo/service-account.json"
npm run grant-admin -- --email admin@example.com
# Alternatively: npm run grant-admin -- --uid FIREBASE_AUTH_UID
```

The script preserves existing custom claims and adds `admin: true`. The admin must sign out and sign back in, or otherwise refresh their ID token, after the claim is added. The administrator workspace is not included in the public production build and is not linked from the public website. Deploy it as a second Vercel project as described below; locally it can be opened at `/admin-dashboard.html`. The separate URL alone is not a security boundary: the custom claim and rules enforce access.

In the admin workspace, add and publish confirmed locations. **FoodBridge center** locations appear in the restaurant listing form; both FoodBridge centers and **partner meal locations** appear in the individual directory. Editing or unpublishing a center makes listings with old center details unavailable for new bookings; the restaurant can cancel and recreate them. Already-booked pickups retain their original location details and should be coordinated directly.

## Deploy to Vercel

Automatic Vercel deployments from the `arena/4a66af7a-food-brigde-pk` working branch are disabled in `vercel.json`. Other branches retain their normal deployment behavior. Remove that branch-specific setting when you intentionally want automatic deployments from this branch.

Create **two** Vercel projects from this repository, both with the repository root as the project root and `dist` as the output directory:

1. **Public website:** use the Vite framework and `npm run build`. This build does not include the admin dashboard.
2. **Administrator website:** use `npm run build:admin`. This build contains only the separate administrator workspace, at both `/` and `/admin-dashboard.html`.

Both builds use the Web configuration in `src/firebase.js` by default. If overriding it with `VITE_FIREBASE_*` values in Vercel, provide all required values for the same Firebase project in both Vercel projects; Vite injects them at build time. Authorize both deployed domains in Firebase Authentication. Do not deploy `.env.local` or a service-account key. The legacy public demo URLs redirect to the relevant protected workspace or home page; they do not expose demo food forms or a fake marketplace.

## Tests

```sh
npm test                  # unit and mocked UI/workflow tests; emulator suites skip if absent
npm run lint:rules        # Firebase's Security Rules grammar and basic lint checks
npm run build             # public build
npm run build:admin       # separate administrator build
```

For actual authorization and atomic-write tests, install Java 21+ and run the official Firebase emulators (the CLI downloads emulator binaries on first use):

```sh
npx firebase-tools emulators:exec --only firestore --project demo-foodbridge-pk "npm run test:rules"
```

The emulator tests cover role isolation, admin approval, valid listing creation, double-booking, cancellation/collection, revoked restaurants, and verification URL validation. `npm test` reports these tests as **skipped** unless the emulators are running. The mocked UI tests do not replace emulator testing or a real Firebase integration check.

As an optional Java-free check, the same rules suite can run with the **third-party**, Firebase-compatible Fireemu emulator (this does not replace testing against Google's official emulators or a Firebase test project):

```sh
npx -y fireemu@0.43.0 exec --only firestore --project demo-foodbridge-pk -- npm run test:rules
```

## Operational and privacy notes

- If older test applications used `evidencePaths` for Storage files, those files are no longer accessible through this application. Ask those applicants to provide new links by requesting changes; re-submission replaces the old paths with URLs.

- Applications contain personal information. Profile documents, including verification links, are readable only by their owner and admins; approved organizations can see restaurant contact information on available listings, and booking contacts are visible to the relevant organization and restaurant. Photo/video links open third-party websites and may be accessible to anyone who has the link; applicants must ensure reviewers can view them and should not include confidential media. No files are uploaded to FoodBridge. Reviewers should exercise care with links submitted by applicants.
- One registration is enforced per Firebase account, not per real-world person. There is no identity-document check or automatic duplicate-person detection. Individuals are given the center directory even if their application is pending or changes are requested.
- The UI does not enforce email verification, provide automated review notifications, inspect externally hosted media, or offer a self-service personal-data deletion workflow. Before a real launch, establish a privacy notice, lawful retention/deletion and account recovery process, moderation and food-safety procedures, abuse/rate limits and Firebase App Check/monitoring appropriate to the deployment. Do not treat a listing as a guarantee of food safety or meal availability.
- Firestore rules block a new booking when a restaurant is no longer approved. Previously booked collections need human coordination if an account or center is later disabled. There is no delivery service or automatic dispatch.
