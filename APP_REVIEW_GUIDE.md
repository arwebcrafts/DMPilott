# App Review Submission Guide for DMPilot

## Overview
This guide walks through the complete process to get your Meta app approved for public access, specifically for the "Human Agent" permission which is currently blocking public access.

---

## Step 1: Add Test Users

### Why Test Users Are Needed
Meta requires test user credentials so their reviewers can access your app during the review process.

### How to Add Test Users

1. **Navigate to Test Users Page**
   - Go to: https://developers.facebook.com/apps/4552936261602709/app-roles/test-users/
   - Or: App Dashboard → App Settings → App Roles → Test Users

2. **Create Test Users**
   - Click "Add" or "Create Test User" button
   - You can create up to 5 test users per app
   - Choose permissions for the test user (select all Instagram permissions)
   - Click "Create"

3. **Note Test User Credentials**
   - Copy the test user's email and password
   - Save these credentials - you'll need them for the App Review submission

---

## Step 2: Prepare Your App for Review

### Requirements Based on Previous Rejection

**Issue:** "Invalid or Insufficient Credentials Provided"
- App was gated behind register/sign up requirement
- Reviewers couldn't access the app

**Solution:**
1. Create a test account in your DMPilot app
2. Link it to a Facebook/Instagram account
3. Document the login credentials

### Pre-Submission Checklist

- [ ] Test user account created in DMPilot
- [ ] Test user has connected Instagram account
- [ ] Test user has at least one automation set up
- [ ] App is accessible via the provided URL
- [ ] Privacy policy URL is valid
- [ ] App icon is uploaded
- [ ] App description is complete

---

## Step 3: Create Screencast/Video

### Required Content for Screencast

Based on the rejection feedback for "instagram_business_manage_comments":

**Must Include:**
1. **Complete Meta login flow**
   - Show user clicking "Connect Instagram"
   - Show the OAuth popup
   - Show successful connection

2. **User granting app access**
   - Show permission request screen
   - Show user accepting permissions

3. **End-to-end experience of the use case**
   - Show creating an automation
   - Show automation triggering (comment → DM)
   - Show DM being sent

4. **Navigation instructions**
   - Show how to navigate to dashboard
   - Show how to access automations
   - Show how to connect accounts

### Screencast Best Practices

- Use English as the app UI language
- Add captions and tooltips explaining what's happening
- Explain the meaning of buttons and UI elements
- Keep it under 5 minutes if possible
- Show the complete flow without skipping steps
- Use high-quality recording (720p or higher)

### Tools for Recording
- Loom (free, easy to use)
- OBS Studio (free, more advanced)
- QuickTime (Mac)
- Windows Game Bar (Windows)

---

## Step 4: Prepare Reviewer Instructions

### What to Include in Reviewer Instructions

```
LOGIN CREDENTIALS:
Email: [test_user_email]
Password: [test_user_password]

TESTING INSTRUCTIONS:

1. Navigate to: https://dmpilott.vercel.app/login
2. Login with the credentials above
3. Once logged in, you will see the dashboard
4. To test Instagram DM automation:
   a. Click "Connect Instagram" in the Connected Accounts section
   b. Authorize the app with a test Instagram account
   c. Go to Automations page
   d. Click "New Automation"
   e. Select the connected Instagram account
   f. Set trigger type to "Any Comment"
   g. Enter a test DM message
   h. Click "Create Automation"
   i. Have someone comment on a post from the connected Instagram account
   j. The automation should automatically send a DM to the commenter

ADDITIONAL NOTES:
- The app allows users to automate Instagram DMs based on comment triggers
- Users can connect multiple Instagram accounts
- Automations can be customized with keywords and DM templates
- The app uses Instagram Graph API for messaging
```

---

## Step 5: Submit for App Review

### Navigation Path

1. Go to: https://developers.facebook.com/apps/4552936261602709/app-review/submissions/
2. Click "Add" or "New Request"
3. Select permissions to request:
   - **Human Agent** (this is the key one for public access)
   - instagram_business_manage_comments (if you want comment access)
