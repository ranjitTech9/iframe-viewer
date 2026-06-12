# FD Web SDK — Client Integration Guide

## Overview

The FD Web SDK is delivered as a hosted single-page application embedded inside an `<iframe>`. Your application (the **parent frame**) loads the iframe and communicates with it via the browser's `postMessage` API.

---

## Step 1 — Embed the iframe

Add the hosted URL as an iframe anywhere in your application:

```html
<iframe
  id="fd-sdk-frame"
  src="https://fd-web-nine.vercel.app"
  style="width: 100%; height: 100%; border: none;"
  allow="camera; microphone"
></iframe>
```

> **`allow="camera; microphone"`** is required for Digilocker / document capture flows.

---

## Step 2 — Send the `INIT_SDK` message

Once the iframe has loaded, post an `INIT_SDK` message to it containing your configuration. The SDK will not render until it receives this message.

```js
const frame = document.getElementById('fd-sdk-frame');

frame.addEventListener('load', () => {
  frame.contentWindow.postMessage(
    {
      type: 'INIT_SDK',
      payload: {
        apiBaseUrl:    'https://api.yourbackend.com',   // required
        apiKey:        'YOUR_API_KEY',                   // required
        encryptionKey: 'YOUR_64_CHAR_HEX_KEY',          // required — see note below
        user: { /* see User Object section */ },
        theme: { /* optional — see Theme section */ },
      },
    },
    '*'   // replace '*' with your hosted URL in production for security
  );
});
```

> **Encryption key** must be a 64-character hexadecimal string (256-bit AES-GCM key). Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Step 3 — User Object

Pass the logged-in user's details inside `payload.user`. Only `id`, `name`, `dob`, `mobNo`, and `email` are required; all other fields are optional but improve the pre-fill experience.

```js
user: {
  // --- Required ---
  id: 'user_123',                    // your internal user ID
  name: 'Ravi Kumar',
  dob: '1990-05-15',                 // format: YYYY-MM-DD
  mobNo: '9876543210',
  email: 'ravi.kumar@example.com',

  // --- Optional identity ---
  userReferenceId: 'REF_ABC',        // your reference ID (passed back in events)
  gender: 'Male',                    // 'Male' | 'Female'
  panNumber: 'ABCDE1234F',

  // --- Optional address ---
  address: '123, MG Road',
  address1: 'Flat 4B',
  address2: 'Brigade Towers',
  area: 'Koramangala',
  city: 'Bangalore',
  state: 'Karnataka',
  country: 'India',
  pinCode: '560034',

  // --- Optional bank details ---
  accountNo: '1234567890',
  nameOfBank: 'HDFC Bank',
  ifsc: 'HDFC0001234',
  typeOfAccount: 'Savings',          // 'Savings' | 'Current'

  // --- Optional profile ---
  maritalStatus: 'Single',

  // --- Optional KYC prefill ---
  kycRelation: 'Self',
  kycRelationName: 'Ravi Kumar',

  // --- Optional callbacks / branding ---
  eventNotifyUrl: 'https://yourbackend.com/webhook/fd-events',
  startFDAlertMessage: 'Your FD has been started successfully!',
  poweredByLogo: 'https://yourcdn.com/logo.png',
}
```

---

## Step 4 — Theme (optional)

Customise the look and feel to match your brand. All fields are optional; the SDK falls back to default values for any field you omit.

```js
theme: {
  // --- Typography ---
  fontFamily: 'Inter, sans-serif',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  borderRadius: '8px',              // applied to cards, buttons, inputs

  // --- Brand colors ---
  primary: '#0057FF',               // main accent color
  headerBg: '#0057FF',
  headerText: '#FFFFFF',
  tabSelected: '#0057FF',
  buttonBackground: '#0057FF',
  buttonTextColor: '#FFFFFF',
  cancelButtonBg: '#F5F5F5',

  // --- Surface / layout ---
  background: '#F8F9FA',
  surface: '#FFFFFF',

  // --- Inputs ---
  inputBackground: '#FFFFFF',
  inputBorder: '#CCCCCC',
  border: '#E0E0E0',

  // --- Text ---
  text: '#1A1A1A',
  subText: '#555555',
  textLight: '#888888',
  textSecondary: '#444444',
  labelColor: '#333333',

  // --- Semantic ---
  success: '#28A745',
  error: '#DC3545',
  muted: '#6C757D',
  link: '#0057FF',
}
```

---

