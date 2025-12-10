import { User, UserType, Job, Event, Blog } from '../types';

// Mock Data
const MOCK_JOBS: Job[] = [
  { 
    id: '1', 
    title: 'Software Engineer', 
    company: 'Tech Corp', 
    companyLogo: 'https://img.logoipsum.com/243.svg',
    location: 'Mumbai', 
    category: 'IT', 
    description: 'React & Node.js dev needed.', 
    postedDate: '2023-10-25', 
    status: 'OPEN' 
  },
  { 
    id: '2', 
    title: 'Marketing Manager', 
    company: 'Brand Solutions', 
    location: 'Delhi', 
    category: 'Marketing', 
    description: 'Lead marketing campaigns.', 
    postedDate: '2023-10-26', 
    status: 'OPEN' 
  },
  { 
    id: '3', 
    title: 'Data Analyst', 
    company: 'FinTech Ltd', 
    companyLogo: 'https://img.logoipsum.com/280.svg',
    location: 'Bangalore', 
    category: 'Data', 
    description: 'SQL and Python required.', 
    postedDate: '2023-10-24', 
    status: 'OPEN' 
  },
  { 
    id: '4', 
    title: 'HR Executive', 
    company: 'Global Services', 
    location: 'Pune', 
    category: 'HR', 
    description: 'Recruitment specialist.', 
    postedDate: '2023-10-20', 
    status: 'CLOSED' 
  },
];

const MOCK_EVENTS: Event[] = [
  { id: '1', title: 'Mega Job Fair 2024', date: '2024-05-15', location: 'Mumbai Exhibition Center', description: 'Over 50+ companies hiring.', imageUrl: 'https://picsum.photos/400/200?random=10' },
  { id: '2', title: 'Tech Career Summit', date: '2024-06-10', location: 'Online', description: 'Webinar on future tech trends.', imageUrl: 'https://picsum.photos/400/200?random=11' },
  { id: '3', title: 'Past Resume Workshop', date: '2023-01-10', location: 'Delhi', description: 'Workshop on building ATS resumes.', imageUrl: 'https://picsum.photos/400/200?random=12' },
];

const MOCK_BLOGS: Blog[] = [
  { id: '1', title: 'Campus to Corporate', author: 'Admin', date: '2023-10-01', content: 'Transitioning effectively from campus life to corporate culture is a significant milestone...' },
  { id: '2', title: 'Resume Writing 101', author: 'HR Expert', date: '2023-09-15', content: 'Your resume is your first impression. Here are the top 5 tips to make it count...' },
  { id: '3', title: 'Acing the Interview', author: 'Career Coach', date: '2023-09-20', content: 'Body language plays a crucial role in interviews. Learn how to project confidence...' },
];

export interface ApprovalRequest {
  id: string;
  type: 'CORPORATE' | 'JOB';
  name: string; // Company Name or Job Title
  details: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: '1', type: 'CORPORATE', name: 'Alpha Innovations', details: 'IT Services, Reg No: 12345', date: '2023-11-01', status: 'PENDING' },
  { id: '2', type: 'JOB', name: 'Senior Accountant', details: 'Posted by FinancePro Ltd', date: '2023-11-02', status: 'PENDING' },
];

class MockStore {
  currentUser: User | null = null;
  jobs: Job[] = MOCK_JOBS;
  events: Event[] = MOCK_EVENTS;
  blogs: Blog[] = MOCK_BLOGS;
  approvals: ApprovalRequest[] = MOCK_APPROVALS;

  login(type: UserType): User {
    this.currentUser = {
      id: 'user_123',
      email: type === UserType.ADMIN ? 'admin@amp.org' : 'user@test.com',
      type: type,
      name: type === UserType.ADMIN ? 'Administrator' : 'John Doe',
      status: 'APPROVED'
    };
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }

  getJobs(filter?: string) {
    if (!filter) return this.jobs;
    return this.jobs.filter(j => 
      j.title.toLowerCase().includes(filter.toLowerCase()) || 
      j.location.toLowerCase().includes(filter.toLowerCase())
    );
  }
  
  addJob(job: Job) {
    this.jobs.push(job);
  }

  getEvents() { return this.events; }
  getBlogs() { return this.blogs; }
  getApprovals() { return this.approvals; }
  
  updateApproval(id: string, status: 'APPROVED' | 'REJECTED') {
    const idx = this.approvals.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.approvals[idx].status = status;
    }
  }
}

export const store = new MockStore();