// src/data/mockData.js
export const members = [
  {
    id: '1',
    name: 'Ravi Kumar',
    mobile: '9876543210',
    email: 'ravi@example.com',
    startDate: '2025-01-01',
    endDate: '2025-06-01',
    plan: 'Premium',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    status: 'active',
    notes: 'Morning batch, interested in weight training'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    mobile: '9876543211',
    email: 'priya@example.com',
    startDate: '2025-02-15',
    endDate: '2025-08-15',
    plan: 'Gold',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    notes: 'Evening batch, yoga enthusiast'
  },
  {
    id: '3',
    name: 'Amit Singh',
    mobile: '9876543212',
    email: 'amit@example.com',
    startDate: '2024-10-01',
    endDate: '2025-01-01',
    plan: 'Basic',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'expired',
    notes: 'Needs renewal reminder'
  },
  {
    id: '4',
    name: 'Sneha Patel',
    mobile: '9876543213',
    email: 'sneha@example.com',
    startDate: '2025-01-10',
    endDate: '2025-07-10',
    plan: 'Premium',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'active',
    notes: 'Personal training sessions'
  },
  {
    id: '5',
    name: 'Vikram Reddy',
    mobile: '9876543214',
    email: 'vikram@example.com',
    startDate: '2025-01-20',
    endDate: '2026-01-20',
    plan: 'Annual',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    notes: 'CrossFit enthusiast, morning batch'
  },
  {
    id: '6',
    name: 'Anjali Gupta',
    mobile: '9876543215',
    email: 'anjali@example.com',
    startDate: '2024-12-01',
    endDate: '2025-03-01',
    plan: 'Gold',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'active',
    notes: 'Zumba classes'
  }
]

export const programs = [
  {
    id: 1,
    title: 'Strength Training',
    description: 'Build muscle mass and increase strength with our comprehensive weight training program. Includes personalized workout plans and nutrition guidance.',
    duration: '3 months',
    price: '₹4,999',
    icon: 'dumbbell',
    features: ['Personal trainer', 'Custom diet plan', 'Progress tracking', 'Supplement guidance'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
  },
  {
    id: 2,
    title: 'Weight Loss',
    description: 'Transform your body with our scientifically designed fat burning program. Combines cardio, HIIT, and strength training.',
    duration: '2 months',
    price: '₹3,999',
    icon: 'flame',
    features: ['HIIT sessions', 'Cardio training', 'Diet consultation', 'Weekly weigh-ins'],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800'
  },
  {
    id: 3,
    title: 'CrossFit',
    description: 'High-intensity functional training that combines weightlifting, cardio, and gymnastics for total body fitness.',
    duration: '1 month',
    price: '₹2,999',
    icon: 'activity',
    features: ['Group classes', 'Skill development', 'Competition prep', 'Community support'],
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800'
  },
  {
    id: 4,
    title: 'Yoga & Flexibility',
    description: 'Improve flexibility, balance, and mental clarity with our comprehensive yoga program suitable for all levels.',
    duration: '1 month',
    price: '₹1,999',
    icon: 'heart',
    features: ['Morning sessions', 'Meditation', 'Breathing exercises', 'Stress relief'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
  },
  {
    id: 5,
    title: 'Personal Training',
    description: 'One-on-one training with certified fitness experts. Get customized workouts tailored to your specific goals.',
    duration: 'Per session',
    price: '₹799/session',
    icon: 'user',
    features: ['1-on-1 attention', 'Flexible timing', 'Goal-oriented', 'Expert guidance'],
    image: 'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800'
  },
  {
    id: 6,
    title: 'Sports Conditioning',
    description: 'Specialized training for athletes. Improve speed, agility, power, and sport-specific performance.',
    duration: '2 months',
    price: '₹5,999',
    icon: 'trophy',
    features: ['Sport-specific', 'Agility drills', 'Power training', 'Recovery protocols'],
    image: 'https://images.unsplash.com/photo-1461896836934- voices-from-the-gym.jpg?w=800'
  }
]

export const trainers = [
  {
    id: 1,
    name: 'Santosh Kumar',
    role: 'Founder & Head Trainer',
    experience: '15+ years',
    specialization: 'Strength & Conditioning',
    image: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400',
    bio: 'Former national level bodybuilder with expertise in strength training and nutrition.',
    certifications: ['ACE Certified', 'ISSA Specialist', 'CrossFit L2']
  },
  {
    id: 2,
    name: 'Meera Nair',
    role: 'Yoga & Wellness Coach',
    experience: '10+ years',
    specialization: 'Yoga & Meditation',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
    bio: 'Certified yoga instructor specializing in Hatha and Vinyasa yoga.',
    certifications: ['RYT 500', 'Meditation Coach', 'Ayurveda Specialist']
  },
  {
    id: 3,
    name: 'Arjun Menon',
    role: 'CrossFit Coach',
    experience: '8+ years',
    specialization: 'CrossFit & HIIT',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    bio: 'CrossFit Games competitor with expertise in functional fitness.',
    certifications: ['CrossFit L3', 'NSCA-CSCS', 'Olympic Lifting Coach']
  },
  {
    id: 4,
    name: 'Kavitha Raj',
    role: 'Nutrition Specialist',
    experience: '12+ years',
    specialization: 'Sports Nutrition',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
    bio: 'Registered dietitian specializing in sports nutrition and body transformation.',
    certifications: ['RD Certified', 'Sports Nutrition', 'Weight Management']
  }
]

export const testimonials = [
  {
    id: 1,
    name: 'Rahul Verma',
    text: 'Lost 20kg in 4 months! The trainers at Santosh Gym are incredibly supportive and knowledgeable. Best decision I ever made.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    transformation: '-20kg'
  },
  {
    id: 2,
    name: 'Anita Desai',
    text: 'The yoga classes have completely transformed my lifestyle. I feel more energetic and peaceful. Highly recommend!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    transformation: 'Lifestyle'
  },
  {
    id: 3,
    name: 'Suresh Iyer',
    text: 'Professional environment with top-notch equipment. The personal training sessions are worth every rupee.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    transformation: '+15kg muscle'
  }
]

export const stats = [
  { label: 'Happy Members', value: '2500+' },
  { label: 'Expert Trainers', value: '15+' },
  { label: 'Years Experience', value: '12+' },
  { label: 'Programs Offered', value: '20+' }
]

export const facilities = [
  { icon: 'dumbbell', title: 'Premium Equipment', desc: 'State-of-the-art machines from top brands' },
  { icon: 'users', title: 'Expert Trainers', desc: 'Certified professionals with years of experience' },
  { icon: 'clock', title: '24/7 Access', desc: 'Train anytime that suits your schedule' },
  { icon: 'heart', title: 'Health Tracking', desc: 'Smart devices to monitor your progress' },
  { icon: 'droplet', title: 'Steam & Sauna', desc: 'Relax and recover after intense workouts' },
  { icon: 'coffee', title: 'Nutrition Bar', desc: 'Healthy snacks and protein shakes' }
]