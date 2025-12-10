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