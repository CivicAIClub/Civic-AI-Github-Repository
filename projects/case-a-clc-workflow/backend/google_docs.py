"""
Sends the weekly schedule to a Google Apps Script Web App,
which creates and returns a Google Doc URL.

The Apps Script Web App must be deployed with:
  - Execute as: Me (the script owner's Google account)
  - Who has access: Anyone

The Web App URL is stored in .env (APPS_SCRIPT_URL) and treated as a secret
because possession of the URL grants the ability to create Google Docs in
the script owner's Drive.

Note on redirects:
  Apps Script Web Apps always respond to POST requests with a 302 redirect
  to a unique run URL. httpx does not follow POST redirects by default
  (correct per RFC 7231), so we explicitly set follow_redirects=True.
"""

import httpx


async def send_to_apps_script(script_url: str, weekly_data: dict) -> str:
    """POST the weekly schedule JSON to the Apps Script Web App.

    Args:
        script_url:   The deployed Web App URL from Apps Script.
        weekly_data:  The full schedule dict from build_weekly_schedule().

    Returns:
        The Google Doc URL string.

    Raises:
        httpx.HTTPStatusError: If the Apps Script returns a non-2xx status.
        ValueError:            If the response body does not contain a docUrl.
    """
    # 60-second timeout to accommodate Apps Script cold starts (first run after
    # a period of inactivity can take 10–20 seconds before execution begins).
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            script_url,
            json=weekly_data,
            headers={"Content-Type": "application/json"},
            follow_redirects=True,
        )
        response.raise_for_status()

    body = response.json()
    doc_url = body.get("docUrl")

    if not doc_url:
        raise ValueError(
            f"Apps Script response missing 'docUrl'. Full response: {body}"
        )

    return doc_url