4. Fill in the details:
   - **Use Case Description**: Explain how your app uses these permissions
   - **Reviewer Instructions**: Paste the instructions from Step 4
   - **Screencast URL**: Upload your video (YouTube, Vimeo, or direct upload)
5. Click "Submit"

### Use Case Description Template

```
DMPilot is a SaaS platform that enables businesses to automate their Instagram direct messages. Users can:

1. Connect their Instagram business accounts
2. Set up automated DM responses triggered by:
   - Comments on posts
   - Specific keywords in comments
   - Direct messages received
3. Customize DM templates with personalization
4. Track DM delivery and engagement metrics

The "Human Agent" permission is needed to:
- Allow any Instagram user to connect their account via OAuth
- Enable the app to work for public users without requiring them to be added as test users
- Support the core functionality of automated DM responses

The app serves businesses looking to scale their Instagram engagement and customer support through automation.
```

---

## Step 6: What to Screenshot

### Screenshots to Prepare

1. **Login Page**
   - Show the login form
   - Show the "Continue with Google" button (if applicable)

2. **Dashboard**
   - Show the main dashboard with KPIs
   - Show connected accounts section

3. **Connected Accounts**
   - Show Instagram account connection flow
   - Show successful connection state

4. **Automations Page**
   - Show list of automations
   - Show "New Automation" button

5. **Create Automation Modal**
   - Show account selection
   - Show trigger type selection
   - Show DM message input

6. **Automation Created**
   - Show automation card with details
   - Show toggle for enabling/disabling

7. **Privacy Policy Page**
   - Show your privacy policy URL content

### Screenshot Tips
- Use high-resolution screenshots
- Crop to show relevant areas
- Ensure text is readable
- Use consistent styling
- Save as PNG or JPG

---

## Step 7: Post-Submission

### What to Expect

- **Review Time**: 3-7 business days typically
- **Possible Outcomes**:
  - Approved ✅
  - Approved with conditions ⚠️
  - Rejected with feedback ❌

### If Approved
- Your app will be accessible to all users
- No more test user restrictions
- Public OAuth will work for anyone

### If Rejected
- Read the feedback carefully
- Address the specific issues
- Resubmit with fixes
- You can resubmit unlimited times

---

## Common Rejection Reasons & Solutions

### 1. "Invalid or Insufficient Credentials"
- **Cause**: Reviewers couldn't log in
- **Solution**: Provide valid test user credentials in Reviewer Instructions

### 2. "Screencast Not Aligned with Use Case"
- **Cause**: Video didn't show the complete flow
- **Solution**: Re-record showing end-to-end experience

### 3. "App Not Accessible"
- **Cause**: App URL is down or gated
- **Solution**: Ensure app is live and accessible

### 4. "Missing Privacy Policy"
- **Cause**: No privacy policy URL or invalid URL
- **Solution**: Add a valid privacy policy page

---

## Quick Reference

### URLs You'll Need
- App Dashboard: https://developers.facebook.com/apps/4552936261602709/
- App Review: https://developers.facebook.com/apps/4552936261602709/app-review/submissions/
- Test Users: https://developers.facebook.com/apps/4552936261602709/app-roles/test-users/
- Your App: https://dmpilott.vercel.app

### Key Permissions to Request
- **Human Agent** (critical for public access)
- instagram_business_manage_comments (for comment automation)
- instagram_business_manage_messages (already approved)
- instagram_business_basic (already approved)

### Review Checklist
- [ ] Test user created in Meta Dashboard
- [ ] Test user account created in DMPilot
- [ ] Test user credentials documented
- [ ] Screencast recorded and uploaded
- [ ] Reviewer instructions written
- [ ] Screenshots prepared
- [ ] Use case description written
- [ ] Privacy policy accessible
- [ ] App icon uploaded
- [ ] App description complete

---

## Contact Meta Support

If you need help:
- Use "Ask a question" button in App Review feedback
- Meta Developer Support: https://developers.facebook.com/support/
- App Review documentation: https://developers.facebook.com/docs/app-review/
