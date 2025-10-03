# **App Name**: Navidad Votes

## Core Features:

- User Authentication: Secure user authentication using Firebase Authentication with predefined credentials for Ángel, Félix, Goyo, Toñi, Luis, José, Pepe, Lucio, Antonio, and Virgilio.
- Protected Voting Page: Ensure only authenticated users can access the voting page, redirecting unauthorized users to the login page.
- One Vote Per User: Implement logic to allow each user to vote only once, storing the voting status in localStorage.
- Vote Counting and Display: Implement a local vote counter for each option, displaying the overall voting progress.
- Dynamic UI updates: Update elements dynamically as the user interacts with the app, giving feedback as they occur. This involves disabling the elements after a vote.

## Style Guidelines:

- Primary background: Off-white or very soft cream (#FDFBF6) for a gentle, inviting feel.
- Primary color: Dark, deep forest green (#2A4B3A) for titles and buttons, evoking a sense of nature and elegance.
- Accent color: Muted gold or brass (#B88B4A) for hover states and emphasis, providing a touch of luxury.
- Main text: Very dark gray, almost black (#333333), for comfortable readability.
- Titles (h1, h2): 'Playfair' (serif) for a classic and refined touch.
- Body text and buttons: 'PT Sans' (sans-serif) for a clean and legible user interface.
- Minimal outline icons, possibly a small snowflake or star near the main title for a festive touch.
- Voting options presented in cards with slightly rounded borders and subtle box-shadows for depth.
- Generous use of negative space to allow content to breathe and reduce cognitive load.
- Subtle transitions and feedback (microinteractions) on button presses, such as color changes or check icons.