## Quick Test Page

Use this single HTML file to verify the hosted SDK end-to-end. Drop it in any project, open it in a browser, fill the form, and the SDK will launch inside a full-screen overlay.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FD SDK Test</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; }

    #launch-btn {
      padding: 14px 32px; font-size: 16px; font-weight: 600;
      background: #0057FF; color: #fff; border: none; border-radius: 8px;
      cursor: pointer;
    }
    #launch-btn:hover { background: #0046cc; }

    /* Modal overlay */
    #modal-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.45); align-items: center; justify-content: center; z-index: 100;
    }
    #modal-overlay.open { display: flex; }

    #modal {
      background: #fff; border-radius: 12px; padding: 32px;
      width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,.2);
    }
    #modal h2 { margin-bottom: 20px; font-size: 18px; color: #1a1a1a; }

    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
    .field input, .field select {
      width: 100%; padding: 10px 12px; border: 1px solid #ccc;
      border-radius: 6px; font-size: 14px; outline: none;
    }
    .field input:focus, .field select:focus { border-color: #0057FF; }

    .actions { display: flex; gap: 10px; margin-top: 24px; }
    .actions button { flex: 1; padding: 12px; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; }
    #cancel-btn { background: #f0f2f5; color: #444; }
    #start-btn  { background: #0057FF; color: #fff; }
    #start-btn:hover { background: #0046cc; }

    /* SDK overlay */
    #sdk-overlay {
      display: none; position: fixed; inset: 0; z-index: 200; background: #fff;
    }
    #sdk-overlay.open { display: block; }
    #sdk-overlay iframe { width: 100%; height: 100%; border: none; }
    #close-sdk {
      position: fixed; top: 12px; right: 16px; z-index: 201;
      background: rgba(0,0,0,.5); color: #fff; border: none;
      border-radius: 50%; width: 34px; height: 34px; font-size: 18px;
      cursor: pointer; line-height: 34px; text-align: center;
    }
  </style>
</head>
<body>

  <button id="launch-btn">Start FD SDK</button>

  <!-- Config modal -->
  <div id="modal-overlay">
    <div id="modal">
      <h2>Launch FD SDK</h2>

      <div class="field">
        <label>User Reference ID *</label>
        <input id="f-ref" type="text" placeholder="e.g. REF_001" />
      </div>
      <div class="field">
        <label>PAN Number *</label>
        <input id="f-pan" type="text" placeholder="e.g. ABCDE1234F" maxlength="10" style="text-transform:uppercase" />
      </div>
      <div class="field">
        <label>Date of Birth * (YYYY-MM-DD)</label>
        <input id="f-dob" type="date" />
      </div>
      <div class="field">
        <label>Gender *</label>
        <select id="f-gender">
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div class="actions">
        <button id="cancel-btn">Cancel</button>
        <button id="start-btn">Launch SDK</button>
      </div>
    </div>
  </div>

  <!-- SDK fullscreen overlay -->
  <div id="sdk-overlay">
    <button id="close-sdk" title="Close">✕</button>
    <iframe
      id="fd-frame"
      src="about:blank"
      allow="camera; microphone"
    ></iframe>
  </div>

  <script>
    const FD_SDK_URL = 'https://fd-web-nine.vercel.app';

    // ---- hardcoded base credentials (replace with your own) ----
    const API_BASE_URL    = 'https://api.yourbackend.com';
    const API_KEY         = 'YOUR_API_KEY';
    const ENCRYPTION_KEY  = 'YOUR_64_CHAR_HEX_ENCRYPTION_KEY';
    // ------------------------------------------------------------

    const launchBtn      = document.getElementById('launch-btn');
    const modalOverlay   = document.getElementById('modal-overlay');
    const cancelBtn      = document.getElementById('cancel-btn');
    const startBtn       = document.getElementById('start-btn');
    const sdkOverlay     = document.getElementById('sdk-overlay');
    const frame          = document.getElementById('fd-frame');
    const closeSdk       = document.getElementById('close-sdk');

    launchBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
    cancelBtn.addEventListener('click', () => modalOverlay.classList.remove('open'));

    startBtn.addEventListener('click', () => {
      const ref    = document.getElementById('f-ref').value.trim();
      const pan    = document.getElementById('f-pan').value.trim().toUpperCase();
      const dob    = document.getElementById('f-dob').value;
      const gender = document.getElementById('f-gender').value;

      if (!ref || !pan || !dob || !gender) {
        alert('Please fill all fields.'); return;
      }

      modalOverlay.classList.remove('open');
      sdkOverlay.classList.add('open');

      // Load the iframe fresh each time
      frame.src = FD_SDK_URL;

      frame.onload = () => {
        frame.contentWindow.postMessage(
          {
            type: 'INIT_SDK',
            payload: {
              apiBaseUrl:    API_BASE_URL,
              apiKey:        API_KEY,
              encryptionKey: ENCRYPTION_KEY,
              user: {
                id:              ref,
                userReferenceId: ref,
                name:            'Test User',
                dob:             dob,
                gender:          gender,
                panNumber:       pan,
                mobNo:           '9999999999',
                email:           'test@example.com',
              },
            },
          },
          FD_SDK_URL
        );
      };
    });

    closeSdk.addEventListener('click', () => {
      sdkOverlay.classList.remove('open');
      frame.src = 'about:blank';
    });
  </script>
