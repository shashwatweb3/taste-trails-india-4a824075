# Taste Trails India

Build a complete, premium, interactive food discovery and community ranking web experience.

IMPORTANT:

This is NOT a "Lucknow website" and NOT a "Biryani Ka Sheher" website.

Lucknow + Biryani is only the FIRST launch city and FIRST food category.

The long-term product is an India-wide community food discovery and ranking platform where people can:

DISCOVER → VISIT → RATE → UPLOAD PHOTO → RANK → SHARE

The architecture must be designed from day one to expand from:

Lucknow → multiple Indian cities → multiple food categories → regional rankings → national rankings.

Build the first working prototype as ONE self-contained HTML file.

1. TECH STACK

Use:

HTML5

CSS3

Vanilla JavaScript

MapLibre GL JS

OpenFreeMap / OpenStreetMap-based map tiles

Real India GeoJSON boundaries

Google Fonts:

Playfair Display

Inter

DO NOT use:

Mapbox

Mapbox GL JS

Mapbox API

Mapbox access tokens

Mapbox account

Any credit card requirement

The application must work without a Mapbox account or Mapbox API key.

Use MapLibre GL JS for:

interactive map

India map

GeoJSON state layers

hover effects

state highlighting

animated flyTo

custom map styling

dynamic layers

future heatmaps

city-level map experiences

Keep the mapping implementation provider-agnostic so the basemap provider can be replaced later without rewriting the application.

2. PRODUCT CONCEPT

The product should feel like:

A premium food magazine
+
Interactive map
+
Community review platform
+
Live leaderboard
+
Food passport
+
Social sharing engine

It should NOT feel like:

a generic restaurant directory

Google Maps clone

boring review website

generic SaaS dashboard

The emotional experience should be:

"I want to explore this."

"I want to try this place."

"I disagree with this ranking."

"I need to rate this."

"I want to see where my city ranks."

"I want to share my ranking."

3. BRANDING

Do NOT use:

"Biryani Ka Sheher"

Do NOT make Lucknow part of the permanent brand identity.

Use a neutral placeholder product name:

[PRODUCT NAME]

Use a tagline such as:

"India, ranked by people who actually eat there."

or:

"Find it. Eat it. Rate it."

The current launch should be presented as:

FIRST CITY LIVE

Lucknow

FIRST CATEGORY LIVE

Biryani

Then:

More cities and categories coming soon.

4. INFORMATION ARCHITECTURE

The application hierarchy must be:

INDIA
↓
STATE
↓
CITY
↓
FOOD CATEGORY
↓
PLACES
↓
COMMUNITY RATINGS

Example:

India
→ Uttar Pradesh
→ Lucknow
→ Biryani
→ Tunday Kababi

Future:

India
→ Delhi
→ Delhi
→ Chole Bhature

India
→ Maharashtra
→ Mumbai
→ Vada Pav

India
→ Telangana
→ Hyderabad
→ Biryani

India
→ Karnataka
→ Bengaluru
→ Dosa

Do NOT hard-code this structure.

Use data-driven JavaScript objects.

5. DATA ARCHITECTURE

Create separate data structures for:

cities

states

categories

restaurants

reviews

ratings

users

photos

rankings

cityRequests

Example:

cities = {
lucknow: {
name: "Lucknow",
state: "Uttar Pradesh",
coordinates: [26.8467, 80.9462],
availableCategories: ["biryani"]
}
}

categories = {
biryani: {
name: "Biryani",
slug: "biryani"
}
}

restaurants = {
tunday: {
city: "lucknow",
category: "biryani",
...
}
}

The UI should be generated from these data structures.

Adding a new city must NOT require rebuilding the frontend.

Adding a new category must NOT require rebuilding the frontend.

6. INDIA MAP

Default screen should show a real India map.

Center:

20.5937, 78.9629

Zoom:

5

Use real Indian state boundaries.

Use GeoJSON.

Visual style:

Background:
near-black

States:
#1c1e2e

Borders:
#2a2d45

Available state:
warm amber / saffron

Available state border:
#ff9933

The map should feel premium and cinematic.

7. STATE INTERACTION

