# Vegan Mage — Privacy Policy

**Last updated:** 13 August 2026

Vegan Mage is a free browser extension made by an independent developer. There's no account or sign-in, and it doesn't use your name or email. Contact: veganmage@proton.me.

Most of what Vegan Mage does happens locally in your browser — reading and displaying page content stays on your device and isn't sent anywhere. It only works on sites where you've explicitly enabled it (by right-clicking and turning it on). On those sites it reads the content you're currently viewing so it can show it in the side panel, refreshing as you click around the page — so it's keeping up with what you're looking at, not reading just once. It doesn't run on sites you haven't enabled it for, and it doesn't track which sites you visit. The exceptions are the built-in AI feature (Cast), which sends text you provide to Vegan Mage's server, and fetching predefined settings and customizations from the server — see below for how those work.

## What it works with

On a site where you've enabled it, Vegan Mage reads the content you're currently viewing — updating as you click through the page — so it can display it in the side panel and help you work with it. This all happens on your device. It also stores only what it needs to provide the functionality shown in the extension — such as your preferences, the version of the terms you accepted, and a random install ID. All of it lives in your browser.

## Settings and customizations

Vegan Mage contacts its server to fetch predefined settings and customizations for the extension — such as default preferences or configuration options. This is a download of configuration, not a submission of your content: it doesn't send your page content or personal data to the server.

## Cast (the AI feature)

Cast processes text **you provide** — text you type or paste, or text from the page you're viewing that you submit through it. When you send that text, it goes to the Vegan Mage server and then, through a **third-party AI routing service**, to a **language-model provider** that generates the response. Those are third parties. Both operate under a **Zero Data Retention (ZDR)** policy, so they don't keep your text after answering — but they do receive and process it to produce the response. Vegan Mage doesn't store your submissions or the outputs.

- **The text you submit and the AI output** — sent to the server, then to a third-party AI routing service and language-model provider, only to generate your response.
- **Technical data** used to prevent abuse and rate-limit — a pseudonymous per-installation identifier and a coarse network prefix of your IP address (never your full IP).

Because Vegan Mage processes whatever you give it, your submissions may contain personal information — treat them as sensitive. If your text contains anything you don't want to share with a third-party AI service, don't send it.

## Third parties

A **third-party AI routing service** passes your text to a **language-model provider**. Vegan Mage enforces the routing service's ZDR-only setting — at both the account level and on each request — so requests go only to providers that don't store your data. The routing service keeps billing metadata (like timestamps and token counts) but doesn't log your text; the model provider generates the response and, under ZDR, keeps nothing afterward. To do this, they may process your text outside the EEA (for example, in the US), but only briefly and without retaining it.

**Hosting** is provided by a third-party provider with servers in the EEA.

## How long things are kept

Your settings and install ID stay in your browser until you clear them or uninstall. On the server, your submissions and the outputs are never saved — they exist only briefly in memory during processing. For abuse prevention the server uses only a coarse network prefix of your IP address, never your full IP; this is held in memory and cleared within minutes, and your full IP is not stored. Web-server access logging is turned off, so per-request connection metadata isn't recorded. The server keeps only basic operational and error logs in the system journal; these don't contain your submissions, outputs, or full IP. Operational logs are retained for no longer than 30 days.

## Your choices

Stop sending text at any time — nothing is processed unless you submit it. Clear the extension's data or uninstall it to remove local settings. You may have rights to access or delete personal data depending on where you live, but since Vegan Mage doesn't store submissions or outputs and only uses a pseudonymous ID, it often can't link data to a specific person. Email veganmage@proton.me with any request.

## Children

Vegan Mage isn't directed to anyone under 18, and doesn't knowingly collect data from minors.

## Security

Keeping your content on your own device avoids the risks that come with transmitting it. For the AI feature, traffic uses HTTPS, requests and responses are signed, replay attempts are blocked, request sizes are limited, and the credential for the AI service stays on the server and is never exposed to you. No system is completely secure, so absolute security can't be guaranteed.

## Changes

This policy may be updated; the date above shows the latest version, and important changes will be surfaced in the extension.

Contact: veganmage@proton.me
