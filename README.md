# VIZCAM | Smart Security & Automation Solutions

This repository hosts the separate VIZCAM website for **https://www.vizcam.in/**. It reproduces the current VIZCAM design, logo, services, gallery, and contact options from the https://www.vizcam.me/ website. The original `MEC-OSH/vizcam` repository remains unchanged.

## Contact details

- **Phone / WhatsApp:** +91 89438 54151
- **Service:** service@vizcam.me
- **General enquiries:** info@vizcam.me
- **Location:** Manjeri, Malappuram, Kerala, India

The emails intentionally remain `@vizcam.me`, matching the other website. They must have working mailboxes with an email service provider; GitHub Pages only hosts the website.

## Publish using GitHub Pages

1. Open [this repository's Pages settings](https://github.com/MEC-OSH/VIZCAM.IN/settings/pages).
2. Select **Deploy from a branch**, branch **main**, folder **/(root)**, and click **Save**.
3. Set **Custom domain** to `www.vizcam.in`. The root `CNAME` file already contains `www.vizcam.in`.
4. In your **vizcam.in** domain's authoritative DNS panel (GoDaddy if the domain uses GoDaddy DNS), set these A records for **@**:
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`
5. Add or edit CNAME `www` to `mec-osh.github.io`, TTL 1 Hour.
6. Remove only conflicting *website* parking records. Keep all existing email MX, SPF, DKIM, DMARC and related DNS records.
7. Allow time for DNS verification and HTTPS certificate issuance, then enable **Enforce HTTPS** under Pages.
8. Test `https://www.vizcam.in/`, `https://vizcam.in/`, gallery filters, WhatsApp quotation form, clickable email links and mobile navigation.

## Update website

- `index.html`: page content, contact details, SEO and links
- `css/styles.css`: styling and responsive behavior
- `js/script.js`: menu, gallery and WhatsApp quotation interactions
- `assets/`: illustration and logo files
- `sitemap.xml` and `robots.txt`: search crawler settings for `www.vizcam.in`

**Note:** Gallery visuals are currently illustrations, not verified photos from VIZCAM's past projects. Add real installation photos once available.

For help: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
