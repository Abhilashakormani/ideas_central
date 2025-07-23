-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, role, department, student_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'rajesh.kumar@vnrvjiet.in', 'Rajesh', 'Kumar', 'faculty', 'Environmental Sciences', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'priya.sharma@vnrvjiet.in', 'Priya', 'Sharma', 'faculty', 'Computer Science', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'amit.patel@vnrvjiet.in', 'Amit', 'Patel', 'student', 'Computer Science', 'CS2021001'),
('550e8400-e29b-41d4-a716-446655440004', 'sarah.johnson@vnrvjiet.in', 'Sarah', 'Johnson', 'student', 'Environmental Sciences', 'ES2021002'),
('550e8400-e29b-41d4-a716-446655440005', 'admin@vnrvjiet.in', 'System', 'Administrator', 'admin', 'Administration', NULL);

-- Insert sample problems
INSERT INTO problems (id, title, description, full_description, category, priority, tags, submitted_by, submitted_by_name, department, views_count) VALUES
('660e8400-e29b-41d4-a716-446655440001', 
 'Campus Waste Management System', 
 'Need an efficient system to manage waste across campus facilities. Current system is outdated and causes environmental concerns.',
 'The current waste management system at our campus is facing several critical challenges:

1. **Inefficient Collection**: Waste bins are often overflowing, creating unsanitary conditions
2. **Poor Segregation**: Lack of proper waste segregation leads to environmental issues
3. **Limited Recycling**: Current system doesn''t promote or facilitate recycling effectively
4. **High Costs**: Manual collection and disposal processes are expensive and time-consuming
5. **Environmental Impact**: Improper waste handling is affecting campus sustainability goals

We are looking for innovative solutions that can address these challenges while being cost-effective and environmentally friendly.',
 'environment', 'high', 
 ARRAY['Environment', 'Management', 'Sustainability'], 
 '550e8400-e29b-41d4-a716-446655440001', 'Dr. Rajesh Kumar', 'Environmental Sciences', 124),

('660e8400-e29b-41d4-a716-446655440002',
 'Student Attendance Tracking',
 'Automated system for tracking student attendance in lectures using modern technology solutions.',
 'Current manual attendance system is time-consuming and error-prone. We need an automated solution that can accurately track student attendance while being user-friendly for both faculty and students.',
 'education', 'medium',
 ARRAY['Education', 'Technology', 'Automation'],
 '550e8400-e29b-41d4-a716-446655440002', 'Prof. Priya Sharma', 'Computer Science', 89),

('660e8400-e29b-41d4-a716-446655440003',
 'Campus Security Enhancement',
 'Improve campus security systems with modern surveillance and access control technologies.',
 'Current security infrastructure needs modernization to ensure better safety for students and staff.',
 'security', 'urgent',
 ARRAY['Security', 'Technology', 'Safety'],
 '550e8400-e29b-41d4-a716-446655440005', 'System Administrator', 'Administration', 203);

-- Insert sample ideas
INSERT INTO ideas (id, problem_id, title, description, solution, implementation, submitted_by, submitted_by_name, status, score) VALUES
('770e8400-e29b-41d4-a716-446655440001',
 '660e8400-e29b-41d4-a716-446655440001',
 'Smart Waste Bins with IoT Sensors',
 'Implement IoT-enabled waste bins that can monitor fill levels and automatically schedule collection',
 'Deploy smart waste bins equipped with ultrasonic sensors to monitor fill levels in real-time. When bins reach 80% capacity, they automatically send notifications to the maintenance team for collection.',
 'Phase 1: Install sensors in 10 high-traffic areas. Phase 2: Expand to entire campus. Phase 3: Add mobile app for real-time monitoring.',
 '550e8400-e29b-41d4-a716-446655440003', 'Amit Patel', 'approved', 8.5),

('770e8400-e29b-41d4-a716-446655440002',
 '660e8400-e29b-41d4-a716-446655440001',
 'AI-Powered Waste Classification',
 'Use computer vision and AI to automatically sort waste into appropriate categories',
 'Implement AI-powered cameras at waste disposal points that can identify and classify different types of waste, providing real-time feedback to users.',
 'Develop computer vision model, install cameras at key locations, create user feedback system.',
 '550e8400-e29b-41d4-a716-446655440004', 'Sarah Johnson', 'approved', 9.1);

-- Insert sample evaluations
INSERT INTO evaluations (id, idea_id, evaluator_id, evaluator_name, innovation_score, feasibility_score, impact_score, overall_score, comments, status) VALUES
('880e8400-e29b-41d4-a716-446655440001',
 '770e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440001',
 'Dr. Rajesh Kumar',
 8, 9, 8, 8.3,
 'Excellent practical solution with proven technology. Implementation is feasible and impact will be significant.',
 'approved'),

('880e8400-e29b-41d4-a716-446655440002',
 '770e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440002',
 'Prof. Priya Sharma',
 9, 7, 9, 8.3,
 'Highly innovative approach using cutting-edge AI technology. May require significant technical expertise for implementation.',
 'approved');
