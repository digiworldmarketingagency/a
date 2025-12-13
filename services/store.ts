import { User, UserType, Job, Event, Blog, EmailTemplate, SuccessStory, GalleryItem, CandidateListing, CorporateUser, Banner } from '../types';

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
    status: 'OPEN',
    salaryMin: '10 LPA',
    salaryMax: '15 LPA',
    approvalStatus: 'Approved',
    jobType: 'Full Time',
    expiryDate: '2023-12-30'
  },
  { 
    id: '2', 
    title: 'Marketing Manager', 
    company: 'Brand Solutions', 
    location: 'Delhi', 
    category: 'Marketing', 
    description: 'Lead marketing campaigns.', 
    postedDate: '2023-10-26', 
    status: 'OPEN',
    salaryMin: '8 LPA',
    salaryMax: '12 LPA',
    approvalStatus: 'Approved',
    jobType: 'Full Time',
    expiryDate: '2024-01-15'
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
    status: 'OPEN',
    salaryMin: '12 LPA',
    salaryMax: '18 LPA',
    approvalStatus: 'Approved',
    jobType: 'Full Time',
    expiryDate: '2023-12-20'
  },
  { 
    id: '4', 
    title: 'HR Executive', 
    company: 'Global Services', 
    location: 'Pune', 
    category: 'HR', 
    description: 'Recruitment specialist.', 
    postedDate: '2023-10-20', 
    status: 'CLOSED',
    salaryMin: '5 LPA',
    salaryMax: '7 LPA',
    approvalStatus: 'Rejected',
    statusReason: 'Low salary for experience required',
    jobType: 'Part Time',
    expiryDate: '2023-11-20'
  },
];

const MOCK_CANDIDATES: CandidateListing[] = [
    { 
        id: '1', name: 'John Doe', title: 'Senior Developer', location: 'Mumbai', experience: '5', qualification: 'B.Tech', skills: ['React', 'Node.js'], email: 'john@example.com',
        mobile: '9876543210', dob: '1995-05-15', pincode: '400001', state: 'Maharashtra', city: 'Mumbai', area: 'Andheri', preferredCities: 'Pune, Bangalore', linkedin: 'linkedin.com/in/johndoe', preferredJobType: 'Full Time', preferredRole: 'Software Engineer', isFresher: 'No', highestEducation: 'B.Tech', jobFairEnrolled: 'Yes', createdBy: 'Self', createdOn: '2023-01-01', cvLink: 'link-to-cv'
    },
    { 
        id: '2', name: 'Jane Smith', title: 'Marketing Executive', location: 'Delhi', experience: '2', qualification: 'MBA', skills: ['SEO', 'Content Marketing'], email: 'jane@example.com',
         mobile: '9123456780', dob: '1998-08-20', pincode: '110001', state: 'Delhi', city: 'Delhi', area: 'Connaught Place', preferredCities: 'Gurgaon, Noida', linkedin: 'linkedin.com/in/janesmith', preferredJobType: 'Full Time', preferredRole: 'Marketing', isFresher: 'No', highestEducation: 'MBA', jobFairEnrolled: 'No', createdBy: 'Admin', createdOn: '2023-02-15', cvLink: 'link-to-cv'
    },
];

