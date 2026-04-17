/**
 * Fetches all active courses where the user is enrolled as a teacher.
 * @param {string} baseUrl - Canvas instance URL (e.g., https://school.instructure.com)
 * @param {string} token - Canvas API access token
 * @returns {Array} Simplified course objects [{id, name, course_code}]
 */
function getCourses(baseUrl, token) {
  var url = baseUrl + '/api/v1/courses?enrollment_type=teacher&enrollment_state=active&per_page=100';
  var allCourses = fetchAllPages(url, token);

  return allCourses.map(function (c) {
    return {
      id: c.id,
      name: c.name || c.course_code,
      course_code: c.course_code
    };
  });
}

/**
 * Fetches the student roster for a specific course.
 * Returns students sorted alphabetically by last name.
 * @param {string} baseUrl - Canvas instance URL
 * @param {string} token - Canvas API access token
 * @param {number} courseId - Canvas course ID
 * @returns {Array} Sorted student objects [{name, id}]
 */
function getRoster(baseUrl, token, courseId) {
  var url = baseUrl + '/api/v1/courses/' + courseId + '/users?enrollment_type[]=student&per_page=100';
  var allStudents = fetchAllPages(url, token);

  // Sort by sortable_name (format: "Last, First")
  allStudents.sort(function (a, b) {
    var nameA = (a.sortable_name || a.name || '').toLowerCase();
    var nameB = (b.sortable_name || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return allStudents.map(function (s) {
    return {
      name: s.sortable_name || s.name,
      id: s.id
    };
  });
}

/**
 * Fetches all pages of a paginated Canvas API endpoint.
 * Canvas returns a max of 100 results per page with Link headers for pagination.
 * @param {string} url - Initial API URL
 * @param {string} token - Canvas API access token
 * @returns {Array} All results combined
 */
function fetchAllPages(url, token) {
  var allResults = [];

  while (url) {
    var response = UrlFetchApp.fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      throw new Error('Canvas API returned ' + code + ': ' + response.getContentText().substring(0, 200));
    }

    var data = JSON.parse(response.getContentText());
    allResults = allResults.concat(data);
    url = getNextPageUrl(response);
  }

  return allResults;
}

/**
 * Parses the Link header from a Canvas API response to find the next page URL.
 * Canvas uses RFC 5988 Link headers: <url>; rel="next", <url>; rel="last"
 * @param {HTTPResponse} response - The UrlFetchApp response object
 * @returns {string|null} The next page URL, or null if no more pages
 */
function getNextPageUrl(response) {
  var headers = response.getHeaders();
  var linkHeader = headers['Link'] || headers['link'];
  if (!linkHeader) return null;

  var links = linkHeader.split(',');
  for (var i = 0; i < links.length; i++) {
    var parts = links[i].split(';');
    if (parts.length === 2 && parts[1].trim() === 'rel="next"') {
      return parts[0].trim().replace(/^<|>$/g, '');
    }
  }
  return null;
}