</body>
</html>
```

> Replace `API_BASE_URL`, `API_KEY`, and `ENCRYPTION_KEY` with your real credentials before testing.

---

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My App</title>
</head>
<body>
  <iframe
    id="fd-sdk-frame"
    src="https://fd-web-nine.vercel.app"
    style="width:100%;height:100vh;border:none;"
    allow="camera; microphone"
  ></iframe>

  <script>
    const frame = document.getElementById('fd-sdk-frame');

    frame.addEventListener('load', () => {
      frame.contentWindow.postMessage(
        {
          type: 'INIT_SDK',
          payload: {
            apiBaseUrl:    'https://api.yourbackend.com',
            apiKey:        'YOUR_API_KEY',
            encryptionKey: 'YOUR_64_CHAR_HEX_ENCRYPTION_KEY',
            user: {
              id:     'user_123',
              name:   'Ravi Kumar',
              dob:    '1990-05-15',
              mobNo:  '9876543210',
              email:  'ravi.kumar@example.com',
            },
            theme: {
              primary:          '#0057FF',
              buttonBackground: '#0057FF',
              buttonTextColor:  '#FFFFFF',
              fontFamily:       'Inter, sans-serif',
              borderRadius:     '8px',
            },
          },
        },
        'https://fd-web-nine.vercel.app'
      );
    });
  </script>
</body>
</html>
```

---

## React Example

```tsx
import { useEffect, useRef } from 'react';

const FD_SDK_URL = 'https://fd-web-nine.vercel.app';

export default function FDEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    frameRef.current?.contentWindow?.postMessage(
      {
        type: 'INIT_SDK',
        payload: {
          apiBaseUrl:    'https://api.yourbackend.com',
          apiKey:        import.meta.env.VITE_FD_API_KEY,
          encryptionKey: import.meta.env.VITE_FD_ENCRYPTION_KEY,
          user: {
            id:    currentUser.id,
            name:  currentUser.name,
            dob:   currentUser.dob,
            mobNo: currentUser.phone,
            email: currentUser.email,
          },
          theme: {
            primary:      '#0057FF',
            borderRadius: '8px',
          },
        },
      },
      FD_SDK_URL
    );
  };

  return (
    <iframe
      ref={frameRef}
      src={FD_SDK_URL}
      onLoad={handleLoad}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      allow="camera; microphone"
    />
  );
}
```

---

## Security Checklist

| Item | Recommendation |
|---|---|
| `postMessage` target origin | Use the exact hosted URL, not `'*'`, in production |
| `encryptionKey` storage | Store in an environment variable; never hard-code in client source |
| `apiKey` storage | Treat as a secret; ideally fetched server-side at runtime |
| iframe `sandbox` attribute | **Do not add** — sandboxing breaks navigation inside the SDK |
| HTTPS | Both your app and the hosted URL must be served over HTTPS |

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Blank/white iframe | `INIT_SDK` message not received | Ensure `postMessage` fires after the `load` event |
| "Invalid encryption key" error | Key is not 64 hex characters | Regenerate with the command in Step 2 |
| Camera/microphone blocked | Missing `allow` attribute | Add `allow="camera; microphone"` to the iframe |
| Styles don't apply | `fontUrl` not loading | Verify the Google Fonts / CDN URL is publicly accessible |
| Events not received on webhook | `eventNotifyUrl` unreachable | Ensure the URL is publicly reachable from the backend |

---

*For integration support contact **ranjit.kumar@finspring.ai***
