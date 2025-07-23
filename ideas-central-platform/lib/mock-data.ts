// Simple mock data used when Supabase isn't configured
export const mockProblems = [
  {
    id: "mock-problem-1",
    title: "Campus Wi-Fi Connectivity Issues",
    description: "Intermittent Wi-Fi in hostels and classrooms disrupts online learning.",
    full_description:
      "Students are unable to access online resources in Blocks A & C due to poor Wi-Fi coverage. This impacts their ability to attend online classes, submit assignments, and conduct research. The current infrastructure is outdated and cannot handle the increasing number of devices.",
    category: "technology",
    priority: "high",
    status: "open",
    tags: ["WiFi", "Networking", "Student Life"],
    submitted_by: "mock-user-faculty-1",
    submitted_by_name: "Dr. Rajesh Kumar",
    department: "IT Services",
    views_count: 54,
    ideas_count: 3,
    comments_count: 1,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-2",
    title: "Green Energy for Campus Lighting",
    description: "Need solar-powered street lights to reduce electricity bills.",
    full_description:
      "The campus currently relies heavily on grid electricity for outdoor lighting, leading to high energy costs and a significant carbon footprint. Implementing solar-powered street lights would reduce operational expenses and align with the institute's sustainability goals.",
    category: "environment",
    priority: "medium",
    status: "open",
    tags: ["Solar", "Energy", "Sustainability"],
    submitted_by: "mock-user-student-1",
    submitted_by_name: "Priya Sharma",
    department: "Environmental Sciences",
    views_count: 21,
    ideas_count: 2,
    comments_count: 0,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-3",
    title: "Automated Student Feedback System",
    description: "Develop a system for collecting and analyzing student feedback on courses and faculty.",
    full_description:
      "The current manual feedback collection process is inefficient and yields limited insights. An automated system would streamline data collection, provide real-time analytics, and enable faculty to quickly adapt teaching methods based on student input.",
    category: "education",
    priority: "low",
    status: "in-progress",
    tags: ["Feedback", "Education", "Automation"],
    submitted_by: "mock-user-faculty-2",
    submitted_by_name: "Prof. Amit Patel",
    department: "Computer Science",
    views_count: 30,
    ideas_count: 1,
    comments_count: 2,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-4",
    title: "Lack of Accessible Study Spaces",
    description: "Students with disabilities face challenges accessing certain study areas and facilities.",
    full_description:
      "Many study areas on campus, especially in older buildings, lack ramps, elevators, or accessible restrooms, making them unusable for students with mobility impairments. This creates an inequitable learning environment and limits their access to essential resources.",
    category: "social",
    priority: "high",
    status: "open",
    tags: ["Accessibility", "Inclusion", "Infrastructure"],
    submitted_by: "mock-user-faculty-1",
    submitted_by_name: "Dr. Rajesh Kumar",
    department: "Student Affairs",
    views_count: 78,
    ideas_count: 1,
    comments_count: 0,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-5",
    title: "Inefficient Campus Transportation",
    description: "Bus routes are often delayed, and parking is scarce, leading to student frustration.",
    full_description:
      "The current campus bus system experiences frequent delays, especially during peak hours, causing students to miss classes. Additionally, the limited and poorly managed parking spaces lead to significant congestion and frustration for commuters. A more efficient and sustainable transportation solution is needed.",
    category: "transportation",
    priority: "medium",
    status: "in-progress",
    tags: ["Commute", "Parking", "Logistics"],
    submitted_by: "mock-user-student-1", // Submitted by student
    submitted_by_name: "Priya Sharma",
    department: "Civil Engineering",
    views_count: 92,
    ideas_count: 0,
    comments_count: 1,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-6",
    title: "Digital Literacy Gap for New Students",
    description: "Many incoming students lack basic digital skills needed for online learning platforms.",
    full_description:
      "A significant portion of new students struggle with using the institute's online learning management systems, accessing digital resources, and participating in virtual classes. This digital literacy gap hinders their academic performance and overall integration into the university environment.",
    category: "education",
    priority: "low",
    status: "open",
    tags: ["Digital Skills", "Onboarding", "Learning"],
    submitted_by: "mock-user-faculty-2",
    submitted_by_name: "Prof. Amit Patel",
    department: "Education Technology",
    views_count: 45,
    ideas_count: 0,
    comments_count: 0,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
    updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-7",
    title: "Food Waste in Campus Cafeterias",
    description: "Significant amount of edible food is wasted daily in campus dining halls.",
    full_description:
      "Despite efforts, a large quantity of prepared food goes uneaten and is discarded from the campus cafeterias. This not only represents a financial loss but also contributes to environmental issues. Solutions are needed to reduce waste and potentially redistribute surplus food.",
    category: "environment",
    priority: "high",
    status: "open",
    tags: ["Food Waste", "Sustainability", "Cafeteria"],
    submitted_by: "mock-user-student-1", // Submitted by student
    submitted_by_name: "Priya Sharma",
    department: "Environmental Sciences",
    views_count: 60,
    ideas_count: 0,
    comments_count: 0,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-8",
    title: "Cybersecurity Awareness for Students",
    description: "Students are vulnerable to phishing and online scams due to lack of cybersecurity knowledge.",
    full_description:
      "Many students fall victim to phishing emails, malware, and online scams, compromising their personal data and the institute's network security. There is a critical need for comprehensive cybersecurity awareness programs to educate students on safe online practices.",
    category: "security",
    priority: "urgent",
    status: "open",
    tags: ["Cybersecurity", "Awareness", "Data Protection"],
    submitted_by: "mock-user-faculty-2",
    submitted_by_name: "Prof. Amit Patel",
    department: "Computer Science",
    views_count: 110,
    ideas_count: 0,
    comments_count: 0,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-9",
    title: "Student Mental Health Support",
    description: "Lack of accessible and comprehensive mental health services for students.",
    full_description:
      "Students face increasing academic pressure and personal challenges, leading to mental health issues. The current support services are insufficient, with long waiting times and limited resources. A more robust and easily accessible mental health support system is needed.",
    category: "healthcare",
    priority: "urgent",
    status: "open",
    tags: ["Mental Health", "Student Welfare", "Support Services"],
    submitted_by: "mock-user-student-1", // Submitted by student
    submitted_by_name: "Priya Sharma",
    department: "Psychology",
    views_count: 150,
    ideas_count: 0,
    comments_count: 0,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-problem-10",
    title: "Outdated Lab Equipment",
    description: "Science and engineering labs have outdated equipment hindering practical learning.",
    full_description:
      "Many laboratory instruments and machines in the science and engineering departments are old and do not reflect current industry standards. This limits students' exposure to modern technologies and affects the quality of practical experiments and research.",
    category: "technology",
    priority: "high",
    status: "open",
    tags: ["Lab", "Equipment", "Modernization", "Science", "Engineering"],
    submitted_by: "mock-user-student-1", // Submitted by student
    submitted_by_name: "Priya Sharma",
    department: "Mechanical Engineering",
    views_count: 85,
    ideas_count: 0,
    comments_count: 0,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockIdeas = [
  {
    id: "mock-idea-1",
    problem_id: "mock-problem-1",
    title: "Mesh Network for Campus Wi-Fi",
    description: "Implement a robust mesh Wi-Fi network to eliminate dead zones.",
    solution:
      "Deploy a decentralized mesh network using high-performance access points. This will ensure seamless connectivity across all campus buildings and outdoor areas, with self-healing capabilities to maintain uptime.",
    implementation: "Phase 1: Pilot in Block A. Phase 2: Expand to all hostels. Phase 3: Cover entire campus.",
    resources: "Budget: $50,000, Team: 2 network engineers, 3 student volunteers, Equipment: Mesh routers, cabling.",
    timeline: "6 months",
    submitted_by: "mock-user-student-1",
    submitted_by_name: "Priya Sharma",
    status: "approved",
    score: 8.5,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-idea-2",
    problem_id: "mock-problem-1",
    title: "Wi-Fi Signal Boosters in Dorms",
    description: "Install signal boosters in student dormitories to improve coverage.",
    solution:
      "Strategically place Wi-Fi signal boosters in each dormitory floor to extend the existing network's reach and strengthen signal strength in previously weak areas.",
    implementation: "Identify weak signal areas, purchase and install boosters, test coverage.",
    resources: "Budget: $10,000, Team: 1 IT technician, Equipment: Wi-Fi boosters.",
    timeline: "2 months",
    submitted_by: "mock-user-student-2",
    submitted_by_name: "Rahul Singh",
    status: "under-review",
    score: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-idea-3",
    problem_id: "mock-problem-2",
    title: "Solar-Powered Street Lights",
    description: "Replace existing street lights with integrated solar-powered units.",
    solution:
      "Install standalone solar street lights that charge during the day and illuminate at night, equipped with motion sensors for energy efficiency.",
    implementation: "Site survey, procurement, installation, testing.",
    resources: "Budget: $30,000, Team: 1 electrical engineer, 2 laborers, Equipment: Solar street lights.",
    timeline: "4 months",
    submitted_by: "mock-user-faculty-1",
    submitted_by_name: "Dr. Rajesh Kumar",
    status: "pending",
    score: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-idea-4",
    problem_id: "mock-problem-3",
    title: "AI-Powered Feedback Analysis System",
    description: "Use natural language processing to analyze and categorize student feedback automatically.",
    solution:
      "Implement a machine learning model that can process text feedback, identify key themes, and generate actionable insights for faculty.",
    implementation: "Phase 1: Data collection. Phase 2: Model training. Phase 3: Dashboard development.",
    resources: "Budget: $15,000, Team: 2 ML engineers, 1 UX designer",
    timeline: "3 months",
    submitted_by: "mock-user-student-2",
    submitted_by_name: "Rahul Singh",
    status: "pending",
    score: null,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-idea-5",
    problem_id: "mock-problem-2",
    title: "Hybrid Solar-Wind Energy System",
    description: "Combine solar panels with small wind turbines for continuous energy generation.",
    solution:
      "Install integrated solar-wind units that can generate electricity during both day and night, with smart controllers to optimize energy capture.",
    implementation:
      "Start with a pilot installation on one building, monitor performance, then scale to entire campus.",
    resources: "Budget: $45,000, Team: 1 renewable energy specialist, 2 electricians",
    timeline: "6 months",
    submitted_by: "mock-user-student-1",
    submitted_by_name: "Priya Sharma",
    status: "pending",
    score: null,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockEvaluations = [
  {
    id: "mock-eval-1",
    idea_id: "mock-idea-1",
    evaluator_id: "mock-user-faculty-1",
    evaluator_name: "Dr. Rajesh Kumar",
    innovation_score: 8,
    feasibility_score: 9,
    impact_score: 8,
    overall_score: 8.3,
    comments:
      "A well-thought-out solution. The mesh network approach is scalable and addresses the core problem effectively. Feasibility is high given the current technology.",
    status: "approved",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
