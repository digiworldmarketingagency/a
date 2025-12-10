import { User, UserType, Job, Event, Blog, EmailTemplate, SuccessStory, GalleryItem } from '../types';

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

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'Interview Invitation', subject: 'Interview Invitation for [Role] at [Company]', body: 'Dear [Candidate Name],\n\nWe are pleased to invite you for an interview at our office. Please let us know your availability for next week.\n\nBest Regards,\nHR Team' },
  { id: '2', name: 'Rejection Letter', subject: 'Update regarding your application', body: 'Dear [Candidate Name],\n\nThank you for your interest in [Company]. After careful consideration, we have decided to move forward with other candidates.\n\nWe wish you the best in your job search.\n\nRegards,\nHR Team' },
];

const MOCK_STORIES: SuccessStory[] = [
  { id: '1', name: 'Zaid Khan', role: 'Software Engineer @ Tech Corp', comment: 'AMPOWERJOBS.com helped me find my dream role in just 2 weeks. The AI resume builder was a game changer!', imageUrl: 'https://i.pravatar.cc/150?img=11' },
  { id: '2', name: 'Sarah Ahmed', role: 'Marketing Lead @ Brand Co', comment: 'The platform is intuitive and the corporate connections are genuine. Highly recommended for freshers.', imageUrl: 'https://i.pravatar.cc/150?img=5' },
  { id: '3', name: 'Rahul Sharma', role: 'Data Analyst @ FinTech', comment: 'I attended the Job Fair listed here and got placed immediately. Thank you AMPOWERJOBS.com!', imageUrl: 'https://i.pravatar.cc/150?img=3' }
];

const MOCK_GALLERY: GalleryItem[] = [
    { id: '1', type: 'image', url: 'https://picsum.photos/400/300?random=50', title: 'Mentoring' },
    { id: '2', type: 'image', url: 'https://picsum.photos/400/300?random=51', title: 'Workplace' },
    { id: '3', type: 'image', url: 'https://picsum.photos/400/300?random=52', title: 'Interview' },
    { id: '4', type: 'image', url: 'https://picsum.photos/400/300?random=53', title: 'Job Fair' },
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

export interface SearchCriteria {
    title: string;
    location: string;
    category: string;
}

class MockStore {
  currentUser: User | null = null;
  jobs: Job[] = MOCK_JOBS;
  events: Event[] = MOCK_EVENTS;
  blogs: Blog[] = [...MOCK_BLOGS]; 
  approvals: ApprovalRequest[] = MOCK_APPROVALS;
  emailTemplates: EmailTemplate[] = [...MOCK_TEMPLATES];
  successStories: SuccessStory[] = [...MOCK_STORIES];
  gallery: GalleryItem[] = [...MOCK_GALLERY];
  
  // Search State
  searchCriteria: SearchCriteria = { title: '', location: '', category: '' };

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

  addEvent(event: Event) {
    this.events.push(event);
  }
  
  getBlogs() { return this.blogs; }
  
  addBlog(blog: Blog) {
    this.blogs.unshift(blog);
  }

  getApprovals() { return this.approvals; }
  
  updateApproval(id: string, status: 'APPROVED' | 'REJECTED') {
    const idx = this.approvals.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.approvals[idx].status = status;
    }
  }

  getEmailTemplates() { return this.emailTemplates; }
  
  addEmailTemplate(template: EmailTemplate): boolean {
    if (this.emailTemplates.length >= 10) {
      return false;
    }
    this.emailTemplates.push(template);
    return true;
  }

  deleteEmailTemplate(id: string) {
    this.emailTemplates = this.emailTemplates.filter(t => t.id !== id);
  }

  getSuccessStories() { return this.successStories; }
  
  addSuccessStory(story: SuccessStory) {
    this.successStories.push(story);
  }

  updateSuccessStory(story: SuccessStory) {
    const index = this.successStories.findIndex(s => s.id === story.id);
    if (index !== -1) {
        this.successStories[index] = story;
    }
  }

  deleteSuccessStory(id: string) {
    this.successStories = this.successStories.filter(s => s.id !== id);
  }

  getGallery() { return this.gallery; }

  addGalleryItem(item: GalleryItem) {
    this.gallery.push(item);
  }

  deleteGalleryItem(id: string) {
    this.gallery = this.gallery.filter(g => g.id !== id);
  }

  // Search Methods
  setSearchCriteria(criteria: SearchCriteria) {
      this.searchCriteria = criteria;
  }

  getSearchCriteria() {
      return this.searchCriteria;
  }

  clearSearchCriteria() {
      this.searchCriteria = { title: '', location: '', category: '' };
  }
}

export const store = new MockStore();