For states without live cities:

Hover:

"Coming soon"

Use subtle locked styling.

For Uttar Pradesh:

Hover:

"Explore Lucknow →"

UP should have:

warm glow

animated border pulse

subtle elevation/highlight

When user clicks UP:

Use MapLibre animated camera transition.

Fly to:

26.8467, 80.9462

Zoom:

12.5–13

Duration:

2.5 seconds.

Fade or hide other state layers.

Reveal Lucknow.

8. LUCKNOW EXPERIENCE

Once the map reaches Lucknow:

Display:

LUCKNOW

Uttar Pradesh

Then:

BIRYANI

5 places currently live.

Show five custom map markers.

DO NOT use generic/default map pins.

Each marker should have:

glowing dot

ranking number

score

subtle pulse

hover animation

9. FIRST RESTAURANT DATA

Use these five initial locations.

TUNDAY KABABI

Coordinates:

26.8509, 80.9150

Description:

"Est. 1905"

"Galawati kebab + Dum Biryani"

Approx price:

₹300

Tag:

LEGEND

IDREES BIRYANI

Coordinates:

26.8625, 80.9128

Description:

"Since 1950s"

"Dum Pukht mutton biryani"

Approx price:

₹250

Tag:

LOCAL FAV

WAHID BIRYANI

Coordinates:

26.8602, 80.9148

Description:

"100+ years"

"Royal Awadhi Biryani"

Approx price:

₹280

Tag:

ROYAL

MARHABA HOTEL

Coordinates:

26.8467, 80.9462

Description:

"Modern classic"

"Chicken biryani + seekh combo"

Approx price:

₹220

Tag:

BEST VALUE

LALLA BIRYANI

Coordinates:

26.8272, 80.9118

Description:

"Open till 3AM"

"Spicy Awadhi Biryani"

Approx price:

₹200

Tag:

NIGHT OWL

10. COMMUNITY RANKING

This is one of the CORE features.

Do NOT make the ranking static.

Every restaurant must have:

community score

number of ratings

ranking position

category scores

reviews

community photos

Seed the prototype with realistic initial values.

Example:

Tunday
9.2
1,284 ratings

Idrees
9.0
982 ratings

Wahid
8.8
721 ratings

Marhaba
8.5
418 ratings

Lalla
8.3
305 ratings

When a new review is submitted:

Calculate new average.

Update rating count.

Recalculate ranking.

Reorder leaderboard.

Update marker ranking.

Update popup.

Update restaurant cards.

Animate any ranking changes.

NO page reload.

11. RANKING FORMULA

Do NOT simply sort by raw average when there are very different numbers of votes.

Structure the code so the ranking can eventually use a weighted community score.

For the prototype, use a Bayesian-style weighted rating or another sensible confidence-adjusted formula.

Example:

score =
weighted combination of:

average rating
+
number of ratings
+
recent rating trend

Clearly separate:

rawAverage

ratingCount

rankingScore

This will make the system easier to improve later.

12. RATE A PLACE

Every restaurant should have:

RATE THIS PLACE

Overall rating:

1–10

Then optional category ratings:

Taste
1–10

Rice
1–10

Meat
1–10

Spice
1–10

Value
1–10

Review:

"Tell everyone what you thought."

Then:

ADD YOUR PHOTO

Allow image upload.

Show preview before submission.

The rating form should be beautiful and mobile-friendly.

13. PHOTO REVIEWS

A photo should be a major part of the experience.

Every restaurant has:

COMMUNITY PHOTOS

Display uploaded photos in a responsive grid.

Each review can show:

Username

Photo

Overall rating

Short review

Date

If a photo was uploaded:

✓ PHOTO REVIEW

Do NOT call this GPS verified.

For now it simply means:

"Photo submitted with review."

14. IMAGE HANDLING

For the prototype:

Use browser LocalStorage or IndexedDB where appropriate.

Resize/compress uploaded images before storing them.

Generate thumbnails.

Avoid storing huge original images unnecessarily.

Structure the code so production can later move image storage to:

Supabase Storage

or another proper object-storage system.

15. ONE REVIEW PER PLACE

