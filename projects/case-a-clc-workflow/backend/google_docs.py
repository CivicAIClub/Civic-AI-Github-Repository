"""
Sends the weekly schedule to a Google Apps Script Web App,
which creates or updates a **Google Doc** using **document tabs** (one nested tab per week).

The Apps Script Web App must be deployed with:
  - Execute as: Me (the script owner's Google account)
  - Who has access: Anyone

The Web App URL is stored in .env (APPS_SCRIPT_URL) and treated as a secret.

Note on redirects:
  Apps Script Web Apps respond to POST with a 302 redirect; httpx uses
  follow_redirects=True so the final JSON body is readable.

Reliability:
  - Longer connect timeout, HTTP/1.1 only (http2=False), and a few retries
    help with flaky networks and cold Apps Script starts.
"""

import asyncio
from typing import Any, Optional

import httpx


async def send_to_apps_script(script_url: str, weekly_data: dict[str, Any]) -> dict[str, Optional[str]]:
    """POST the weekly schedule JSON to the Apps Script Web App.

    Returns:
        dict with ``docUrl`` and usually ``documentId``.

    Raises:
        httpx.HTTPStatusError: If Apps Script returns a non-2xx status.
        ValueError: If the response JSON is missing ``docUrl`` or contains ``error``.
    """
    script_url = (script_url or "").strip()
    if not script_url:
        raise ValueError("APPS_SCRIPT_URL is empty after trim.")

    timeout = httpx.Timeout(120.0, connect=30.0)

    for attempt in range(3):
        try:
            async with httpx.AsyncClient(
                timeout=timeout,
                follow_redirects=True,
                http2=False,
            ) as client:
                response = await client.post(
                    script_url,
                    json=weekly_data,
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "AutoPlanner/1.0 (+https://github.com)",
                    },
                )
                response.raise_for_status()

            body: dict[str, Any] = response.json()

            if body.get("error"):
                raise ValueError(str(body["error"]))

            doc_url = body.get("docUrl")
            if not doc_url:
                raise ValueError(
                    f"Apps Script response missing 'docUrl'. Full response: {body}"
                )

            out: dict[str, Optional[str]] = {"docUrl": doc_url}
            did = body.get("documentId") or body.get("spreadsheetId")
            if did:
                out["documentId"] = str(did)
            return out

        except httpx.RequestError as exc:
            if attempt < 2:
                await asyncio.sleep(2.0 * (attempt + 1))
                continue
            raise
