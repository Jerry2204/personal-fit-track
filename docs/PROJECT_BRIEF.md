I want to build a personal fitness tracking application called FitTrack Pro.

The application should be a personal gym tracker and running tracker that helps users track their fitness progress daily, monthly, and yearly.

The app should not be AI-focused. It should be a real, practical fitness productivity app that can be used as a serious portfolio project for a software engineer.

Main goal:
Create an application where users can record, monitor, and analyze their gym workouts, running activities, body progress, and long-term fitness improvements.

Core Features:

1. Authentication
- User registration
- User login
- Forgot password
- Secure authentication using JWT or session-based auth
- User profile management

2. User Profile
Users should be able to store:
- Name
- Age
- Gender
- Height
- Weight
- Fitness goal: fat loss, muscle gain, maintenance, endurance, strength
- Activity level
- Target body weight
- Weekly workout target
- Weekly running target

3. Dashboard
Create a clean dashboard that shows:
- Today’s workout status
- Today’s running status
- Weekly gym progress
- Weekly running mileage
- Monthly workout summary
- Yearly progress overview
- Current weight
- Total workouts completed
- Total running distance
- Total calories burned estimate
- Personal records

The dashboard should use charts, cards, and progress indicators.

4. Gym Workout Tracker
Users should be able to create and log gym workouts.

Workout data should include:
- Workout date
- Workout type: Push, Pull, Leg, Full Body, Upper Body, Lower Body, Custom
- Exercise name
- Muscle group
- Sets
- Reps
- Weight used
- Rest time
- Notes
- Workout duration
- Perceived difficulty / RPE

Example:
Workout: Push Day
Exercise: Bench Press
Set 1: 40 kg x 12 reps
Set 2: 50 kg x 10 reps
Set 3: 55 kg x 8 reps

5. Exercise Library
Create an exercise library with:
- Exercise name
- Muscle group
- Equipment type
- Difficulty level
- Instructions
- Optional custom exercises created by the user

Muscle groups:
- Chest
- Back
- Shoulders
- Biceps
- Triceps
- Legs
- Glutes
- Core
- Full Body

6. Progressive Overload Tracker
The app should help users track strength progression over time.

For each exercise, show:
- Previous weight
- Current weight
- Best weight
- Best reps
- Estimated one-rep max
- Volume progression
- Monthly strength improvement

Formula example:
Volume = sets x reps x weight

7. Running Tracker
Users should be able to log running activities.

Running data should include:
- Run date
- Distance in kilometers
- Duration
- Average pace
- Running type: Easy Run, Recovery Run, Tempo Run, Interval Run, Long Run, Race
- Heart rate zone if available
- Calories estimate
- Running shoes used
- Notes

The app should automatically calculate:
- Average pace
- Total weekly distance
- Total monthly distance
- Total yearly distance
- Best 1K pace
- Best 5K time
- Best 10K time
- Best half marathon estimate

8. Running Progress Analytics
Create analytics for:
- Weekly mileage
- Monthly mileage
- Yearly mileage
- Pace improvement
- Longest run
- Fastest run
- Running consistency
- Personal best records

Charts should include:
- Distance per week
- Distance per month
- Average pace trend
- Running activity calendar
- Running type distribution

9. Daily Progress Tracking
Users should be able to track daily fitness habits:
- Workout completed or not
- Running completed or not
- Steps
- Water intake
- Sleep duration
- Body weight
- Calories intake
- Protein intake
- Mood
- Energy level

10. Body Progress Tracker
Users should be able to log:
- Body weight
- Body fat percentage
- Waist measurement
- Chest measurement
- Arm measurement
- Thigh measurement
- Progress photos
- Notes

Show progress comparison by:
- Daily
- Weekly
- Monthly
- Yearly

11. Goals System
Users should be able to create goals such as:
- Run 100 km this month
- Complete 20 gym sessions this month
- Lose 5 kg in 3 months
- Bench press 80 kg
- Run 10K under 60 minutes
- Maintain 120g protein per day

Each goal should have:
- Goal name
- Goal type
- Target value
- Current progress
- Deadline
- Status: active, completed, failed

12. Calendar View
Create a calendar page where users can see:
- Gym sessions
- Running sessions
- Rest days
- Missed workouts
- Body progress logs
- Habit logs

Use different indicators or labels for each activity type.

13. Monthly Report
Generate a monthly summary report containing:
- Total gym sessions
- Total running distance
- Average pace
- Total workout volume
- Body weight change
- Goals completed
- Most trained muscle group
- Most frequent running type
- Best performance of the month
- Consistency score

14. Yearly Report
Generate a yearly fitness report containing:
- Total workouts
- Total running distance
- Total running time
- Total workout volume
- Weight progress
- Biggest strength improvement
- Fastest run
- Longest run
- Most consistent month
- Yearly achievement summary

15. Personal Records
Track personal records automatically:
- Heaviest lift per exercise
- Highest workout volume
- Fastest 1K
- Fastest 5K
- Fastest 10K
- Longest running distance
- Most workouts in a month
- Highest monthly mileage

16. Workout Plan Feature
Allow users to create weekly workout plans.