const MOCK_CORPORATES: CorporateUser[] = [
    { id: '1', fullName: 'Rajesh Kumar', companyName: 'Alpha Innovations', email: 'rajesh@alpha.com', mobile: '9988776655', designation: 'HR Manager', location: 'Bangalore', status: 'PENDING' },
    { id: '2', fullName: 'Sarah Lee', companyName: 'Global Tech', email: 'sarah@global.com', mobile: '9988776644', designation: 'Director', location: 'Mumbai', status: 'APPROVED' },
    { id: '3', fullName: 'Amit Singh', companyName: 'Beta Solutions', email: 'amit@beta.com', mobile: '9988776633', designation: 'CEO', location: 'Pune', status: 'REJECTED', statusReason: 'Invalid GST' },
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

const MOCK_BANNERS: Banner[] = [
  { id: '1', name: 'Mega Job Fair', style: 'bg-gradient-to-r from-blue-600 to-indigo-700', title: 'Mega Job Fair 2024', description: 'Join us for the biggest hiring event of the year.', buttonText: 'Register Now', link: '/events', isActive: true },
  { id: '2', name: 'Tech Summit', style: 'bg-gradient-to-r from-purple-600 to-pink-600', title: 'Global Tech Summit', description: 'Innovating for a better tomorrow.', buttonText: 'Learn More', link: '/events', isActive: true },
  { id: '3', name: 'Walk-in Drive', style: 'bg-gradient-to-r from-green-500 to-teal-500', title: 'Walk-in Drive: Sales Executives', description: 'Hiring immediately for Mumbai location.', buttonText: 'View Details', link: '/jobboard', isActive: true },
  { id: '4', name: 'Resume Workshop', style: 'bg-gradient-to-r from-orange-400 to-red-500', title: 'Free Resume Workshop', description: 'Master the art of CV writing.', buttonText: 'Join Session', link: '/resources', isActive: false },
  { id: '5', name: 'Corporate Meet', style: 'bg-gradient-to-r from-gray-800 to-gray-900', title: 'Corporate Partners Meet', description: 'Connecting businesses with talent.', buttonText: 'Partner With Us', link: '/register-corporate', isActive: false },
  { id: '6', name: 'Skill Up', style: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900', title: 'Skill Up Challenge', description: 'Win scholarships by proving your coding skills.', buttonText: 'Start Quiz', link: '/resources', isActive: false },
  { id: '7', name: 'Summer Internship', style: 'bg-gradient-to-r from-cyan-400 to-blue-500', title: 'Summer Internships 2024', description: 'Apply for paid internships.', buttonText: 'Apply Now', link: '/jobboard', isActive: false },
  { id: '8', name: 'Webinar Series', style: 'bg-gradient-to-r from-rose-500 to-red-600', title: 'Expert Talk Webinar', description: 'Industry leaders share insights.', buttonText: 'Watch Live', link: '/events', isActive: false },
  { id: '9', name: 'Career Counseling', style: 'bg-gradient-to-r from-indigo-500 to-purple-500', title: 'Free Career Counseling', description: 'Confused about your path? Talk to experts.', buttonText: 'Book Slot', link: '/resources', isActive: false },
  { id: '10', name: 'Hackathon', style: 'bg-gradient-to-r from-emerald-500 to-green-600', title: 'National Hackathon', description: 'Build, Break, Innovate.', buttonText: 'Register Team', link: '/events', isActive: false },
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
  candidates: CandidateListing[] = MOCK_CANDIDATES;
  corporates: CorporateUser[] = MOCK_CORPORATES;
  events: Event[] = MOCK_EVENTS;
  blogs: Blog[] = [...MOCK_BLOGS]; 
  approvals: ApprovalRequest[] = MOCK_APPROVALS;
  emailTemplates: EmailTemplate[] = [...MOCK_TEMPLATES];
  successStories: SuccessStory[] = [...MOCK_STORIES];
  gallery: GalleryItem[] = [...MOCK_GALLERY];
  banners: Banner[] = [...MOCK_BANNERS];
  
  // Search State
  searchCriteria: SearchCriteria = { title: '', location: '', category: '' };

  // Saved Jobs State
  savedJobIds: string[] = [];

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
    this.savedJobIds = []; // Clear saved jobs on logout (for mock purposes)
  }

  getJobs(filter?: string) {
    if (!filter) return this.jobs;
    return this.jobs.filter(j => 
      j.title.toLowerCase().includes(filter.toLowerCase()) || 
      j.location.toLowerCase().includes(filter.toLowerCase())
    );
  }

  getCandidates() {
      return this.candidates;
  }

  getCorporates() {
      return this.corporates;
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

  updateCorporateStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
      const idx = this.corporates.findIndex(c => c.id === id);
      if(idx !== -1) {
          this.corporates[idx].status = status;
          this.corporates[idx].statusReason = reason;
      }
  }

  updateJobStatus(id: string, status: 'Approved' | 'Rejected', reason?: string) {
      const idx = this.jobs.findIndex(j => j.id === id);
      if(idx !== -1) {
          this.jobs[idx].approvalStatus = status;
          this.jobs[idx].statusReason = reason;
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

  // Banner Methods
  getBanners() { return this.banners; }

  updateBanner(updatedBanner: Banner) {
    const idx = this.banners.findIndex(b => b.id === updatedBanner.id);
    if (idx !== -1) {
      this.banners[idx] = updatedBanner;
    }
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

  // Saved Jobs Methods
  toggleSaveJob(jobId: string) {
    if (this.savedJobIds.includes(jobId)) {
      this.savedJobIds = this.savedJobIds.filter(id => id !== jobId);
    } else {
      this.savedJobIds.push(jobId);
    }
  }

  getSavedJobIds() {
    return this.savedJobIds;
  }

  getSavedJobs() {
    return this.jobs.filter(job => this.savedJobIds.includes(job.id));
  }
}

export const store = new MockStore();