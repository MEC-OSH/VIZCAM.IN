# VIZCAM launch checklist: current status

Website: https://www.vizcam.in/

The repository has passed source checks for the basics. Google/Bing account controls, live search indexing, and real-user analytics **cannot be verified from published files**.

| Checklist item | Status | Action |
| --- | --- | --- |
| Google Search Console | Requires owner sign-in | Visit https://search.google.com/search-console/ and add **vizcam.in** domain or **https://www.vizcam.in/** URL-prefix property. Use the exact Google-provided DNS TXT or HTML verification value, then submit https://www.vizcam.in/sitemap.xml. No generic token can verify ownership. |
| XML sitemap | Implemented in repository | https://www.vizcam.in/sitemap.xml; lastmod should reflect actual substantive homepage changes. After verified ownership, submit in both search consoles. |
| llms.txt | Optional | Available as /llms.txt. Not a Google ranking factor. |
| Open Graph preview | Implemented | 1200x630 VIZCAM preview at https://www.vizcam.in/assets/vizcam-social-preview-1200x630.jpg. Test by sending homepage URL to WhatsApp and inspecting the resulting preview. |
| Bing Webmaster Tools | Requires owner sign-in | Visit https://www.bing.com/webmasters/ and verify domain or import an already verified Google Search Console site. Submit the same sitemap. |
| Robots and page indexing | Configured, not live-verified | robots.txt allows public homepage; admin.html is marked noindex. Use URL Inspection in Search Console for actual indexing. |
| Mobile usability | Repository checks automated | Two product columns at mobile widths, descriptive image labels and touch targets; verify on a real phone. |
| Page speed / Core Web Vitals | Automated Lighthouse workflow added | Open GitHub Actions > VIZCAM SEO and Website Quality > Run workflow. Mobile and desktop Lighthouse reports are attached as artifacts and summarized in the action. Tests may vary by location, network and device. Core Web Vitals from real users require CrUX/GSC. |
| Titles and descriptions | Implemented | Unique local-business homepage title, meta description and canonical. |
| Contact links and forms | Repository checks automated | Test WhatsApp/phone/email on a real device; WhatsApp enquiries open a prefilled message and require the visitor to press Send. No onsite email delivery is implemented. |
| Google Analytics 4 | Requires owner GA4 measurement stream and privacy choice | Create/select a GA4 web data stream in https://analytics.google.com/ and supply its G- measurement ID. Do not publish placeholder tracking IDs or claim visits are being tracked before connected. Check privacy/consent requirements for the audience before enabling tracking. |
| Weekly monitoring | Automated GitHub Action + manual consoles | The GitHub workflow runs on every main push and on Mondays. Review its reports alongside GSC/Bing impressions, clicks, and index coverage once connected. |

## CI checks

\`python scripts/check_website.py\` validates repository SEO metadata, sitemap, social image, broken file/anchor references, WhatsApp CTA configuration, product details, galleries, and mobile CSS layout. This is a source check, not a full browser test.

The GitHub workflow also runs Lighthouse against the **public website** on mobile and desktop. If live DNS or external font/image hosts cannot be reached from GitHub's runner, inspect the workflow failure and retest rather than treating a missing report as a score.

The VIZCAM admin is static with localStorage and a browser-side PIN (as the owner requested); it is not secure server authentication. Do not put sensitive customer data in its local records.

## To finish account-dependent tasks
- Supply Google Search Console ownership verification from your account; exact TXT/HTML verification values are unique and must not be invented.
- Connect or share the Bing Webmaster Tools property.
- Supply a GA4 **measurement ID** for the intended web stream, and decide whether and how analytics consent will be collected.