Example:
Monday: Push Day
Tuesday: Pull Day
Wednesday: Rest
Thursday: Leg Day
Friday: Tempo Run
Saturday: Full Body
Sunday: Long Run

Users should be able to mark each plan as:
- Completed
- Skipped
- Rescheduled

17. Running Plan Feature
Allow users to create running plans:
- Easy Run
- Interval Run
- Tempo Run
- Recovery Run
- Long Run

Each plan should include:
- Distance target
- Duration target
- Pace target
- Notes

18. Recovery Tracker
Add recovery-related features:
- Sleep tracking
- Rest day tracking
- Soreness level
- Fatigue level
- Injury notes
- Recovery score

19. Nutrition Tracker — Simple Version
Create a simple nutrition tracker, not a full calorie app.

Track:
- Daily calories
- Protein
- Carbs
- Fat
- Water intake
- Supplements

Supplement examples:
- Whey protein
- Creatine
- Multivitamin
- Electrolyte

20. Shoe Mileage Tracker
For runners, create a shoe mileage tracker.

Users should be able to add running shoes:
- Brand
- Model
- Purchase date
- Max recommended mileage
- Current mileage

Every running activity can be linked to a shoe, and the app should calculate total mileage per shoe.

21. Statistics and Charts
Use charts for:
- Weight trend
- Workout volume trend
- Exercise strength trend
- Running distance trend
- Pace trend
- Monthly consistency
- Goal progress
- Muscle group distribution

22. Search and Filter
Users should be able to search and filter:
- Workouts by date
- Exercises by muscle group
- Runs by type
- Progress logs by month
- Goals by status

23. Export Feature
Allow users to export data as:
- CSV
- PDF report

Exportable reports:
- Monthly fitness report
- Yearly fitness report
- Running history
- Gym workout history
- Body progress history

24. Notification / Reminder Feature
Add reminders for:
- Workout schedule
- Running schedule
- Water intake
- Body weight check-in
- Monthly progress review

25. Gamification
Add simple gamification features:
- Streak counter
- Achievement badges
- Monthly consistency score
- Level system
- Personal milestones

Example badges:
- First 5K Run
- 10 Workouts Completed
- 100 KM Monthly Run
- 30-Day Consistency
- New Strength PR

Recommended Tech Stack:

Frontend:

- Next.js 16.2.9
- React 19.2.7
- TypeScript 6.0.3
- Tailwind CSS 4.3.0
- Shadcn UI using the official shadcn CLI
- Recharts 3.8.1 for charts
- TanStack Query 5.101.0 for server-state management and API data fetching
- Zustand 5.0.14 for client-state management

Backend:

- NestJS 11.1.24
- TypeScript 6.0.3
- PostgreSQL 16
- Prisma ORM 7.8.0
- @prisma/client 7.8.0
- JWT Authentication using @nestjs/jwt 11.0.2 and passport-jwt 4.0.1
- REST API using NestJS Controllers and Services

Database:

- PostgreSQL 18.4

Optional:
- Redis for caching dashboard statistics
- Docker for local development
- Swagger for API documentation
- Sentry for error monitoring
- React Hook Form + Zod for form validation

Main Pages:
1. Landing Page
2. Login Page
3. Register Page
4. Dashboard Page
5. Gym Workout Page
6. Workout Detail Page
7. Add Workout Page
8. Exercise Library Page
9. Running Tracker Page
10. Add Running Activity Page
11. Body Progress Page
12. Goals Page
13. Calendar Page
14. Monthly Report Page
15. Yearly Report Page
16. Personal Records Page
17. Settings Page

Database Entities:
- User
- Profile
- Workout
- WorkoutExercise
- Exercise
- RunActivity
- BodyProgress
- Goal
- HabitLog
- WorkoutPlan
- RunningPlan
- Shoe
- Achievement
- MonthlyReport
- YearlyReport

UI/UX Requirements:
- Clean, modern, and responsive design
- Mobile-first layout
- Dashboard should look professional
- Use cards, charts, tables, and progress bars
- Make the app suitable for daily use
- Prioritize simple user experience
- Avoid overcomplicated flows
- Use dark mode and light mode if possible

Technical Requirements:
- Use clean architecture
- Separate frontend and backend clearly
- Use reusable components
- Use proper API validation
- Use pagination where needed
- Use database indexing for performance
- Use proper error handling
- Use loading states and empty states
- Use seed data for demo purposes
- Write clean, readable, and maintainable code

Portfolio Requirements:
This project should demonstrate:
- Fullstack development skill
- Authentication
- CRUD operations
- Relational database design
- Data visualization
- Dashboard analytics
- Form validation
- API design
- Clean UI/UX
- Real-world problem solving
- Performance awareness
- Scalable code structure

Please generate the project step by step.

Start by:
1. Designing the system architecture
2. Creating the database schema
3. Creating the backend API structure
4. Creating the frontend page structure
5. Creating the dashboard UI
6. Implementing gym tracker features
7. Implementing running tracker features
8. Implementing progress analytics
9. Implementing reports
10. Improving UI/UX and performance

Important:
Do not generate everything randomly.
Think like a senior software engineer.
Prioritize clean code, scalability, and real-world usability.
Make this application impressive enough to be used as a software engineer portfolio project.