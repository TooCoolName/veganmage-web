# Vegan Mage — Privacy Policy

**Last updated:** 22 July 2026

Vegan Mage is a free browser extension made by an independent developer. There's no account or sign-in, and Vegan Mage doesn't use your name or email. Contact: veganmage@proton.me.

Some of the extension runs locally in your browser. When you use AI features, your prompt — which can include text from the page you're viewing — is sent to the Vegan Mage server and then, through a **third-party AI routing service**, to a **language-model provider** that generates the response. Those are third parties. Both operate under a **Zero Data Retention (ZDR)** policy, so they don't keep your prompt after answering — but they do receive and process it to produce the response. Vegan Mage doesn't store your prompts or outputs.

Vegan Mage only reads a page when you explicitly activate it there — only when you right-click and enable Vegan Mage for that page. It does not monitor your browsing or run in the background on sites you visit.

## What's processed

- **Your prompt and the AI output** — sent to the server, then to a third-party AI routing service and language-model provider, only to generate your response.
- **Technical data** used to prevent abuse and rate-limit — including a pseudonymous per-installation identifier and a coarse network prefix of your IP address (never your full IP).
- **Local settings** — a random install ID and your preferences stay in your browser.

Prompts can reveal browsing activity and may contain personal information, so treat them as sensitive. When Vegan Mage correctly detects the author of a message in a conversation, it replaces that name with a placeholder like `[Author]` before sending. This is best-effort only — detection can miss or misattribute names, and it doesn't remove other personal information the prompt may contain. Always use the preview to check what's there before sending; if it contains anything you don't want to share, don't send it.

## Third parties

A **third-party AI routing service** passes your prompt to a **language-model provider**. Vegan Mage enforces the routing service's ZDR-only setting, so requests go only to providers that don't store your data. The routing service keeps billing metadata (like timestamps and token counts) but doesn't log prompt content; the model provider generates the response and, under ZDR, keeps nothing afterward. To do this, they may process your prompt outside the EEA (for example, in the US), but only briefly and without retaining it.

**Hosting** is provided by a third-party provider with servers in the EEA.

## How long things are kept

The install ID and settings stay in your browser until you clear them or uninstall. On the server, prompts and outputs are never saved — they exist only briefly in memory during processing. For abuse prevention the server uses only a coarse network prefix of your IP address, never your full IP; this is held in memory and cleared within minutes, and your full IP is not stored. Web-server access logging is turned off, so per-request connection metadata isn't recorded. The server keeps only basic operational and error logs in the system journal; these don't contain your prompts, outputs, or full IP. Operational logs are retained for no longer than 30 days.

## Your choices

You can turn off the AI generation feature in the extension's settings; while it's disabled, nothing is sent to the server or the AI providers for generation. Clear the extension's data or uninstall it to remove local settings. You may have rights to access or delete personal data depending on where you live, but since Vegan Mage doesn't store prompts and only uses a pseudonymous ID, it often can't link data to a specific person. Email veganmage@proton.me with any request.

## Children

Vegan Mage isn't directed to anyone under 18, and doesn't knowingly collect data from minors.

## Security

Traffic uses HTTPS, requests and responses are signed, replay attempts are blocked, request sizes are limited, and the credential for the AI service stays on the server and is never exposed to you. No system is completely secure, so absolute security can't be guaranteed.

## Changes

This policy may be updated; the date above shows the latest version, and important changes will be surfaced in the extension.

Contact: veganmage@proton.me
