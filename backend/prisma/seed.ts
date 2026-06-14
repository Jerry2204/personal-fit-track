import { PrismaClient, MuscleGroup, EquipmentType, DifficultyLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const exercises: {
  name: string;
  muscleGroup: MuscleGroup;
  equipmentType: EquipmentType;
  difficultyLevel: DifficultyLevel;
  instructions: string;
}[] = [
  // ── Chest ──
  {
    name: 'Bench Press',
    muscleGroup: 'Chest',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Lie on a flat bench with feet on the floor. Grip the bar slightly wider than shoulder-width. Lower the bar to your mid-chest, then press back up to full arm extension.',
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Set the bench to a 30-45 degree incline. Hold dumbbells at shoulder height with palms forward. Press up until arms are fully extended, then lower with control.',
  },
  {
    name: 'Push-Up',
    muscleGroup: 'Chest',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions:
      'Start in a plank position with hands slightly wider than shoulders. Lower your chest toward the floor, then push back up to the starting position.',
  },
  {
    name: 'Cable Fly',
    muscleGroup: 'Chest',
    equipmentType: 'Cable',
    difficultyLevel: 'Intermediate',
    instructions:
      'Set both pulleys to chest height. Stand in the middle, grab each handle, and bring your hands together in front of your chest with a slight bend in your elbows.',
  },
  {
    name: 'Dumbbell Fly',
    muscleGroup: 'Chest',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Lie on a flat bench holding dumbbells above your chest with palms facing each other. Lower your arms out to the sides with a slight bend in your elbows, then squeeze back up.',
  },
  {
    name: 'Decline Bench Press',
    muscleGroup: 'Chest',
    equipmentType: 'Barbell',
    difficultyLevel: 'Advanced',
    instructions:
      'Lie on a decline bench and unrack the bar. Lower it to your lower chest, then press back up. Focus on the lower chest stretch and contraction.',
  },
  {
    name: 'Chest Dip',
    muscleGroup: 'Chest',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Intermediate',
    instructions:
      'Grip parallel bars and lift yourself up. Lean forward slightly, lower your body until your upper arms are parallel to the floor, then press back up.',
  },

  // ── Back ──
  {
    name: 'Deadlift',
    muscleGroup: 'Back',
    equipmentType: 'Barbell',
    difficultyLevel: 'Advanced',
    instructions:
      'Stand with feet hip-width apart, bar over mid-foot. Hinge at the hips and grip the bar. Drive through your heels to stand up, keeping the bar close to your body.',
  },
  {
    name: 'Pull-Up',
    muscleGroup: 'Back',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Intermediate',
    instructions:
      'Grip the bar with palms facing away, hands shoulder-width apart. Hang at full extension, then pull your chin above the bar. Lower with control.',
  },
  {
    name: 'Barbell Row',
    muscleGroup: 'Back',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Hinge forward with a flat back, holding the bar with an overhand grip. Pull the bar to your lower ribcage, squeezing your shoulder blades together.',
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipmentType: 'Machine',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit at the lat pulldown machine with knees braced. Grip the bar wider than shoulder-width. Pull the bar down to your upper chest, then slowly return.',
  },
  {
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    equipmentType: 'Cable',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit at the cable row station with feet braced. Grab the handle and pull toward your torso, squeezing your shoulder blades. Extend your arms fully on each rep.',
  },
  {
    name: 'Dumbbell Row',
    muscleGroup: 'Back',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Place one knee and hand on a bench for support. Hold a dumbbell in the other hand. Pull the dumbbell to your hip, keeping your back flat.',
  },
  {
    name: 'T-Bar Row',
    muscleGroup: 'Back',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Straddle the T-bar with a neutral grip. Hinge forward with a flat back. Pull the bar toward your chest, then lower with control.',
  },
  {
    name: 'Face Pull',
    muscleGroup: 'Back',
    equipmentType: 'Cable',
    difficultyLevel: 'Beginner',
    instructions:
      'Set a cable pulley to upper-chest height. Attach a rope handle and grab with both hands. Pull the rope toward your face, separating your hands at the end.',
  },

  // ── Shoulders ──
  {
    name: 'Overhead Press',
    muscleGroup: 'Shoulders',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand with feet shoulder-width apart, bar at shoulder height. Press the bar overhead until arms are fully extended. Lower back to shoulders.',
  },
  {
    name: 'Lateral Raise',
    muscleGroup: 'Shoulders',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand holding dumbbells at your sides. Raise your arms out to the sides until they are parallel to the floor. Lower with control.',
  },
  {
    name: 'Front Raise',
    muscleGroup: 'Shoulders',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand with dumbbells in front of your thighs. Raise one or both arms forward to shoulder height, keeping a slight bend in your elbows.',
  },
  {
    name: 'Reverse Fly',
    muscleGroup: 'Shoulders',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Hinge forward with a flat back, holding dumbbells below your chest. Raise your arms out to the sides, squeezing your rear delts. Lower slowly.',
  },
  {
    name: 'Arnold Press',
    muscleGroup: 'Shoulders',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Sit holding dumbbells in front of your shoulders, palms facing you. Press overhead while rotating your palms to face forward. Reverse on the way down.',
  },
  {
    name: 'Upright Row',
    muscleGroup: 'Shoulders',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand holding a barbell at arm\'s length in front of your thighs. Pull the bar up to your chin, leading with your elbows. Lower with control.',
  },

  // ── Biceps ──
  {
    name: 'Barbell Curl',
    muscleGroup: 'Biceps',
    equipmentType: 'Barbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand with feet shoulder-width apart, holding a barbell with an underhand grip. Curl the bar toward your shoulders, then lower slowly.',
  },
  {
    name: 'Dumbbell Curl',
    muscleGroup: 'Biceps',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand holding dumbbells at your sides, palms forward. Curl one or both dumbbells toward your shoulders. Squeeze at the top, then lower.',
  },
  {
    name: 'Hammer Curl',
    muscleGroup: 'Biceps',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand with dumbbells at your sides, palms facing each other. Curl the dumbbells while keeping palms neutral throughout the movement.',
  },
  {
    name: 'Cable Curl',
    muscleGroup: 'Biceps',
    equipmentType: 'Cable',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand facing a low cable pulley with a straight bar or rope attached. Curl the handle toward your shoulders, keeping your elbows pinned to your sides.',
  },
  {
    name: 'Concentration Curl',
    muscleGroup: 'Biceps',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit on a bench with legs apart. Hold a dumbbell in one hand and brace your elbow against your inner thigh. Curl the dumbbell toward your shoulder.',
  },

  // ── Triceps ──
  {
    name: 'Triceps Pushdown',
    muscleGroup: 'Triceps',
    equipmentType: 'Cable',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand at a cable machine with a straight bar or rope attached to the high pulley. Push the handle down to full arm extension, keeping your elbows at your sides.',
  },
  {
    name: 'Overhead Triceps Extension',
    muscleGroup: 'Triceps',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand or sit holding a dumbbell overhead with both hands. Lower the dumbbell behind your head by bending your elbows. Extend back to the starting position.',
  },
  {
    name: 'Close-Grip Bench Press',
    muscleGroup: 'Triceps',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Lie on a flat bench and grip the bar with hands shoulder-width apart (narrower than normal). Lower the bar to your lower chest, then press up.',
  },
  {
    name: 'Skull Crusher',
    muscleGroup: 'Triceps',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Lie on a flat bench holding a barbell or EZ bar above your chest. Lower the bar toward your forehead by bending your elbows. Extend back to the starting position.',
  },
  {
    name: 'Triceps Dip',
    muscleGroup: 'Triceps',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Intermediate',
    instructions:
      'Grip parallel bars and lift yourself up. Keep your torso upright (don\'t lean forward). Lower until your upper arms are parallel to the floor, then press up.',
  },

  // ── Legs ──
  {
    name: 'Squat',
    muscleGroup: 'Legs',
    equipmentType: 'Barbell',
    difficultyLevel: 'Advanced',
    instructions:
      'Set the bar on your upper back. Stand with feet shoulder-width apart. Squat down by bending your knees and hips, keeping your chest up. Drive through your heels to stand.',
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipmentType: 'Machine',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit in the leg press machine with feet shoulder-width apart on the platform. Release the safety handles and press the platform away. Bend your knees to lower, then press back up.',
  },
  {
    name: 'Romanian Deadlift',
    muscleGroup: 'Legs',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand holding a barbell at hip height. Hinge at your hips, pushing them back while keeping your legs slightly bent. Lower the bar along your shins until you feel a hamstring stretch, then return to standing.',
  },
  {
    name: 'Leg Curl',
    muscleGroup: 'Legs',
    equipmentType: 'Machine',
    difficultyLevel: 'Beginner',
    instructions:
      'Lie face down on the leg curl machine with the pad behind your ankles. Curl your legs toward your glutes, then lower with control.',
  },
  {
    name: 'Leg Extension',
    muscleGroup: 'Legs',
    equipmentType: 'Machine',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit on the leg extension machine with the pad on your shins. Extend your legs until they are straight, squeeze at the top, then lower.',
  },
  {
    name: 'Lunge',
    muscleGroup: 'Legs',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand with dumbbells at your sides. Step forward with one leg and lower your back knee toward the floor. Push through the front heel to return to standing.',
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroup: 'Legs',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand a few feet in front of a bench and place one foot on the bench behind you. Hold dumbbells at your sides. Lower your back knee toward the floor, then drive up.',
  },
  {
    name: 'Hack Squat',
    muscleGroup: 'Legs',
    equipmentType: 'Machine',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand on the hack squat platform with shoulders under the pads. Release the safeties and squat down by bending your knees. Press back up through your heels.',
  },
  {
    name: 'Standing Calf Raise',
    muscleGroup: 'Legs',
    equipmentType: 'Machine',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand on the calf raise machine with your shoulders under the pads. Lower your heels below the platform, then press up onto your toes.',
  },

  // ── Glutes ──
  {
    name: 'Hip Thrust',
    muscleGroup: 'Glutes',
    equipmentType: 'Barbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Sit on the floor with your upper back against a bench and a barbell across your hips. Drive through your heels to lift your hips up, squeezing your glutes at the top.',
  },
  {
    name: 'Glute Bridge',
    muscleGroup: 'Glutes',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions:
      'Lie on your back with knees bent and feet flat on the floor. Push through your heels to lift your hips toward the ceiling. Squeeze your glutes at the top and lower.',
  },
  {
    name: 'Cable Pull-Through',
    muscleGroup: 'Glutes',
    equipmentType: 'Cable',
    difficultyLevel: 'Intermediate',
    instructions:
      'Face away from a low cable pulley with the rope between your legs. Hinge at your hips, letting the rope pull back. Drive your hips forward to standing, squeezing your glutes.',
  },
  {
    name: 'Step-Up',
    muscleGroup: 'Glutes',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Beginner',
    instructions:
      'Stand facing a bench or box holding dumbbells. Step onto the bench with one foot, driving through your heel to stand on top. Step back down and repeat.',
  },

  // ── Core ──
  {
    name: 'Plank',
    muscleGroup: 'Core',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions:
      'Start in a forearm plank position with your body in a straight line from head to heels. Engage your core and hold the position without letting your hips sag.',
  },
  {
    name: 'Crunch',
    muscleGroup: 'Core',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions:
      'Lie on your back with knees bent and feet on the floor. Place your hands behind your head. Curl your shoulders toward your pelvis, then lower with control.',
  },
  {
    name: 'Hanging Leg Raise',
    muscleGroup: 'Core',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Intermediate',
    instructions:
      'Hang from a pull-up bar with arms fully extended. Raise your legs until they are parallel to the floor (or higher), keeping your core tight. Lower with control.',
  },
  {
    name: 'Russian Twist',
    muscleGroup: 'Core',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Beginner',
    instructions:
      'Sit with knees bent and feet slightly off the floor. Lean back slightly, keeping your back straight. Rotate your torso side to side, touching the floor beside you.',
  },
  {
    name: 'Cable Woodchop',
    muscleGroup: 'Core',
    equipmentType: 'Cable',
    difficultyLevel: 'Beginner',
    instructions:
      'Set a cable pulley to shoulder height. Stand sideways to the machine and grab the handle with both hands. Rotate your torso away from the machine, pulling the handle across your body.',
  },
  {
    name: 'Ab Wheel Rollout',
    muscleGroup: 'Core',
    equipmentType: 'Other',
    difficultyLevel: 'Intermediate',
    instructions:
      'Kneel on the floor holding an ab wheel in front of you. Roll the wheel forward, lowering your torso toward the floor. Use your core to pull yourself back to the starting position.',
  },

  // ── Full Body ──
  {
    name: 'Clean and Press',
    muscleGroup: 'FullBody',
    equipmentType: 'Barbell',
    difficultyLevel: 'Advanced',
    instructions:
      'Pull the barbell from the floor to your shoulders in one explosive movement (clean), then press it overhead (press). Lower the bar to the floor or hips between reps.',
  },
  {
    name: 'Burpee',
    muscleGroup: 'FullBody',
    equipmentType: 'Bodyweight',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand with feet shoulder-width apart. Drop into a squat, place your hands on the floor, and jump your feet back into a plank. Jump your feet forward and leap up with your arms overhead.',
  },
  {
    name: 'Kettlebell Swing',
    muscleGroup: 'FullBody',
    equipmentType: 'Kettlebell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand with feet wider than shoulder-width, holding a kettlebell with both hands. Hinge at your hips and swing the kettlebell between your legs. Drive your hips forward to swing the kettlebell up to chest height.',
  },
  {
    name: 'Turkish Get-Up',
    muscleGroup: 'FullBody',
    equipmentType: 'Kettlebell',
    difficultyLevel: 'Advanced',
    instructions:
      'Lie on your side holding a kettlebell in one hand pressed overhead. Roll onto your back, then stand up while keeping the kettlebell overhead at all times. Reverse the movement to return to the floor.',
  },
  {
    name: 'Thruster',
    muscleGroup: 'FullBody',
    equipmentType: 'Dumbbell',
    difficultyLevel: 'Intermediate',
    instructions:
      'Stand holding dumbbells at your shoulders. Squat down, then drive up explosively, pressing the dumbbells overhead at the top of the movement.',
  },
];

async function main() {
  console.log('Seeding exercises...');

  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        equipmentType: exercise.equipmentType,
        difficultyLevel: exercise.difficultyLevel,
        instructions: exercise.instructions,
        isCustom: false,
        createdByUserId: null,
      },
    });
  }

  console.log(`Seeded ${exercises.length} exercises successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
