# i18n Guide

`locales/en.ts` is the source of truth. Before translating, read it and keep
every locale file the same shape (`typeof en`). When translating a string, use
the base vocabulary below so the same word is rendered the same way everywhere.

## Base vocabulary

These are the words that repeat across the app. Keep them consistent.

| English | Czech (canonical) | Notes |
| --- | --- | --- |
| Vegan Mage | Vegan Mage | Brand name. Never translate or split. |
| Mage | Mage | Short persona name. Keep capitalized. Never translate. |
| Herald / Heralds | Herold / Heroldi | The site-specific capture integration. |
| Chrome | Chrome | Never translate. |
| Discord | Discord | Never translate. |
| Add to Chrome | Přidat do Chrome | CTA. |
| Join the Discord | Přidat se na Discord | CTA. |
| draft | koncept | A generated reply draft. Not "návrh". |
| reply | odpověď | |
| reply target | cíl odpovědi | The comment being replied to. |
| post | příspěvek | The starting post/article. |
| comment / comments | komentář / komentáře | |
| replies | odpovědi | Replies in a thread. |
| capture | zachytit / zachytávání | Verb vs. feature noun. |
| website | web | Plural "sites" → "weby". |
| supported websites | podporované weby | |
| extension | rozšíření | Browser extension. |
| community | komunita | |
| advocacy | obhajoba | |
| voice | hlas | |
| context | kontext | |
| install | nainstalovat / instalace | |
| free | zdarma | |
| theme | motiv | |
| menu | nabídka | |
| language | jazyk | |
| made with care | vytvořeno s péčí | Recurring footer/brand line. |

## Rules

- Reuse `common.*` for words shown in more than one place. Do not add a
  local copy of `addToChrome`, `addToChromeFree`, or `joinDiscord`.
- Keep placeholders exact: `{{count}}`, `{{year}}`, `{{email}}`,
  `{{productName}}`, and any names used by `Trans`.
- Keep inline HTML exact: `<br/>`, `<em>`, `<a>`. Translate only the text
  between tags, and keep the `em` emphasis on the same phrase.
- Keep the key order of `en.ts`: keys that appear together in the UI are
  grouped together.
- Czech needs the plural forms `siteCount_one`, `siteCount_few`, and
  `siteCount_other`.
- Match source typography where it is meaningful (curly quotes, em dashes).
- No leftovers: `home.thread` in `cs.ts` still contains untranslated English
  (`targetLabel`, `target`, `instructionLabel`, `instruction`) and
  `heralds.unsupportedNote` is English. Translate these when editing.
