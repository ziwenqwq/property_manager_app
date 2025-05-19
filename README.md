# Property Management Web App

A responsive web application for managing properties, scheduling viewings, and collecting feedback with various media types.

## Features

- **Property Management**: Add and view properties with details like name, address, listing agent, price, etc.
- **Viewing Scheduling**: Book viewings for properties with date, time, and contact information
- **Feedback Collection**: Add feedback for properties with text, images, video, and audio
- **Responsive Design**: Works well on both desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## User Journeys

### Property Management

1. **Add a Property**
   - Navigate to the home page
   - Click "Add Property" or use the quick add form
   - Fill in property details (only name is required)
   - Optionally upload listing PDF and floor plans
   - Submit the form

2. **View Properties**
   - Navigate to the home page to see all properties
   - Click on a property to view its details

### Viewing Management

1. **Schedule a Viewing**
   - From the property details page, use the booking form
   - Or click "Book Viewing" on a property card
   - Fill in your details and select date/time
   - Submit the form

2. **View All Bookings**
   - Click "View All Bookings" on the home page
   - Or navigate to the Viewings page from the navigation menu

### Feedback Management

1. **Add Feedback**
   - From the property details page, use the feedback form
   - Add text feedback (required)
   - Optionally add images, video, or audio recording
   - Submit the form

2. **View Feedback**
   - On the property details page, click the "Feedback" tab
   - Or navigate to the Feedback page from the navigation menu to see all feedback

## Project Structure

\`\`\`
property-management/
├── app/                      # Next.js App Router
│   ├── add-property/         # Add property page
│   ├── bookings/             # All bookings page
│   ├── feedback/             # All feedback page
│   ├── properties/[id]/      # Property details page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── add-property-form.tsx # Property form component
│   ├── all-bookings.tsx      # All bookings component
│   ├── all-feedback.tsx      # All feedback component
│   ├── booking-form.tsx      # Booking form component
│   ├── feedback-form.tsx     # Feedback form component
│   ├── footer.tsx            # Footer component
│   ├── navbar.tsx            # Navigation component
│   ├── property-bookings.tsx # Property bookings component
│   ├── property-feedback.tsx # Property feedback component
│   ├── property-list.tsx     # Property list component
│   └── theme-toggle.tsx      # Theme toggle component
├── lib/                      # Utility functions and types
│   ├── data.ts               # Data management functions
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
\`\`\`

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- **Next.js**: React framework for server-side rendering and routing
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **React Hook Form**: Form validation and handling
- **date-fns**: Date utility library
- **UUID**: For generating unique IDs

## Future Enhancements

- Add authentication for user accounts
- Implement a database for persistent storage
- Add search and filtering for properties
- Implement notifications for new bookings
- Add a calendar view for bookings
- Implement image optimization for uploads
