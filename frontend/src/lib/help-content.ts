export interface HelpSection {
  title: string
  content: string
  steps?: string[]
  tips?: string[]
}

export interface HelpPage {
  slug: string
  title: string
  description: string
  icon: string
  href: string
  sections: HelpSection[]
}

export const helpPages: HelpPage[] = [
  {
    slug: "dashboard",
    title: "Dashboard",
    description: "Your fitness command center — see all your progress at a glance.",
    icon: "LayoutDashboard",
    href: "/help/dashboard",
    sections: [
      {
        title: "Overview",
        content: "The Dashboard is the first thing you see after logging in. It gives you a snapshot of today's activity, weekly progress, and long-term trends. Use it to quickly check your workout status, running mileage, weight trends, and personal records.",
      },
      {
        title: "Today's Status",
        content: "The top section shows whether you have completed a workout or run today. It also displays your current body weight and a quick summary of the day's activity.",
        tips: [
          "Log a workout or run first to see today's status update.",
          "Your current weight is pulled from your latest body progress entry.",
        ],
      },
      {
        title: "Weekly Progress",
        content: "Progress bars compare your current week's workout count and running distance against your weekly targets. Targets are set in your profile settings.",
        tips: [
          "Set realistic weekly targets in Settings to stay motivated.",
          "The progress bars update automatically as you log activities.",
        ],
      },
      {
        title: "Charts & Trends",
        content: "The dashboard includes charts for workout volume over time, running distance, pace trends, weight changes, goal completion, and habit consistency. Hover over data points for exact values.",
      },
      {
        title: "Recent Activity",
        content: "The activity list shows your most recent workouts and runs. Click any entry to view the full details.",
      },
      {
        title: "Personal Records Summary",
        content: "Your latest personal records are shown at a glance — heaviest lift, fastest run, longest distance, and more. These update automatically as you log new achievements.",
      },
    ],
  },
  {
    slug: "exercises",
    title: "Exercise Library",
    description: "Browse, search, and manage your exercise database.",
    icon: "BookOpen",
    href: "/help/exercises",
    sections: [
      {
        title: "Overview",
        content: "The Exercise Library is a searchable database of exercises organised by muscle group. Each exercise includes details like equipment needed, difficulty level, and instructions. You can also create your own custom exercises.",
      },
      {
        title: "Browsing Exercises",
        content: "Exercises are displayed in a card grid. Use the muscle group filter to narrow down results, or use the search bar to find a specific exercise by name.",
      },
      {
        title: "Exercise Details",
        content: "Click any exercise card to view full details including the targeted muscle group, required equipment, difficulty level, and step-by-step instructions.",
      },
      {
        title: "Creating Custom Exercises",
        content: "If an exercise is not in the library, you can add your own. Click 'Add Exercise' and fill in the name, muscle group, equipment, difficulty, and instructions. Custom exercises are only visible to you.",
        steps: [
          "Go to the Exercises page from the sidebar.",
          'Click the "Add Exercise" button.',
          "Fill in the exercise name, select a muscle group, choose equipment and difficulty.",
          "Add instructions (optional but helpful).",
          "Save — your exercise is now available when creating workouts.",
        ],
      },
      {
        title: "Deleting Custom Exercises",
        content: "You can delete custom exercises you have created. Built-in exercises cannot be deleted.",
      },
    ],
  },
  {
    slug: "workouts",
    title: "Gym Workout Tracker",
    description: "Log, track, and review your gym sessions in detail.",
    icon: "Dumbbell",
    href: "/help/workouts",
    sections: [
      {
        title: "Overview",
        content: "The Workout Tracker lets you log every gym session with detailed exercise and set data. Record what you lifted, how many reps and sets you completed, and track your progress over time.",
      },
      {
        title: "Creating a Workout",
        content: "Start a new workout by clicking 'New Workout'. Select a workout type (Push, Pull, Legs, Full Body, Upper Body, Lower Body, or Custom) and set the date.",
        steps: [
          'Go to Workouts and click "New Workout".',
          "Choose a workout type and date.",
          "Add exercises from the exercise library.",
          "For each exercise, log your sets: weight, reps, and optional rest time.",
          "Set your overall workout duration and perceived difficulty (RPE).",
          "Save the workout.",
        ],
        tips: [
          "Use the RPE scale (1-10) to rate workout difficulty — 10 is maximum effort.",
          "Add notes to remember specific details about a session.",
          "You can add multiple exercises in one workout.",
        ],
      },
      {
        title: "Viewing Workout History",
        content: "The Workouts list shows all your past sessions sorted by date. Each card shows the workout type, date, exercise count, and total volume.",
      },
      {
        title: "Workout Details",
        content: "Click any workout to see the full breakdown: every exercise, every set with weight and reps, total volume, duration, and notes.",
      },
      {
        title: "Editing and Deleting",
        content: "From the workout detail page, you can edit exercises and sets, or delete the entire workout. Deleting is permanent and cannot be undone.",
      },
      {
        title: "Understanding Volume",
        content: "Volume is calculated as: sets × reps × weight for each exercise. Total workout volume is the sum of all exercise volumes. Tracking volume helps measure your training load over time.",
      },
    ],
  },
  {
    slug: "running",
    title: "Running Tracker",
    description: "Log runs, track mileage, and monitor your pace improvements.",
    icon: "Footprints",
    href: "/help/running",
    sections: [
      {
        title: "Overview",
        content: "The Running Tracker lets you log every run — distance, duration, pace, and type. The app automatically calculates your average pace, weekly mileage, and personal bests.",
      },
      {
        title: "Logging a Run",
        content: "Click 'Log Run' and enter your run details. The app calculates average pace automatically from distance and duration.",
        steps: [
          'Go to Running and click "Log Run".',
          "Enter the date, distance (km), and duration.",
          "Select the run type: Easy Run, Recovery Run, Tempo Run, Interval Run, Long Run, or Race.",
          "Optionally link a pair of shoes, add heart rate data, calories, and notes.",
          "Save to log the run.",
        ],
        tips: [
          "Be accurate with distance and duration for precise pace calculation.",
          "Use the shoe tracker to link runs to specific shoes and track mileage.",
          "Log your warm-up and cool-down as separate easy runs if desired.",
        ],
      },
      {
        title: "Run Types Explained",
        content: "Easy Run — comfortable pace, conversational. Recovery Run — very easy, short distance. Tempo Run — comfortably hard, sustained effort. Interval Run — alternating fast and slow segments. Long Run — extended distance at easy pace. Race — any competitive event.",
      },
      {
        title: "Viewing Run History",
        content: "The Running page shows all your logged runs. Each entry displays distance, pace, duration, and run type. Click any run for full details.",
      },
      {
        title: "Running Analytics",
        content: "Charts show your weekly and monthly mileage trends, pace improvements, and running type distribution. Use these to track your progress and identify patterns.",
      },
      {
        title: "Automatic Calculations",
        content: "The app automatically calculates: average pace, total weekly/monthly/yearly distance, best 1K pace, best 5K time, and best 10K time.",
      },
    ],
  },
  {
    slug: "body-progress",
    title: "Body Progress",
    description: "Track body measurements and weight changes over time.",
    icon: "Activity",
    href: "/help/body-progress",
    sections: [
      {
        title: "Overview",
        content: "The Body Progress tracker helps you log and visualise changes in your body measurements over time. Track weight, body fat, and circumference measurements.",
      },
      {
        title: "Logging Measurements",
        content: "Click 'Add Entry' to record your latest measurements. You can log weight, body fat percentage, and measurements for waist, chest, arms, and thighs.",
        steps: [
          "Go to Body Progress from the sidebar.",
          'Click "Add Entry".',
          "Enter your weight and optional body fat percentage.",
          "Add optional measurements (waist, chest, arms, thighs).",
          "Add notes if desired and save.",
        ],
        tips: [
          "Measure at the same time of day for consistent tracking.",
          "Weekly measurements are usually enough to see trends.",
          "Don't obsess over daily fluctuations — focus on the trend.",
        ],
      },
      {
        title: "Viewing Progress",
        content: "Measurements are displayed in a table sorted by date. Charts show weight trends over time so you can visualise your progress.",
      },
      {
        title: "Progress Comparisons",
        content: "View your progress by day, week, month, or year. Use the filter to compare specific periods and see how far you have come.",
      },
    ],
  },
  {
    slug: "goals",
    title: "Goals",
    description: "Set fitness goals and track your progress toward achieving them.",
    icon: "Target",
    href: "/help/goals",
    sections: [
      {
        title: "Overview",
        content: "The Goals system lets you create specific fitness targets and track your progress. Goals can be based on running distance, workout frequency, body weight, strength, nutrition, or any custom metric.",
      },
      {
        title: "Creating a Goal",
        content: "Click 'New Goal' to create a goal. Choose a goal type, set a target value and deadline, and the app will track your progress automatically.",
        steps: [
          'Go to Goals and click "New Goal".',
          "Choose a goal type (running distance, workouts, weight, strength, nutrition, or custom).",
          "Give your goal a name (e.g., 'Run 100 km this month').",
          "Set the target value and deadline.",
          "Save — your goal will appear with progress starting at 0%.",
        ],
        tips: [
          "Set realistic deadlines to stay motivated.",
          "Goals update automatically as you log workouts, runs, and measurements.",
          "Complete a goal to earn achievement badges.",
        ],
      },
      {
        title: "Goal Statuses",
        content: "Active — you are working toward this goal. Completed — you reached the target before the deadline. Failed — the deadline passed without reaching the target.",
      },
      {
        title: "Tracking Progress",
        content: "Each goal card shows a progress bar with your current percentage. Goals that are close to completion are highlighted.",
      },
    ],
  },
  {
    slug: "habits",
    title: "Habit Log",
    description: "Build and track daily fitness habits and health metrics.",
    icon: "ListChecks",
    href: "/help/habits",
    sections: [
      {
        title: "Overview",
        content: "The Habit Log helps you track daily health and fitness habits. Monitor workouts, steps, water intake, sleep, nutrition, and how you feel each day.",
      },
      {
        title: "Logging Daily Habits",
        content: "Each day you can log multiple habits. Check off workouts and running, enter steps, water intake, sleep hours, calories, protein, and rate your mood and energy.",
        steps: [
          "Go to Habits from the sidebar.",
          "Select the date (defaults to today).",
          "Check workout and running completed boxes.",
          "Enter numerical values for steps, water, sleep, calories, protein.",
          "Rate your mood and energy level.",
          "Save to record the day.",
        ],
        tips: [
          "Building consistency with daily logging is more important than perfect data.",
          "Use the mood and energy trackers to spot patterns in how exercise affects you.",
          "Review past logs to see your consistency over time.",
        ],
      },
      {
        title: "Viewing History",
        content: "Past habit logs are displayed in a list sorted by date. Each entry shows all the data recorded for that day at a glance.",
      },
      {
        title: "Consistency Tracking",
        content: "The habit consistency chart shows your logging streak and helps identify patterns in your daily routines.",
      },
    ],
  },
  {
    slug: "calendar",
    title: "Calendar View",
    description: "See all your fitness activities in a monthly calendar view.",
    icon: "Calendar",
    href: "/help/calendar",
    sections: [
      {
        title: "Overview",
        content: "The Calendar view shows all your activities — workouts, runs, body progress entries, and habit logs — on a monthly calendar. Each activity type is colour-coded for easy identification.",
      },
      {
        title: "Navigating the Calendar",
        content: "Use the month navigator to move between months. Days with activities show coloured indicators. Click a day to see a detailed list of everything logged on that date.",
      },
      {
        title: "Activity Indicators",
        content: "Different colours represent different activity types: gym sessions, runs, body measurements, and habit logs. Days with multiple activities show multiple indicators.",
      },
      {
        title: "Clicking a Day",
        content: "Click any day to view all activities logged for that date. Each entry links to the full detail page for that workout, run, or log.",
      },
    ],
  },
  {
    slug: "reports",
    title: "Reports",
    description: "Generate monthly and yearly summaries of your fitness journey.",
    icon: "BarChart3",
    href: "/help/reports",
    sections: [
      {
        title: "Overview",
        content: "The Reports section generates monthly and yearly fitness summaries. Reports include totals, averages, best performances, and progress insights.",
      },
      {
        title: "Monthly Report",
        content: "The monthly report shows: total gym sessions, total running distance and time, average pace, total workout volume, body weight changes, goals completed, most trained muscle groups, and a consistency score.",
      },
      {
        title: "Yearly Report",
        content: "The yearly report shows: total workouts and runs, total distance and volume, biggest strength improvements, fastest and longest runs, most consistent month, and a yearly achievement summary.",
      },
      {
        title: "Generating Reports",
        content: "Select a month or year from the dropdown. Reports are generated automatically from your logged data — no manual entry needed.",
        tips: [
          "The more data you log, the more insightful your reports become.",
          "Use reports to plan your next training block based on past performance.",
        ],
      },
    ],
  },
  {
    slug: "records",
    title: "Personal Records",
    description: "View your best performances across all activities.",
    icon: "Trophy",
    href: "/help/records",
    sections: [
      {
        title: "Overview",
        content: "Personal Records automatically tracks your best performances. Heaviest lifts, highest volumes, fastest runs, and longest distances are all calculated from your logged data.",
      },
      {
        title: "How Records Work",
        content: "Records update automatically when you log a new workout or run that beats your previous best. There is no manual entry needed.",
      },
      {
        title: "Types of Records",
        content: "Gym records: heaviest weight per exercise, highest workout volume. Running records: fastest 1K, 5K, 10K, longest distance. Overall records: most workouts in a month, highest monthly mileage.",
      },
      {
        title: "Viewing Records",
        content: "Records are displayed in cards grouped by category. Each card shows your best value and the date it was achieved.",
      },
    ],
  },
  {
    slug: "shoes",
    title: "Shoe Mileage Tracker",
    description: "Track mileage on your running shoes and know when to replace them.",
    icon: "SportShoe",
    href: "/help/shoes",
    sections: [
      {
        title: "Overview",
        content: "The Shoe Mileage Tracker helps runners monitor how many kilometres they have put on each pair of shoes. Knowing your shoe mileage helps you replace them at the right time to prevent injury.",
      },
      {
        title: "Adding Shoes",
        content: "Click 'Add Shoes' to register a new pair. Enter the brand, model, purchase date, and the manufacturer's recommended maximum mileage.",
        steps: [
          'Go to Shoes and click "Add Shoes".',
          "Enter the brand and model (e.g., 'Nike Pegasus 40').",
          "Set the purchase date and max recommended mileage.",
          "Save — the shoe is now available to link to runs.",
        ],
      },
      {
        title: "Linking Shoes to Runs",
        content: "When logging a run, select which shoes you wore. The mileage is automatically added to that shoe's total.",
      },
      {
        title: "Monitoring Mileage",
        content: "Each shoe card shows current mileage, max mileage, and a progress bar. When mileage approaches the max, consider replacing them.",
        tips: [
          "Most running shoes last 500-800 km depending on the brand and your running style.",
          "Rotate between multiple pairs to extend their lifespan.",
          "Replace shoes when the mileage approaches the max recommended limit.",
        ],
      },
    ],
  },
  {
    slug: "settings",
    title: "Settings",
    description: "Manage your profile, preferences, and personal targets.",
    icon: "Settings",
    href: "/help/settings",
    sections: [
      {
        title: "Overview",
        content: "The Settings page lets you manage your profile information, fitness preferences, and weekly targets. You can also update your profile picture here.",
      },
      {
        title: "Profile Information",
        content: "Update your name, age, gender, height, and other personal details. These are used across the app for personalised recommendations and calculations.",
      },
      {
        title: "Fitness Details",
        content: "Set your current weight, target weight, fitness goal, and activity level. These help the app tailor your dashboard and track your progress.",
      },
      {
        title: "Weekly Targets",
        content: "Set your weekly workout target (how many gym sessions per week) and weekly running target (kilometres per week). These are displayed as progress bars on the dashboard.",
      },
      {
        title: "Profile Picture",
        content: "Upload a profile photo to personalise your account. The photo appears in the sidebar, top bar, and dashboard welcome section. Supported formats: JPEG, PNG, WebP, AVIF. Maximum size: 2MB.",
      },
    ],
  },
]

