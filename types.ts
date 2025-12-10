
export enum UserType {
  CANDIDATE = 'CANDIDATE',
  CORPORATE = 'CORPORATE',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  email: string;
  type: UserType;
  name?: string;
  companyName?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  category: string;
  description: string;
  postedDate: string;
  status: 'OPEN' | 'CLOSED';
  
  // Extended Fields
  jobType?: string; // Part-time/Full Time/Internship
  qualification?: string;
  experience?: string;
  vacancies?: string;
  skills?: string;
  englishProficiency?: string;
  relocate?: boolean;
  bikeLicense?: boolean;
  linkedEvent?: string; // Event Listing/Publishing
  linkedinUrl?: string;
  computerLiteracy?: string[];
  salaryMin?: string;
  salaryMax?: string;
  salaryType?: string; // Fixed/Incentives/Fixed+Incentives
  perks?: string;
  receiveAppsFrom?: string; // Pan India/Overseas/Selected Region
  expiryDate?: string;
  instructions?: string;
  
  // Approval Workflow
  approvalStatus?: 'Approved' | 'Rejected' | 'Waiting for Approval';
  statusReason?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl?: string;
}

export interface Blog {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  role: string;
  comment: string;
  imageUrl: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  education: any[];
  experience: any[];
  skills: string[];
  location: string;
}

export interface CorporateProfile {
  companyName: string;
  contactPerson: string;
  email: string;
  gst: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}