For the prototype:

Prevent duplicate reviews for the same restaurant from the same browser/user identifier.

Allow:

Edit rating

Update review

Change photo

Do not allow accidental repeated submissions.

Structure this so authentication can be added later.

16. PERSONAL FOOD PASSPORT

Create:

YOUR FOOD PASSPORT

For Lucknow Biryani:

0 / 5 completed

Tunday
Idrees
Wahid
Marhaba
Lalla

When a user submits a photo review:

mark that place as completed.

Example:

3 / 5 completed

When all five are completed:

LUCKNOW BIRYANI COMPLETE

Award:

BIRYANI CONNOISSEUR

Create a satisfying completion animation.

17. YOUR RANKING

After a user rates restaurants, calculate:

YOUR LUCKNOW BIRYANI RANKING

Example:

01 Idrees
02 Tunday
03 Wahid
04 Lalla
05 Marhaba

Also display:

COMMUNITY RANKING

Compare them.

If the user's #1 differs:

"You disagree with Lucknow."

If their ranking is significantly different:

"Your taste is controversial."

This should be highly shareable.

18. CONTROVERSIAL TAKE

Calculate whether the user's rating is unusually high or low compared with the community.

Example:

YOU GAVE IDREES

9.8

COMMUNITY

8.7

Then:

CONTROVERSIAL TAKE

"You rated Idrees higher than 94% of voters."

Button:

SHARE YOUR TAKE

19. SHAREABLE RESULT CARD

Create a beautiful result card.

Example:

[PRODUCT NAME]

MY LUCKNOW BIRYANI RANKING

01 IDREES
02 TUNDAY
03 WAHID
04 LALLA
05 MARHABA

MY SCORE

46 / 50

"You have opinions."

Include:

Share on X

Copy

Download

The result card should be optimized for:

X

Instagram Stories

WhatsApp

The card should look good as an image even outside the website.

20. LIVE LEADERBOARD

Create:

LUCKNOW BIRYANI RANKINGS

Tabs:

LIVE

MOST RATED

TRENDING

NEW REVIEWS

Each row:

Rank

Restaurant

Score

Rating count

Rank movement

Example:

↑ 2

IDREES

9.2

982 ratings

When rankings change, animate the row movement.

21. TRENDING

Create:

TRENDING NOW

Examples:

IDREES

↑ +0.3

this week

TUNDAY

↑ +12%

rating activity

Use seeded prototype data.

Keep the calculation functions separate so real historical data can be used later.

22. BIRYANI TRAIL

For Lucknow:

Connect the five restaurants with a route line.

Create:

START BIRYANI TRAIL

When clicked:

Automatically fly between all five restaurants.

At every stop:

highlight marker

zoom

show restaurant card

show score

wait

continue

Display:

STOP 1 / 5

STOP 2 / 5

STOP 3 / 5

STOP 4 / 5

STOP 5 / 5

Controls:

PAUSE

NEXT

END TRAIL

Build this as a reusable "Food Trail" system so it works for any city/category later.

23. RESTAURANT POPUP

Create fully custom HTML popups.

Do NOT use default Leaflet/MapLibre popup styling.

Dark card:

#11131f

Restaurant name:

Playfair Display.

Show:

Rank

Community score

Ratings

Price

Tag

Description

Community photos

Rate this place

Open in Google Maps

Google Maps links:

Tunday:
https://maps.google.com/?q=Tunday+Kababi+Lucknow

Idrees:
https://maps.google.com/?q=Idrees+Biryani+Chowk+Lucknow

Wahid:
https://maps.google.com/?q=Wahid+Biryani+Lucknow

Marhaba:
https://maps.google.com/?q=Marhaba+Hotel+Aminabad+Lucknow

Lalla:
https://maps.google.com/?q=Lalla+Biryani+Sadar+Lucknow

24. CITY EXPLORER

Create a reusable city page.

Example:

LUCKNOW

Uttar Pradesh

Explore:

Biryani

Coming soon:

Kebabs

Chaat

Kulfi

Future cities:

Delhi

Mumbai

Hyderabad

Kolkata

Bengaluru