export const helpPagesBySlug = Object.fromEntries(
  helpPages.map((page) => [page.slug, page]),
)

export function searchHelpPages(query: string): HelpPage[] {
  const lower = query.toLowerCase()
  return helpPages.filter(
    (page) =>
      page.title.toLowerCase().includes(lower) ||
      page.description.toLowerCase().includes(lower) ||
      page.sections.some(
        (section) =>
          section.title.toLowerCase().includes(lower) ||
          section.content.toLowerCase().includes(lower),
      ),
  )
}

export const gettingStartedSteps = [
  {
    title: "Complete Your Profile",
    description: "Set up your name, fitness goals, and weekly targets in Settings.",
    href: "/settings",
  },
  {
    title: "Browse the Exercise Library",
    description: "Familiarise yourself with available exercises and add custom ones if needed.",
    href: "/exercises",
  },
  {
    title: "Log Your First Workout",
    description: "Record a gym session with exercises, sets, and reps.",
    href: "/workouts/new",
  },
  {
    title: "Log Your First Run",
    description: "Track a running activity with distance and duration.",
    href: "/running/new",
  },
  {
    title: "Record Your Body Measurements",
    description: "Log your starting weight and body measurements.",
    href: "/body-progress",
  },
  {
    title: "Set Your First Goal",
    description: "Create a fitness goal to work toward.",
    href: "/goals",
  },
  {
    title: "Start a Daily Habit Streak",
    description: "Log your daily habits to build consistency.",
    href: "/habits",
  },
  {
    title: "Explore the Dashboard",
    description: "Check your dashboard to see your progress at a glance.",
    href: "/dashboard",
  },
]

export const faqItems = [
  {
    question: "How do I reset my password?",
    answer: "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your email.",
  },
  {
    question: "Can I edit or delete past entries?",
    answer: "Yes. You can edit or delete workouts, runs, body progress entries, and goals from their respective detail pages.",
  },
  {
    question: "How is workout volume calculated?",
    answer: "Volume = sets × reps × weight for each exercise. Total workout volume is the sum of all exercise volumes in a session.",
  },
  {
    question: "How is running pace calculated?",
    answer: "Pace = duration ÷ distance. It is shown as minutes per kilometre.",
  },
  {
    question: "Are my goals updated automatically?",
    answer: "Yes. Goals automatically track progress as you log workouts, runs, and body measurements.",
  },
  {
    question: "How do I change my weekly targets?",
    answer: "Go to Settings and update your weekly workout and running targets.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes. From the Reports page, you can export your data as CSV or PDF.",
  },
]
