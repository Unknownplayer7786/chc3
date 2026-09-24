# Care Homoeo Clinic (chc3)

The website for **Care Homoeo Clinic**, Kondhwa, Pune, with Dr. Farida Dahodwala (BHMS).

This is a static site with no build step and no dependencies. It is plain HTML, CSS and JavaScript. Fonts and images are self-hosted in `assets/`.

## Structure
```
index.html            Main page
404.html              Not-found page
css/styles.css        All styles (responsive, reduced-motion, print)
js/main.js            Interactions (menu, filters, FAQ, copy, map, reveals)
assets/fonts/         Bricolage Grotesque, Karla, Caveat (woff2, latin subset)
assets/img/           Logo, section photos (WebP + JPEG), icons, OG image
assets/care-homoeo-clinic.vcf   Downloadable contact card
site.webmanifest, favicon.ico, apple-touch-icon.png, robots.txt, .nojekyll
```

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy
The site is live on GitHub Pages at https://unknownplayer7786.github.io/chc3/ (this folder served from `main`).
Any static host works: GitHub Pages, Netlify, Vercel, Cloudflare Pages.

## Where the clinic details come from
- Name, address, phone and Reg. No. 45844 come from the previous site (chc2) and match the doctor's Practo profile.
- BHMS (MUHS Nashik, 2006) and Maharashtra Council of Homoeopathy registration (2008) come from Practo.
- The list of 14 treatments comes from the Practo profile.
- The clinic chose not to show timings or fees; patients are asked to call.
- The 5.0 satisfaction rating is supplied by the clinic.
- The two photographs are AI-generated illustrations used as placeholders, not pictures of the actual clinic or doctor.
  Replace them with real photos before launch if possible.