Amritsar

Jaipur

Pune

Varanasi

Do not make these fake/live.

Clearly label unavailable categories as:

COMING SOON

25. CITY REQUEST SYSTEM

For cities that aren't live:

Show:

WANT YOUR CITY NEXT?

Allow user to request a city.

Options:

Delhi

Mumbai

Hyderabad

Kolkata

Bengaluru

Amritsar

Jaipur

Other

Display demand:

"1,284 people want Delhi."

For prototype, use seeded values.

This creates a community-driven expansion loop.

26. INDIA RANKINGS

Create a future-ready section:

INDIA RANKINGS

Categories:

Biryani

Dosa

Vada Pav

Chole Bhature

Kathi Roll

Chaat

Kulcha

etc.

For the first launch, only Biryani/Lucknow should have live data.

Other categories can show:

COMING SOON

Do not fabricate national rankings using fake restaurant data.

27. CITY VS NATIONAL RANKING

Architecture must eventually support:

LOCAL RANKING

Lucknow's Best Biryani

vs

NATIONAL RANKING

India's Best Biryani

The same community rating system should feed both.

Future example:

INDIA'S BEST BIRYANI

01 Hyderabad
02 Lucknow
03 Kolkata
04 Delhi
05 Mumbai

But only display actual rankings when enough real data exists.

28. LIVE COMMUNITY STATS

Create a subtle community section:

THE COMMUNITY

12,842 ratings

3,921 photos

5 live places

18 cities requested

For prototype use seeded values.

Later these become backend-driven.

Animate counters when visible.

29. MAP LEGEND

Bottom/right:

LIVE PLACES

5

COMMUNITY RANKING

LIVE

FOOD TRAIL

AVAILABLE

Make the legend responsive.

30. TOP NAVIGATION

Desktop:

Left:

[PRODUCT NAME]

Center:

Explore

Cities

Rankings

Food

Right:

Your Passport

Mobile:

Hamburger navigation.

Keep the interface minimal.

31. HERO SCREEN

When the website first loads, do not immediately overwhelm the user with UI.

Show:

INDIA

A subtle headline:

WHERE SHOULD YOU EAT?

Subheading:

"Explore India's food scene through the people who actually eat it."

Then:

EXPLORE INDIA

The India map is the hero.

32. FIRST LAUNCH CALLOUT

Somewhere on the India view:

FIRST CITY LIVE

LUCKNOW

BIRYANI

5 PLACES

EXPLORE →

This communicates the current launch without making it the permanent identity of the product.

33. VIRAL MOMENTS

Build shareable moments throughout the experience.

When unlocking Lucknow:

"YOU FOUND THE FIRST CITY."

When ranking changes:

"IDREES JUST TOOK #1."

When user disagrees:

"YOU DISAGREE WITH THE COMMUNITY."

When unusual rating:

"CONTROVERSIAL TAKE."

When completing five places:

"FOOD PASSPORT COMPLETE."

When sharing:

"MY LUCKNOW BIRYANI RANKING."

These should have polished animations.

34. DESIGN SYSTEM

Visual direction:

Premium editorial food publication
+
cinematic dark map
+
Indian food culture
+
modern interactive product

Colors:

Background:
#0b0c12

Card:
#11131f

Cream:
#f4ead8

Amber:
#ff9933

Saffron:
#b8540a

Gold:
#c9a227

Muted red:
#c0392b

Typography:

Playfair Display:

Headlines
Restaurant names
Major rankings

Inter:

UI
Buttons
Metadata
Scores

Use generous negative space.

Use subtle texture/noise.

Use soft shadows.

Use smooth micro-interactions.

Avoid:

excessive gradients

neon overload

generic SaaS cards

excessive rounded rectangles

clutter

unnecessary animations

35. MOBILE FIRST

This product will primarily be discovered through social media.

Mobile experience is extremely important.

On mobile:

Map fills most of the viewport.

Restaurant details appear as bottom sheets.

Ratings use large touch targets.

Photo upload is prominent.

Leaderboard can become a swipeable card.

Share button should always be easy to access.

Passport should be easy to open.

The site must feel excellent on:

