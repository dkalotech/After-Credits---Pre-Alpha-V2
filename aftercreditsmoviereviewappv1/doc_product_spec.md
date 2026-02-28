
# FrameRate: Social Movie Scorecard - Product Specification

## 1. Core Concept Overview
FrameRate is a "high-fidelity" social movie review platform. Unlike Letterboxd’s simple 5-star system, FrameRate uses a **weighted multidimensional algorithm** called the **Prism Index™**. It targets cinephiles who want to express nuanced opinions and friends who want a shared "cinema-brain."

## 2. Feature Breakdown
### MVP (V1)
- **The Prism Index™:** 5-point weighted rating system.
- **Trophy Case & Basement:** Automated visualization of user's best/worst films.
- **Activity Feed:** Real-time stream of friend reviews.
- **Rate-on-Onboarding:** Swipe-based onboarding to seed the user's data.

### Future (V2+)
- **The Critics Circle:** Group chat rooms tied to specific movie threads.
- **Clash Detector:** AI-powered alerts when two friends rate a movie drastically differently.
- **Shared Watchlists:** Sync watchlists between partners or friends.
- **AR Movie Poster Scanning:** Use the camera to scan a physical poster and instantly see the "Friend Consensus."

## 3. Rating Algorithm Logic: The Prism Index™
The Final Score is calculated as:
`Score = (Plot * 0.25) + (Acting * 0.25) + (Rewatch * 0.05) + (Visuals * 0.20) + (Emotion * 0.25)`

- **Plot (25%):** Narrative structure, pacing, and originality.
- **Acting (25%):** Performance quality and character depth.
- **Rewatchability (5%):** How likely are you to watch this again? (Low weight ensures "one-time masterpieces" aren't punished).
- **Visuals (20%):** Cinematography, VFX, and production design.
- **Emotion (25%):** How did it leave you feeling? Resonance.

## 4. Anti-Review Bombing & Trust
- **Verified Friend Consensus:** The app prioritizes "Friend Score" over "Global Score."
- **Review Velocity Limits:** New accounts cannot post 100+ reviews in an hour.
- **Trust Score:** Users who consistently rate in line with "consensus" or provide long-form reviews earn higher trust weight in global averages.

## 5. UI/UX Strategy
- **Prism Visualization:** Use Radar Charts (Spider Charts) to visualize the "shape" of a movie. A visual-heavy movie will look lopsided towards the 'Visuals' axis, instantly conveying the movie's vibe.
- **Rotten-Style Boldness:** Use huge, bold percentages with amber/gold accents for high scores and slate/zinc for low scores.

## 6. Gamification
- **Genre Guru Badges:** Earned by reviewing 50+ movies in a specific genre.
- **The Streak:** Post a review every week to maintain your "Cinematic Eye" badge.
- **The Prophet:** Earn points when you rate a movie *before* it becomes a global hit.

## 7. Database Schema
- **Users:** `id, username, avatar, prism_stats_blob`
- **Reviews:** `id, user_id, movie_id, plot, acting, rewatch, visuals, emotion, comment, final_score`
- **Follows:** `id, follower_id, following_id`
- **Groups:** `id, name, member_ids, movie_id_thread`
