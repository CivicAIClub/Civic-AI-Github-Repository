/**
 * Sundial (Blackbaud MySchoolApp) API integration via SKY API.
 *
 * STATUS: PLACEHOLDER — Requires school admin to:
 *   1. Enable SKY API access on Pomfret's Blackbaud instance
 *   2. Register this application in the Blackbaud Marketplace
 *   3. Provide the client ID and client secret
 *
 * API Docs: https://developer.blackbaud.com/skyapi/apis/school
 * Auth: OAuth 2.0 (Authorization Code flow)
 * Base URL: https://api.sky.blackbaud.com/school/v1
 */

var SUNDIAL_CONFIG = {
  AUTH_URL: 'https://oauth2.sky.blackbaud.com/authorization',
  TOKEN_URL: 'https://oauth2.sky.blackbaud.com/token',
  API_BASE: 'https://api.sky.blackbaud.com/school/v1',
  // Subscription key from Blackbaud developer portal
  SUBSCRIPTION_KEY_HEADER: 'Bb-Api-Subscription-Key'
};

// ─────────────────────────────────────────────
// Authentication (OAuth 2.0)
// ─────────────────────────────────────────────

/**
 * Saves Sundial API credentials to user properties.
 * Called from SundialSetup.html dialog.
 */
function saveSundialCredentials(clientId, clientSecret, subscriptionKey) {
  var props = PropertiesService.getUserProperties();
  props.setProperty('SUNDIAL_CLIENT_ID', clientId);
  props.setProperty('SUNDIAL_CLIENT_SECRET', clientSecret);
  props.setProperty('SUNDIAL_SUBSCRIPTION_KEY', subscriptionKey);
}

/**
 * Returns the OAuth 2.0 authorization URL for the user to grant access.
 * The user visits this URL, logs into Blackbaud, and approves the app.
 *
 * TODO: Implement once school admin provides client credentials.
 * Will use Apps Script OAuth2 library or manual token exchange.
 *
 * @returns {string} Authorization URL
 */
function getSundialAuthUrl() {
  var props = PropertiesService.getUserProperties();
  var clientId = props.getProperty('SUNDIAL_CLIENT_ID');

  if (!clientId) {
    throw new Error('Sundial API credentials not configured. Go to: Sundial Export → Connect to Sundial');
  }

  var redirectUri = getRedirectUri_();
  var authUrl = SUNDIAL_CONFIG.AUTH_URL +
    '?client_id=' + encodeURIComponent(clientId) +
    '&response_type=code' +
    '&redirect_uri=' + encodeURIComponent(redirectUri) +
    '&scope=read write';

  // TODO: Add state parameter for CSRF protection
  return authUrl;
}

/**
 * Handles the OAuth callback after the user authorizes the app.
 * Exchanges the authorization code for access + refresh tokens.
 *
 * TODO: Implement token exchange and storage.
 *
 * @param {string} authCode - The authorization code from Blackbaud
 * @returns {boolean} True if tokens were stored successfully
 */
function handleSundialCallback(authCode) {
  var props = PropertiesService.getUserProperties();
  var clientId = props.getProperty('SUNDIAL_CLIENT_ID');
  var clientSecret = props.getProperty('SUNDIAL_CLIENT_SECRET');

  // TODO: Exchange auth code for tokens
  // var response = UrlFetchApp.fetch(SUNDIAL_CONFIG.TOKEN_URL, {
  //   method: 'post',
  //   payload: {
  //     grant_type: 'authorization_code',
  //     code: authCode,
  //     client_id: clientId,
  //     client_secret: clientSecret,
  //     redirect_uri: getRedirectUri_()
  //   },
  //   muteHttpExceptions: true
  // });
  //
  // var tokens = JSON.parse(response.getContentText());
  // props.setProperty('SUNDIAL_ACCESS_TOKEN', tokens.access_token);
  // props.setProperty('SUNDIAL_REFRESH_TOKEN', tokens.refresh_token);
  // props.setProperty('SUNDIAL_TOKEN_EXPIRY', String(Date.now() + tokens.expires_in * 1000));

  throw new Error('Sundial OAuth callback not yet implemented. Waiting for school admin to provide API credentials.');
}

/**
 * Returns a valid access token, refreshing if expired.
 *
 * TODO: Implement token refresh logic.
 *
 * @returns {string} Valid access token
 */
