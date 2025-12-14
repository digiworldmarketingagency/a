import React, { useState, useEffect } from 'react';
import { UserType, Job, Blog, EmailTemplate, SuccessStory, Event, GalleryItem, CandidateListing, Banner } from '../types';
import { AdminSidebar } from '../components/Layout';
import { Card, Button, Input, Select, Modal } from '../components/Shared';
import { store } from '../services/store';
import { draftBlogPost, generateEmailTemplate } from '../services/geminiService';

const BANNER_TEMPLATES = [
  { id: 1, name: 'Corporate Blue', style: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
  { id: 2, name: 'Tech Purple', style: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { id: 3, name: 'Fresh Green', style: 'bg-gradient-to-r from-green-500 to-teal-500' },
  { id: 4, name: 'Warm Orange', style: 'bg-gradient-to-r from-orange-400 to-red-500' },
  { id: 5, name: 'Dark Elegant', style: 'bg-gradient-to-r from-gray-800 to-gray-900' },
  { id: 6, name: 'Bright Yellow', style: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900' },
  { id: 7, name: 'Ocean Cyan', style: 'bg-gradient-to-r from-cyan-400 to-blue-500' },
  { id: 8, name: 'Rose Red', style: 'bg-gradient-to-r from-rose-500 to-red-600' },
  { id: 9, name: 'Royal Indigo', style: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
  { id: 10, name: 'Emerald City', style: 'bg-gradient-to-r from-emerald-500 to-green-600' },
];

const Dashboard: React.FC<{ userType: UserType }> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState(userType === UserType.CANDIDATE ? 'overview' : 'master');
  const [candidateTab, setCandidateTab] = useState('overview');
  const [blogTopic, setBlogTopic] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Search Candidate State (Corporate) - Inaccessible via menu but kept for potential reuse
  const [candidateSearch, setCandidateSearch] = useState({ location: '', experience: '', qualification: '' });
  const [candidateResults, setCandidateResults] = useState<CandidateListing[]>(store.getCandidates());

  // Email Marketing State
  const [emailJobTitle, setEmailJobTitle] = useState('');
  const [emailCandidate, setEmailCandidate] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>(store.getEmailTemplates());

  // Post Job State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    jobType: 'Full Time',
    location: '',
    qualification: '',
    experience: '',
    vacancies: '',
    skills: '',
    englishProficiency: 'Proficient',
    relocate: false,
    bikeLicense: false,
    linkedEvent: '',
    linkedinUrl: '',
    computerLiteracy: [] as string[],
    salaryMin: '',
    salaryMax: '',
    salaryType: 'Fixed',
    perks: '',
    receiveAppsFrom: 'Pan India',
    expiryDate: '',
    instructions: '',
    status: 'Waiting for Approval',
    statusReason: '',
    description: '',
    category: 'IT'
  });
  
  // Saved Jobs State
  const [savedJobsList, setSavedJobsList] = useState<Job[]>([]);

  // Approvals State
  const [approvalType, setApprovalType] = useState<'CORPORATE' | 'JOB'>('CORPORATE');
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Reports State
  const [reportType, setReportType] = useState<'CORPORATE' | 'JOB' | 'CANDIDATE' | 'EVENT'>('CORPORATE');
  const [candidateColumns, setCandidateColumns] = useState<string[]>(['Name', 'Mobile', 'Email', 'Location']);
  
  // Banner Management State
  const [banners, setBanners] = useState<Banner[]>(store.getBanners());
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Stats Management
  const [homeStats, setHomeStats] = useState(store.getStats());

  // Success Stories State
  const [stories, setStories] = useState<SuccessStory[]>(store.getSuccessStories());
  const [storyForm, setStoryForm] = useState<Partial<SuccessStory>>({});
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  const allCandidateColumns = [
      "Date of Birth", "Mobile No", "Email", "State", "City", "Pin Code", "Area", "Preferred Cities", "LinkedIn", 
      "Preferred Job Type", "Preferred Role Type", "Is Fresher", "Highest Education", "Job Fair Enrolled", "Created By", "Created On", "CV"
  ];

  useEffect(() => {
      if (userType === UserType.CANDIDATE) {
          setSavedJobsList(store.getSavedJobs());
      }
  }, [userType, candidateTab]);

  const handleCandidateSearch = () => {
     const all = store.getCandidates();
     const filtered = all.filter(c => {
         const matchLoc = !candidateSearch.location || c.location.toLowerCase().includes(candidateSearch.location.toLowerCase());
         const matchExp = !candidateSearch.experience || parseInt(c.experience) >= parseInt(candidateSearch.experience);
         const matchQual = !candidateSearch.qualification || c.qualification.toLowerCase().includes(candidateSearch.qualification.toLowerCase());
         return matchLoc && matchExp && matchQual;
     });
     setCandidateResults(filtered);
  };

  const handleJobChange = (field: string, value: any) => {
    setJobForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleComputerSkill = (skill: string) => {
    setJobForm(prev => {
      const skills = prev.computerLiteracy.includes(skill)
        ? prev.computerLiteracy.filter(s => s !== skill)
        : [...prev.computerLiteracy, skill];
      return { ...prev, computerLiteracy: skills };
    });
  };

  const handlePreview = () => {
    // Basic validation for expiry date (Max 90 days)
    if (jobForm.expiryDate) {
      const today = new Date();
      const expiry = new Date(jobForm.expiryDate);
      const diffTime = Math.abs(expiry.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays > 90) {
        alert("Job Expiry date cannot be more than 90 days from today.");
        return;
      }
    }
    setIsPreviewOpen(true);
  };

  const handlePublishJob = () => {
    const { status: formStatus, ...restJobForm } = jobForm;
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title: jobForm.title,
      company: 'My Company', 
      location: jobForm.location,
      category: jobForm.category,
      description: jobForm.description,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'OPEN',
      approvalStatus: formStatus as any,
      ...restJobForm
    };
    store.addJob(newJob);
    setIsPreviewOpen(false);
    alert(`Job Published! Status: ${formStatus}.`);
    if (userType === UserType.CORPORATE) {
        setJobForm({...jobForm, title: ''}); // Reset just title for simple UX
    }
  };

  const handleBlogGen = async () => {
    if (!blogTopic) return alert("Please enter a topic.");
    setLoading(true);
    const text = await draftBlogPost(blogTopic);
    setGeneratedBlog(text);
    setLoading(false);
  };

  const handlePostBlog = () => {
    if (!generatedBlog || !blogTopic) return;
    const newBlog: Blog = {
        id: Math.random().toString(36).substr(2, 9),
        title: blogTopic,
        author: 'Admin', 
        content: generatedBlog,
        date: new Date().toISOString().split('T')[0]
    };
    store.addBlog(newBlog);
    alert('Blog Posted Successfully!');
    setGeneratedBlog('');
    setBlogTopic('');
  };

  const handleEmailGen = async () => {
    setLoading(true);
    const text = await generateEmailTemplate(emailJobTitle, emailCandidate);
    setEmailBody(text);
    if (!emailSubject) setEmailSubject(`Update regarding ${emailJobTitle} position`);
    setLoading(false);
  };

  const handleProcessApproval = (id: string, type: 'CORPORATE' | 'JOB', action: 'APPROVE' | 'REJECT') => {
      if (action === 'REJECT') {
          setRejectingId(id);
          return;
      }
      
      if (type === 'CORPORATE') {
          store.updateCorporateStatus(id, 'APPROVED');
      } else {
          store.updateJobStatus(id, 'Approved');
      }
      alert(`${type} Approved!`);
  };

  const confirmReject = (type: 'CORPORATE' | 'JOB') => {
      if (!rejectingId) return;
      if (type === 'CORPORATE') {
          store.updateCorporateStatus(rejectingId, 'REJECTED', approvalReason);
      } else {
          store.updateJobStatus(rejectingId, 'Rejected', approvalReason);
      }
      alert(`${type} Rejected with reason: ${approvalReason}`);
      setRejectingId(null);
      setApprovalReason('');
  };

  const toggleCandidateColumn = (col: string) => {
      if (candidateColumns.includes(col)) {
          setCandidateColumns(candidateColumns.filter(c => c !== col));
      } else {
          setCandidateColumns([...candidateColumns, col]);
      }
  };

  const handleDownload = (format: string) => {
      alert(`Downloading report as ${format}...`);
  };

  // Add missing handlers
  const handleLoadTemplate = (template: EmailTemplate) => {
    setEmailSubject(template.subject);
    setEmailBody(template.body);
  };

  const handleDeleteTemplate = (id: string) => {
    store.deleteEmailTemplate(id);
    setTemplates(store.getEmailTemplates());
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName || !emailBody) {
        alert("Please provide a template name and body.");
        return;
    }
    const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        subject: emailSubject,
        body: emailBody
    };
    const added = store.addEmailTemplate(newTemplate);
    if (added) {
        setTemplates(store.getEmailTemplates());
        setNewTemplateName('');
        alert("Template saved!");
    } else {
        alert("Template limit reached.");
    }
  };

  const handleSendEmail = () => {
      if (!emailTo) return alert("Please enter recipient email.");
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          alert(`Email sent to ${emailTo}`);
          setEmailTo('');
      }, 1000);
  };

  const handleUnsaveJob = (id: string) => {
      store.toggleSaveJob(id);
      setSavedJobsList(store.getSavedJobs());
  };

  // Banner Handlers
  const handleToggleBanner = (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      const updated = { ...banner, isActive: !banner.isActive };
      store.updateBanner(updated);
      setBanners(store.getBanners());
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
  };

  const handleSaveBanner = () => {
    if (editingBanner) {
      store.updateBanner(editingBanner);
      setBanners(store.getBanners());
      setEditingBanner(null);
      alert('Banner template updated successfully!');
    }
  };

  const handleApplyTemplateStyle = (style: string) => {
      if(editingBanner) {
          setEditingBanner({...editingBanner, style});
      }
  };
  
  const handleSaveStats = () => {
      store.updateStats(homeStats);
      alert("Homepage Stats Updated!");
  };

  // Success Stories Handlers
  const handleAddStory = () => {
      setStoryForm({});
      setEditingStoryId(null);
      setIsStoryModalOpen(true);
  };

  const handleEditStory = (story: SuccessStory) => {
      setStoryForm(story);
      setEditingStoryId(story.id);
      setIsStoryModalOpen(true);
  };

  const handleDeleteStory = (id: string) => {
      if (window.confirm("Are you sure you want to delete this story?")) {
          store.deleteSuccessStory(id);
          setStories([...store.getSuccessStories()]);
      }
  };

  const handleSaveStory = () => {
      if (!storyForm.name || !storyForm.role || !storyForm.comment) {
          alert("Please fill in all required fields.");
          return;
      }

      const newStory: SuccessStory = {
          id: editingStoryId || Date.now().toString(),
          name: storyForm.name,
          role: storyForm.role,
          comment: storyForm.comment,
          imageUrl: storyForm.imageUrl || 'https://i.pravatar.cc/150'
      };

      if (editingStoryId) {
          store.updateSuccessStory(newStory);
      } else {
          store.addSuccessStory(newStory);
      }
      
      setStories([...store.getSuccessStories()]);
      setIsStoryModalOpen(false);
      alert(editingStoryId ? "Story updated!" : "Story added!");
  };


  // Mock Profile for Candidate View
  const mockProfile = {
      name: 'John Doe',
      location: 'Mumbai, Maharashtra',
      email: 'john@example.com',
      mobile: '+91 9876543210',
      linkedin: 'https://linkedin.com/in/johndoe',
      languages: 'English, Hindi, Marathi',
      skills: 'React, Node.js, TypeScript, Tailwind CSS',
      experience: [
          { role: 'Senior Developer', company: 'Tech Corp', duration: '2 Years' },
          { role: 'Junior Developer', company: 'StartUp Inc.', duration: '1 Year' }
      ],
      education: [
          { degree: 'B.Tech Computer Science', institution: 'Mumbai University', year: '2019', percentage: '8.5 CGPA' }
      ],
      preferences: {
          role: 'Full Stack Developer',
          type: 'Full Time',
          salary: '12 LPA',
          relocate: 'Yes'
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      // 1. Master Data
      case 'master':
        return (
            <div className="space-y-6">
                {/* Stats Editor */}
                <Card title="Homepage Statistics">
                    <p className="text-sm text-gray-500 mb-4">Update the counters displayed on the homepage stats bar.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Jobs Posted" value={homeStats.jobsPosted} onChange={e => setHomeStats({...homeStats, jobsPosted: e.target.value})} containerClassName="mb-0" />
                        <Input label="Companies" value={homeStats.companies} onChange={e => setHomeStats({...homeStats, companies: e.target.value})} containerClassName="mb-0" />
                        <Input label="Candidates" value={homeStats.candidates} onChange={e => setHomeStats({...homeStats, candidates: e.target.value})} containerClassName="mb-0" />
                        <Input label="Events" value={homeStats.events} onChange={e => setHomeStats({...homeStats, events: e.target.value})} containerClassName="mb-0" />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSaveStats}>Update Stats</Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['City Master', 'State Master', 'Pin Code Master'].map((m) => (
                        <Card key={m} title={m}>
                            <div className="flex flex-col space-y-3">
                                <Button className="text-sm bg-blue-600" onClick={() => alert("Simulating AI Generation from public sources...")}>
                                    <i className="fas fa-magic mr-2"></i> Generate via AI
                                </Button>
                                <Button variant="outline" className="text-sm">
                                    <i className="fas fa-upload mr-2"></i> Upload File
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {['Job Title Master', 'Job Description Master', 'Degree Master', 'Experience Master'].map((m) => (
                        <Card key={m} title={m}>
                             <div className="flex flex-col space-y-3">
                                <Button variant="outline" className="text-sm w-full">
                                    <i className="fas fa-upload mr-2"></i> Upload External File
                                </Button>
                                <p className="text-xs text-gray-500 text-center">Supports CSV/Excel</p>
                             </div>
                        </Card>
                    ))}
                </div>
            </div>
        );

      // 2. Approvals
      case 'approvals':
        const corporates = store.getCorporates().filter(c => c.status === 'PENDING');
        const jobs = store.getJobs().filter(j => j.approvalStatus === 'Waiting for Approval');

        return (
            <div className="space-y-6">
                <div className="flex space-x-2 border-b border-gray-200 pb-2">
                    <button onClick={() => setApprovalType('CORPORATE')} className={`px-4 py-2 font-medium ${approvalType === 'CORPORATE' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Corporate Approvals</button>
                    <button onClick={() => setApprovalType('JOB')} className={`px-4 py-2 font-medium ${approvalType === 'JOB' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>Job Approvals</button>
                </div>

                {approvalType === 'CORPORATE' ? (
                    <div className="space-y-4">
                        {corporates.length === 0 && <p className="text-gray-500">No pending corporate approvals.</p>}
                        {corporates.map(c => (
                            <div key={c.id} className="bg-white p-4 rounded shadow border border-gray-100 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{c.companyName}</h3>
                                    <p className="text-sm text-gray-600">{c.fullName} ({c.designation})</p>
                                    <p className="text-sm text-gray-500">Email: {c.email} | Mobile: {c.mobile}</p>
                                    <p className="text-sm text-gray-500">Location: {c.location}</p>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Button className="bg-green-600 text-xs px-3" onClick={() => handleProcessApproval(c.id, 'CORPORATE', 'APPROVE')}>Approve</Button>
                                    <Button className="bg-red-500 text-xs px-3" onClick={() => handleProcessApproval(c.id, 'CORPORATE', 'REJECT')}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.length === 0 && <p className="text-gray-500">No pending job approvals.</p>}
                        {jobs.map(j => (
                            <div key={j.id} className="bg-white p-4 rounded shadow border border-gray-100 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{j.title}</h3>
                                    <p className="text-sm text-gray-600">{j.company} - {j.location}</p>
                                    <p className="text-sm text-gray-500">Posted: {j.postedDate}</p>
                                    <button className="text-primary text-xs underline mt-1" onClick={() => { setJobForm(j as any); setIsPreviewOpen(true); }}>Preview Job</button>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <Button className="bg-green-600 text-xs px-3" onClick={() => handleProcessApproval(j.id, 'JOB', 'APPROVE')}>Approve</Button>
                                    <Button className="bg-red-500 text-xs px-3" onClick={() => handleProcessApproval(j.id, 'JOB', 'REJECT')}>Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                <Modal isOpen={!!rejectingId} onClose={() => setRejectingId(null)} title={`Reject ${approvalType === 'CORPORATE' ? 'Corporate' : 'Job'}`}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Please provide a reason for rejection:</p>
                        <textarea className="w-full border rounded p-2" rows={3} value={approvalReason} onChange={e => setApprovalReason(e.target.value)}></textarea>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                            <Button className="bg-red-600 text-white" onClick={() => confirmReject(approvalType)}>Confirm Reject</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );

      // 3. Reports
      case 'reports':
        return (
            <div className="space-y-6">
                 <div className="flex space-x-2 overflow-x-auto border-b border-gray-200 pb-2">
                    {['CORPORATE', 'JOB', 'CANDIDATE', 'EVENT'].map(t => (
                        <button key={t} onClick={() => setReportType(t as any)} className={`px-4 py-2 font-medium whitespace-nowrap ${reportType === t ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
                            {t.charAt(0) + t.slice(1).toLowerCase()} List
                        </button>
                    ))}
                </div>

                <div className="flex justify-end space-x-2 mb-4">
                     <Button variant="outline" className="text-xs" onClick={() => handleDownload('Excel')}><i className="fas fa-file-excel mr-1 text-green-600"></i> Excel</Button>
                     <Button variant="outline" className="text-xs" onClick={() => handleDownload('CSV')}><i className="fas fa-file-csv mr-1 text-green-600"></i> CSV</Button>
                     <Button variant="outline" className="text-xs" onClick={() => handleDownload('PDF')}><i className="fas fa-file-pdf mr-1 text-red-600"></i> PDF</Button>
                </div>

                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        {reportType === 'CORPORATE' && (
                            <>
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Full Name', 'Company Name', 'Email', 'Mobile No', 'Designation', 'Location', 'Status', 'Status Reason', 'Preview'].map(h => <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {store.getCorporates().map(c => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4">{c.fullName}</td>
                                            <td className="px-6 py-4 font-medium">{c.companyName}</td>
                                            <td className="px-6 py-4">{c.email}</td>
                                            <td className="px-6 py-4">{c.mobile}</td>
                                            <td className="px-6 py-4">{c.designation}</td>
                                            <td className="px-6 py-4">{c.location}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : c.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{c.statusReason || '-'}</td>
                                            <td className="px-6 py-4"><button className="text-blue-600">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                        {reportType === 'JOB' && (
                            <>
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Job Title', 'Job Type', 'Work Location', 'Salary', 'Expiry Date', 'Status', 'Preview'].map(h => <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {store.getJobs().map(j => (
                                        <tr key={j.id}>
                                            <td className="px-6 py-4 font-medium">{j.title}</td>
                                            <td className="px-6 py-4">{j.jobType}</td>
                                            <td className="px-6 py-4">{j.location}</td>
                                            <td className="px-6 py-4">{j.salaryMin} - {j.salaryMax}</td>
                                            <td className="px-6 py-4">{j.expiryDate}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${j.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' : j.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {j.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4"><button onClick={() => { setJobForm(j as any); setIsPreviewOpen(true); }} className="text-blue-600">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                        {reportType === 'CANDIDATE' && (
                            <>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        {candidateColumns.map(col => <th key={col} className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{col}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {store.getCandidates().map(c => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4 font-bold">{c.name}</td>
                                            {candidateColumns.map(col => {
                                                let val = '';
                                                switch(col) {
                                                    case 'Date of Birth': val = c.dob || '-'; break;
                                                    case 'Mobile No': val = c.mobile || '-'; break;
                                                    case 'Email': val = c.email || '-'; break;
                                                    case 'State': val = c.state || '-'; break;
                                                    case 'City': val = c.city || '-'; break;
                                                    case 'Pin Code': val = c.pincode || '-'; break;
                                                    case 'Area': val = c.area || '-'; break;
                                                    case 'Preferred Cities': val = c.preferredCities || '-'; break;
                                                    case 'LinkedIn': val = c.linkedin || '-'; break;
                                                    case 'Preferred Job Type': val = c.preferredJobType || '-'; break;
                                                    case 'Preferred Role Type': val = c.preferredRole || '-'; break;
                                                    case 'Is Fresher': val = c.isFresher || '-'; break;
                                                    case 'Highest Education': val = c.highestEducation || '-'; break;
                                                    case 'Job Fair Enrolled': val = c.jobFairEnrolled || '-'; break;
                                                    case 'Created By': val = c.createdBy || '-'; break;
                                                    case 'Created On': val = c.createdOn || '-'; break;
                                                    case 'CV': val = c.cvLink || '-'; break;
                                                    default: val = '-';
                                                }
                                                return <td key={col} className="px-6 py-4 text-sm whitespace-nowrap">{val}</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                         {reportType === 'EVENT' && (
                            <>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {store.getEvents().map(e => (
                                        <tr key={e.id}>
                                            <td className="px-6 py-4 font-medium">{e.title}</td>
                                            <td className="px-6 py-4">{e.date}</td>
                                            <td className="px-6 py-4">{e.location}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>
        );

      case 'job-posting':
          return (
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Post a New Job</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Job Title" value={jobForm.title} onChange={e => handleJobChange('title', e.target.value)} />
                      <Input label="Location" value={jobForm.location} onChange={e => handleJobChange('location', e.target.value)} />
                      
                      <Select label="Category" options={['IT', 'Marketing', 'Finance', 'HR', 'Sales']} value={jobForm.category} onChange={e => handleJobChange('category', e.target.value)} />
                      <Select label="Job Type" options={['Full Time', 'Part Time', 'Internship']} value={jobForm.jobType} onChange={e => handleJobChange('jobType', e.target.value)} />

                      <Input label="Min Salary" value={jobForm.salaryMin} onChange={e => handleJobChange('salaryMin', e.target.value)} />
                      <Input label="Max Salary" value={jobForm.salaryMax} onChange={e => handleJobChange('salaryMax', e.target.value)} />

                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                         <textarea className="w-full border rounded p-2" rows={5} value={jobForm.description} onChange={e => handleJobChange('description', e.target.value)}></textarea>
                      </div>

                      <Input label="Expiry Date" type="date" value={jobForm.expiryDate} onChange={e => handleJobChange('expiryDate', e.target.value)} />
                  </div>
                  <div className="flex space-x-4 justify-end">
                      <Button variant="outline" onClick={handlePreview}>Preview</Button>
                      <Button onClick={handlePublishJob}>Publish Job</Button>
                  </div>
              </div>
          );
      
      case 'blog':
          return (
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Blog Management</h3>
                  <div className="flex space-x-4 items-end">
                      <Input containerClassName="flex-1 mb-0" label="Blog Topic" placeholder="e.g. Resume Tips for 2024" value={blogTopic} onChange={e => setBlogTopic(e.target.value)} />
                      <Button onClick={handleBlogGen} disabled={loading} className="mb-0.5">
                          {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-magic mr-2"></i> Draft with AI</>}
                      </Button>
                  </div>
                  <div className="border rounded p-2 bg-gray-50 min-h-[300px]">
                      <textarea className="w-full h-full bg-transparent border-none focus:ring-0" placeholder="Content will appear here..." value={generatedBlog} onChange={e => setGeneratedBlog(e.target.value)} rows={15}></textarea>
                  </div>
                  <div className="flex justify-end">
                      <Button onClick={handlePostBlog}>Publish to Blog</Button>
                  </div>
              </div>
          );

      case 'email-marketing':
          return (
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Email Marketing & Templates</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                          <Card title="AI Template Generator">
                              <Input label="Job Title" value={emailJobTitle} onChange={e => setEmailJobTitle(e.target.value)} />
                              <Input label="Candidate Name" value={emailCandidate} onChange={e => setEmailCandidate(e.target.value)} />
                              <Button onClick={handleEmailGen} disabled={loading} className="w-full">
                                  {loading ? 'Generating...' : 'Generate Email Draft'}
                              </Button>
                          </Card>
                          
                          <Card title="Saved Templates">
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                  {templates.map(t => (
                                      <div key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border hover:bg-gray-100 cursor-pointer" onClick={() => handleLoadTemplate(t)}>
                                          <span className="text-sm font-medium">{t.name}</span>
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                      </div>
                                  ))}
                              </div>
                          </Card>
                      </div>

                      <div className="space-y-4">
                          <Input label="Email Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
                              <textarea className="w-full border rounded p-2" rows={10} value={emailBody} onChange={e => setEmailBody(e.target.value)}></textarea>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                              <Input containerClassName="mb-0 flex-1" placeholder="New Template Name" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} />
                              <Button variant="outline" onClick={handleSaveTemplate}>Save Template</Button>
                          </div>

                          <div className="border-t pt-4 mt-4">
                              <h4 className="font-bold text-sm mb-2">Test Send</h4>
                              <div className="flex space-x-2">
                                  <Input containerClassName="mb-0 flex-1" placeholder="Recipient Email" value={emailTo} onChange={e => setEmailTo(e.target.value)} />
                                  <Button onClick={handleSendEmail}><i className="fas fa-paper-plane mr-2"></i> Send</Button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          );

      case 'manage-events':
          return (
              <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Manage Events</h3>
                  <div className="flex justify-end">
                      <Button onClick={() => alert("Add Event functionality would open here.")}><i className="fas fa-plus mr-2"></i> Add Event</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                      {store.getEvents().map(e => (
                          <Card key={e.id} className="flex flex-row items-center p-4">
                              <img src={e.imageUrl} alt="" className="w-24 h-24 object-cover rounded mr-4" />
                              <div className="flex-1">
                                  <h4 className="font-bold text-lg">{e.title}</h4>
                                  <p className="text-sm text-gray-500">{e.date} | {e.location}</p>
                                  <p className="text-sm mt-1">{e.description}</p>
                              </div>
                              <div className="flex flex-col space-y-2">
                                  <Button variant="outline" className="text-xs">Edit</Button>
                                  <Button variant="outline" className="text-xs text-red-600">Delete</Button>
                              </div>
                          </Card>
                      ))}
                  </div>
              </div>
          );

      case 'success-stories':
          return (
              <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="text-xl font-bold text-gray-800">Success Stories</h3>
                      <Button onClick={handleAddStory}><i className="fas fa-plus mr-2"></i> Add Story</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stories.map(s => (
                          <Card key={s.id} className="relative p-4">
                              <div className="absolute top-2 right-2 space-x-2">
                                  <button onClick={() => handleEditStory(s)} className="text-blue-500"><i className="fas fa-edit"></i></button>
                                  <button onClick={() => handleDeleteStory(s.id)} className="text-red-500"><i className="fas fa-trash"></i></button>
                              </div>
                              <div className="flex items-center mb-3">
                                  <img src={s.imageUrl} alt={s.name} className="w-12 h-12 rounded-full mr-3" />
                                  <div>
                                      <div className="font-bold">{s.name}</div>
                                      <div className="text-xs text-gray-500">{s.role}</div>
                                  </div>
                              </div>
                              <p className="text-sm italic text-gray-600">"{s.comment}"</p>
                          </Card>
                      ))}
                  </div>
              </div>
          );
      
      case 'overview':
           if (userType === UserType.CANDIDATE) {
               if (candidateTab === 'saved') {
                   return (
                       <div className="space-y-6">
                           <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Saved Jobs</h3>
                           {savedJobsList.length === 0 ? <p className="text-gray-500">No saved jobs.</p> : (
                               <div className="grid gap-4">
                                   {savedJobsList.map(job => (
                                       <Card key={job.id} className="flex justify-between items-center p-4">
                                           <div>
                                               <h4 className="font-bold text-lg text-primary">{job.title}</h4>
                                               <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                                           </div>
                                           <div className="flex space-x-2">
                                               <Button className="text-xs">Apply</Button>
                                               <button onClick={() => handleUnsaveJob(job.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                                           </div>
                                       </Card>
                                   ))}
                               </div>
                           )}
                       </div>
                   );
               } else {
                   return (
                       <div className="space-y-6">
                           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                               <div className="flex items-center mb-6">
                                   <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500 mr-4">
                                       {mockProfile.name.charAt(0)}
                                   </div>
                                   <div>
                                       <h2 className="text-2xl font-bold">{mockProfile.name}</h2>
                                       <p className="text-gray-500"><i className="fas fa-map-marker-alt mr-2"></i>{mockProfile.location}</p>
                                       <p className="text-gray-500 text-sm mt-1">Profile Completion: <span className="text-green-600 font-bold">85%</span></p>
                                   </div>
                                   <div className="ml-auto">
                                       <Button variant="outline" className="text-sm"><i className="fas fa-edit mr-2"></i> Edit Profile</Button>
                                   </div>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div>
                                       <h4 className="font-bold text-gray-700 mb-2">Contact Info</h4>
                                       <ul className="text-sm space-y-1 text-gray-600">
                                           <li><i className="fas fa-envelope w-6 text-center"></i> {mockProfile.email}</li>
                                           <li><i className="fas fa-phone w-6 text-center"></i> {mockProfile.mobile}</li>
                                           <li><i className="fab fa-linkedin w-6 text-center"></i> <a href={mockProfile.linkedin} className="text-blue-500 hover:underline">LinkedIn Profile</a></li>
                                       </ul>
                                   </div>
                                   <div>
                                        <h4 className="font-bold text-gray-700 mb-2">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mockProfile.skills.split(',').map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">{s.trim()}</span>)}
                                        </div>
                                   </div>
                               </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                               <Card className="text-center p-4">
                                   <div className="text-3xl font-bold text-blue-600">12</div>
                                   <div className="text-sm text-gray-500">Jobs Applied</div>
                               </Card>
                               <Card className="text-center p-4">
                                   <div className="text-3xl font-bold text-orange-500">4</div>
                                   <div className="text-sm text-gray-500">Interviews</div>
                               </Card>
                               <Card className="text-center p-4">
                                   <div className="text-3xl font-bold text-green-600">1</div>
                                   <div className="text-sm text-gray-500">Offers</div>
                               </Card>
                           </div>
                       </div>
                   );
               }
           }
           return null;

      default: return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
        {userType !== UserType.CANDIDATE && (
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} userType={userType} />
        )}
        <main className="flex-1 p-8 overflow-y-auto h-screen">
            <div className="mb-6 pb-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {userType === UserType.CANDIDATE ? 'My Dashboard' : 'Control Center'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {userType === UserType.CANDIDATE ? `Welcome back, ${mockProfile.name}` : 'Manage your platform operations'}
                    </p>
                </div>
                {userType === UserType.CANDIDATE && (
                    <div className="flex space-x-2">
                         <button onClick={() => setCandidateTab('overview')} className={`px-4 py-2 text-sm font-medium rounded-md ${candidateTab === 'overview' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:bg-gray-200'}`}>Overview</button>
                         <button onClick={() => setCandidateTab('saved')} className={`px-4 py-2 text-sm font-medium rounded-md ${candidateTab === 'saved' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:bg-gray-200'}`}>Saved Jobs</button>
                    </div>
                )}
            </div>

            {renderContent()}
        </main>
        
        {/* Job Preview Modal */}
        <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Job Post Preview">
             <div className="space-y-4">
                 <div className="bg-gray-50 p-4 rounded border">
                     <h3 className="text-lg font-bold text-primary">{jobForm.title}</h3>
                     <p className="text-sm text-gray-600">My Company - {jobForm.location}</p>
                     <div className="flex space-x-2 mt-2 text-xs">
                         <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{jobForm.jobType}</span>
                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{jobForm.salaryMin} - {jobForm.salaryMax}</span>
                     </div>
                     <p className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">{jobForm.description}</p>
                 </div>
                 <div className="flex justify-end space-x-2">
                     <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Edit</Button>
                     <Button onClick={handlePublishJob}>Confirm & Publish</Button>
                 </div>
             </div>
        </Modal>

        {/* Success Story Modal */}
        <Modal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} title={editingStoryId ? "Edit Story" : "Add New Success Story"}>
             <div className="space-y-4">
                 <Input label="Name" value={storyForm.name || ''} onChange={e => setStoryForm({...storyForm, name: e.target.value})} />
                 <Input label="Role / Title" value={storyForm.role || ''} onChange={e => setStoryForm({...storyForm, role: e.target.value})} />
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Comment / Story</label>
                     <textarea className="w-full border rounded p-2" rows={4} value={storyForm.comment || ''} onChange={e => setStoryForm({...storyForm, comment: e.target.value})}></textarea>
                 </div>
                 <Input label="Image URL (Optional)" value={storyForm.imageUrl || ''} onChange={e => setStoryForm({...storyForm, imageUrl: e.target.value})} />
                 <Button className="w-full" onClick={handleSaveStory}>Save Story</Button>
             </div>
        </Modal>
    </div>
  );
};

export default Dashboard;