iPhone

Android

desktop

tablet

36. PERFORMANCE

Keep the application lightweight.

Use:

MapLibre

CSS animations

lazy loading

compressed images

efficient DOM updates

Do not introduce unnecessary frameworks.

Avoid huge external libraries.

37. BACKEND-READY ARCHITECTURE

The prototype can use:

LocalStorage / IndexedDB

for:

reviews

ratings

passport progress

photos

user preferences

But clearly separate data functions from UI functions.

Create functions such as:

addReview()

updateReview()

calculateAverage()

calculateRankingScore()

getRestaurantRanking()

getCityRanking()

getNationalRanking()

getTrendingPlaces()

uploadPhoto()

getCommunityStats()

completePassport()

requestCity()

This will make it easy to connect Supabase later.

38. FUTURE SUPABASE STRUCTURE

Design the data layer so it can eventually support:

users

cities

states

categories

restaurants

reviews

ratings

photos

restaurant_stats

city_rankings

national_rankings

city_requests

passport_progress

helpful_votes

user_follows

achievements

Do NOT implement all of this now.

Just make the frontend architecture compatible with it.

39. FUTURE SOCIAL FEATURES

Leave room for:

User profiles

Followers

Following

Helpful review votes

Reviewer reputation

Top reviewers

City ambassadors

Food challenges

Badges

Achievements

Seasonal rankings

Editor's picks

Community awards

"Best in Lucknow"

"Best in India"

"Most underrated"

"Most controversial"

"Fastest rising"

40. PRODUCT GROWTH LOOP

The website should naturally create this loop:

USER DISCOVERS SITE

↓

Explores India

↓

Unlocks city

↓

Finds food category

↓

Views places

↓

Visits place

↓

Uploads photo

↓

Rates place

↓

Ranking changes

↓

User sees their ranking

↓

User disagrees with community

↓

User shares result

↓

Friends click the shared result

↓

Friends rate places

↓

Ranking changes again

↓

More people visit

This loop is more important than adding random features.

41. IMPORTANT PRODUCT RULE

Do NOT build a restaurant directory.

Do NOT build a static food map.

Do NOT hard-code Lucknow into the entire application.

Build the FOUNDATION for:

INDIA'S COMMUNITY FOOD RANKING PLATFORM

Lucknow + Biryani is simply:

THE FIRST LIVE EXPERIENCE.

The application must make it easy to go from:

1 city

→ 10 cities

→ 50 cities

→ all major Indian cities

and:

1 food category

→ 10 categories

→ 50 categories

without rebuilding the frontend.

42. FINAL USER JOURNEY

The final experience should be:

OPEN WEBSITE

↓

See India

↓

"Where should you eat?"

↓

Explore India

↓

Unlock Uttar Pradesh

↓

Fly into Lucknow

↓

See Biryani

↓

Discover five places

↓

Open restaurant

↓

See community photos

↓

Rate

↓

Upload photo

↓

Submit

↓

Ranking changes LIVE

↓

See:

"Your ranking vs Community"

↓

See:

"Controversial Take"

↓

Share result

↓

Continue Biryani Trail

↓

Complete 5/5

↓

Unlock:

Biryani Connoisseur

↓

Return later

↓

Discover:

New city

↓

New food category

↓

Continue exploring India

43. OUTPUT REQUIREMENTS

Build the complete working prototype now.

Output:

ONE HTML FILE.

All CSS inline.

All JavaScript inline.

No build system required.

No npm required.

No Mapbox.

No API keys.

No credit card.

MapLibre must work directly in the browser.

Use CDN imports where necessary.

Make sure there are no console errors.

Make sure the map loads.

Make sure the India → Uttar Pradesh → Lucknow transition works.

Make sure all five restaurant markers work.

Make sure the rating system works.

Make sure photo upload preview works.

Make sure ranking dynamically changes.

Make sure passport progress works.

Make sure Biryani Trail works.

Make sure the shareable ranking card works.

Make sure mobile responsive behavior works.

Before finishing, test every major interaction and fix any JavaScript errors.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5467feb3-5077-4923-a175-e55d530902b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