function getSundialAccessToken_() {
  var props = PropertiesService.getUserProperties();
  var accessToken = props.getProperty('SUNDIAL_ACCESS_TOKEN');
  var expiry = Number(props.getProperty('SUNDIAL_TOKEN_EXPIRY') || 0);

  if (!accessToken) {
    throw new Error('Not connected to Sundial. Go to: Sundial Export → Connect to Sundial');
  }

  // Refresh if expired (with 60s buffer)
  if (Date.now() > expiry - 60000) {
    // TODO: Implement refresh
    // var refreshToken = props.getProperty('SUNDIAL_REFRESH_TOKEN');
    // ... refresh logic ...
    throw new Error('Sundial token expired. Please reconnect via: Sundial Export → Connect to Sundial');
  }

  return accessToken;
}

/**
 * Returns the OAuth redirect URI for this Apps Script project.
 *
 * IMPORTANT: This requires the Apps Script project to be deployed as a Web App.
 * Container-bound scripts (the typical case here, since this project lives
 * inside a Google Sheet) return null from ScriptApp.getService().getUrl()
 * unless they have an active Web App deployment.
 *
 * Setup steps:
 *   1. In the Apps Script editor: Deploy → New deployment
 *   2. Type: Web app
 *   3. Execute as: User accessing the web app
 *   4. Who has access: Anyone with Google account
 *   5. Click Deploy and copy the resulting URL
 *   6. Register that URL as the redirect URI in the Blackbaud developer portal
 *
 * @returns {string} The Web App URL to use as the OAuth redirect URI
 * @throws {Error} If the script has not been deployed as a Web App
 */
function getRedirectUri_() {
  var url = ScriptApp.getService().getUrl();
  if (!url) {
    throw new Error(
      'OAuth redirect URI is unavailable.\n\n' +
      'This script must be deployed as a Web App for Sundial OAuth to work.\n\n' +
      'In the Apps Script editor:\n' +
      '  1. Deploy → New deployment\n' +
      '  2. Type: Web app\n' +
      '  3. Execute as: User accessing the web app\n' +
      '  4. Who has access: Anyone with Google account\n' +
      '  5. Click Deploy\n\n' +
      'Then register the resulting URL in the Blackbaud developer portal as the redirect URI.'
    );
  }
  return url;
}

// ─────────────────────────────────────────────
// API Helpers
// ─────────────────────────────────────────────

/**
 * Makes an authenticated request to the Sundial SKY API.
 *
 * @param {string} endpoint - API path (e.g., '/users/me')
 * @param {string} method - HTTP method (GET, POST, PUT, PATCH)
 * @param {Object} [payload] - Request body for POST/PUT/PATCH
 * @returns {Object} Parsed JSON response
 */
function sundialRequest_(endpoint, method, payload) {
  var token = getSundialAccessToken_();
  var subscriptionKey = PropertiesService.getUserProperties().getProperty('SUNDIAL_SUBSCRIPTION_KEY');

  var options = {
    method: method || 'get',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Bb-Api-Subscription-Key': subscriptionKey
    },
    muteHttpExceptions: true
  };

  if (payload && (method === 'post' || method === 'put' || method === 'patch')) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }

  var response = UrlFetchApp.fetch(SUNDIAL_CONFIG.API_BASE + endpoint, options);
  var code = response.getResponseCode();

  if (code < 200 || code >= 300) {
    throw new Error('Sundial API error (' + code + '): ' + response.getContentText().substring(0, 300));
  }

  var text = response.getContentText();
  return text ? JSON.parse(text) : {};
}

// ─────────────────────────────────────────────
// Read Endpoints (Pull data from Sundial)
// ─────────────────────────────────────────────

/**
 * Gets the sections (classes) taught by the currently authenticated teacher.
 *
 * SKY API: GET /academics/sections
 * PowerShell equivalent: Get-SchoolSectionByTeacher
 *
 * TODO: Confirm exact endpoint path and query parameters once API access is granted.
 *
 * @returns {Array} [{section_id, course_name, section_name, term}]
 */
function getSundialSections() {
  // TODO: Replace with actual API call
  // var data = sundialRequest_('/academics/sections?teacher_id=me', 'get');
  // return data.value.map(function(s) {
  //   return {
  //     section_id: s.id,
  //     course_name: s.course_title,
  //     section_name: s.name,
  //     term: s.term
  //   };
  // });

  throw new Error(
    'getSundialSections() is not yet implemented.\n\n' +
    'Waiting for school admin to enable SKY API access.\n' +
    'Expected endpoint: GET /academics/sections'
  );
}

