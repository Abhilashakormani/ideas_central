-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  department VARCHAR(100),
  student_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Problems table
CREATE TABLE IF NOT EXISTS problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'solved', 'closed')),
  tags TEXT[] DEFAULT '{}',
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  submitted_by_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  views_count INTEGER DEFAULT 0,
  ideas_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  solution TEXT NOT NULL,
  implementation TEXT,
  resources TEXT,
  timeline TEXT,
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  submitted_by_name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'approved', 'rejected')),
  score DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  evaluator_name VARCHAR(200) NOT NULL,
  innovation_score INTEGER NOT NULL CHECK (innovation_score >= 1 AND innovation_score <= 10),
  feasibility_score INTEGER NOT NULL CHECK (feasibility_score >= 1 AND feasibility_score <= 10),
  impact_score INTEGER NOT NULL CHECK (impact_score >= 1 AND impact_score <= 10),
  overall_score DECIMAL(3,1) NOT NULL,
  comments TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (problem_id IS NOT NULL OR idea_id IS NOT NULL)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_priority ON problems(priority);
CREATE INDEX IF NOT EXISTS idx_problems_submitted_by ON problems(submitted_by);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ideas_problem_id ON ideas(problem_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_submitted_by ON ideas(submitted_by);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluations_idea_id ON evaluations(idea_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);

CREATE INDEX IF NOT EXISTS idx_comments_problem_id ON comments(problem_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Create functions to update counters
CREATE OR REPLACE FUNCTION update_problem_ideas_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE problems 
    SET ideas_count = ideas_count + 1,
        updated_at = NOW()
    WHERE id = NEW.problem_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE problems 
    SET ideas_count = ideas_count - 1,
        updated_at = NOW()
    WHERE id = OLD.problem_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_problem_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE problems 
    SET comments_count = comments_count + 1,
        updated_at = NOW()
    WHERE id = NEW.problem_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE problems 
    SET comments_count = comments_count - 1,
        updated_at = NOW()
    WHERE id = OLD.problem_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_problem_ideas_count
  AFTER INSERT OR DELETE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_problem_ideas_count();

CREATE TRIGGER trigger_update_problem_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_problem_comments_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_problems_updated_at
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