/**
 * Gets the student roster for a specific section.
 *
 * SKY API: GET /academics/sections/{section_id}/students
 * PowerShell equivalent: Get-SchoolStudentBySection
 *
 * TODO: Confirm exact endpoint path and response format.
 *
 * @param {string} sectionId - Sundial section ID
 * @returns {Array} [{student_id, first_name, last_name, name}]
 */
function getSundialRoster(sectionId) {
  // TODO: Replace with actual API call
  // var data = sundialRequest_('/academics/sections/' + sectionId + '/students', 'get');
  // return data.value.map(function(s) {
  //   return {
  //     student_id: s.id,
  //     first_name: s.first_name,
  //     last_name: s.last_name,
  //     name: s.last_name + ', ' + s.first_name
  //   };
  // });

  throw new Error(
    'getSundialRoster() is not yet implemented.\n\n' +
    'Waiting for school admin to enable SKY API access.\n' +
    'Expected endpoint: GET /academics/sections/{id}/students'
  );
}

// ─────────────────────────────────────────────
// Write Endpoints (Push comments to Sundial)
// ─────────────────────────────────────────────

/**
 * Pushes a single student's comment into Sundial.
 *
 * IMPORTANT: The exact endpoint for writing progress report comments
 * has NOT been confirmed in the public SKY API docs. Possible endpoints:
 *   - POST /content/comments
 *   - PUT  /academics/sections/{id}/students/{id}/comments
 *   - POST /progress-reports (if such an endpoint exists)
 *
 * The school admin needs to check the SKY API console or contact
 * Blackbaud support to confirm the correct endpoint and payload format.
 *
 * @param {string} sectionId - Sundial section ID
 * @param {string} studentId - Sundial student ID
 * @param {string} comment - The teacher's comment text
 * @param {string} termId - The grading term/period ID in Sundial
 * @returns {Object} API response
 */
function pushCommentToSundial(sectionId, studentId, comment, termId) {
  // TODO: Replace with actual API call once endpoint is confirmed
  //
  // Possible payload structure (speculative):
  // var payload = {
  //   student_id: studentId,
  //   section_id: sectionId,
  //   term_id: termId,
  //   comment_text: comment,
  //   comment_type: 'progress_report'
  // };
  //
  // return sundialRequest_('/progress-reports/comments', 'post', payload);
  //
  // OR it might be:
  // return sundialRequest_(
  //   '/academics/sections/' + sectionId + '/students/' + studentId + '/comments',
  //   'post',
  //   { text: comment, term_id: termId }
  // );

  throw new Error(
    'pushCommentToSundial() is not yet implemented.\n\n' +
    'The comment write endpoint has not been confirmed in the SKY API docs.\n' +
    'School admin needs to check the SKY API console or contact Blackbaud support.'
  );
}

/**
 * Pushes all comments for a section to Sundial in bulk.
 * Reads from the Google Doc, matches students, and sends each comment.
 *
 * @param {string} sectionId - Sundial section ID
 * @param {Array} studentComments - [{student_id, comment}]
 * @param {string} termId - Grading term ID
 * @returns {Object} Summary: {success: number, failed: number, errors: []}
 */
function pushAllCommentsForSection(sectionId, studentComments, termId) {
  var results = { success: 0, failed: 0, errors: [] };

  for (var i = 0; i < studentComments.length; i++) {
    var sc = studentComments[i];
    if (!sc.comment || sc.comment.trim() === '') continue;

    try {
      pushCommentToSundial(sectionId, sc.student_id, sc.comment, termId);
      results.success++;
    } catch (e) {
      results.failed++;
      results.errors.push(sc.student_id + ': ' + e.message);
    }
  }

  return results;
}

/**
 * Checks whether the Sundial API connection is active and working.
 * @returns {Object} {connected: boolean, message: string}
 */
function checkSundialConnection() {
  var props = PropertiesService.getUserProperties();
  var clientId = props.getProperty('SUNDIAL_CLIENT_ID');
  var accessToken = props.getProperty('SUNDIAL_ACCESS_TOKEN');

  if (!clientId) {
    return { connected: false, message: 'API credentials not configured.' };
  }
  if (!accessToken) {
    return { connected: false, message: 'Not authenticated. Please connect to Sundial.' };
  }

  // TODO: Make a lightweight API call to verify the token works
  // try {
  //   sundialRequest_('/users/me', 'get');
  //   return { connected: true, message: 'Connected to Sundial.' };
  // } catch (e) {
  //   return { connected: false, message: 'Connection failed: ' + e.message };
  // }

  return { connected: false, message: 'Connection check not yet implemented.' };
}
