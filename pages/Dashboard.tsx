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
                                <Button className="text-sm bg-blue-600 hover:bg-blue-700" onClick={() => alert("Simulating AI Generation from public sources...")}>
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
                                    <Button className="bg-green-600 hover:bg-green-700 text-xs px-3" onClick={() => handleProcessApproval(c.id, 'CORPORATE', 'APPROVE')}>Approve</Button>
                                    <Button className="bg-red-500 hover:bg-red-600 text-xs px-3" onClick={() => handleProcessApproval(c.id, 'CORPORATE', 'REJECT')}>Reject</Button>
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
                                    <Button className="bg-green-600 hover:bg-green-700 text-xs px-3" onClick={() => handleProcessApproval(j.id, 'JOB', 'APPROVE')}>Approve</Button>
                                    <Button className="bg-red-500 hover:bg-red-600 text-xs px-3" onClick={() => handleProcessApproval(j.id, 'JOB', 'REJECT')}>Reject</Button>
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
                                            <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-900">View</button></td>
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
                                            <td className="px-6 py-4"><button onClick={() => { setJobForm(j as any); setIsPreviewOpen(true); }} className="text-blue-600 hover:text-blue-900">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                        {reportType === 'CANDIDATE' && (
                            <>
                                <div className="p-4 bg-gray-50 border-b">
                                    <h4 className="text-sm font-bold mb-2">Select Columns:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {allCandidateColumns.map(col => (
                                            <label key={col} className="inline-flex items-center bg-white border border-gray-300 rounded px-2 py-1 text-xs cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" className="mr-2" checked={candidateColumns.includes(col)} onChange={() => toggleCandidateColumn(col)} />
                                                {col}
                                            </label>
                                        ))}
                                    </div>
                                </div>
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
                                                // Map readable column names to data keys
                                                const keyMap: any = {
                                                    "Mobile No": 'mobile', "Date of Birth": 'dob', "Pin Code": 'pincode', "Preferred Cities": 'preferredCities', 
                                                    "LinkedIn": 'linkedin', "Preferred Job Type": 'preferredJobType', "Preferred Role Type": 'preferredRole', "Is Fresher": 'isFresher',
                                                    "Highest Education": 'highestEducation', "Job Fair Enrolled": 'jobFairEnrolled', "Created By": 'createdBy', "Created On": 'createdOn', "CV": 'cvLink'
                                                };
                                                const key = keyMap[col] || col.toLowerCase();
                                                return <td key={col} className="px-6 py-4">{(c as any)[key] || '-'}</td>
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
                                        {['Job Fair Name', 'Location', 'Date', 'Active', 'Candidate Count', 'Action'].map(h => <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {store.getEvents().map(e => (
                                        <tr key={e.id}>
                                            <td className="px-6 py-4 font-medium">{e.title}</td>
                                            <td className="px-6 py-4">{e.location}</td>
                                            <td className="px-6 py-4">{e.date}</td>
                                            <td className="px-6 py-4">{new Date(e.date) >= new Date() ? 'Yes' : 'No'}</td>
                                            <td className="px-6 py-4">120</td>
                                            <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-900">Manage</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            </div>
        );

      // 4. Job Posting
      case 'job-posting':
        return (
          <>
          <div className="space-y-6">
            <Card title="Post a New Job">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* Row 1 */}
                 <Input label="Job Title" value={jobForm.title} onChange={e => handleJobChange('title', e.target.value)} />
                 <Select label="Job Type" options={['Full Time', 'Part Time', 'Internship']} value={jobForm.jobType} onChange={e => handleJobChange('jobType', e.target.value)} />
                 <Select label="Category" options={['IT', 'Finance', 'Marketing', 'HR', 'Sales']} value={jobForm.category} onChange={e => handleJobChange('category', e.target.value)} />

                 {/* Row 2 */}
                 <Input label="Location" value={jobForm.location} onChange={e => handleJobChange('location', e.target.value)} />
                 <Input label="Qualification" value={jobForm.qualification} onChange={e => handleJobChange('qualification', e.target.value)} />
                 <Input label="Experience (Years)" value={jobForm.experience} onChange={e => handleJobChange('experience', e.target.value)} />

                 {/* Row 3 */}
                 <Input label="No of Vacancies" type="number" value={jobForm.vacancies} onChange={e => handleJobChange('vacancies', e.target.value)} />
                 <Input label="Skill Required" placeholder="Comma separated" value={jobForm.skills} onChange={e => handleJobChange('skills', e.target.value)} />
                 <Select label="English Proficiency" options={['Native', 'Proficient', 'Advanced', 'Beginner']} value={jobForm.englishProficiency} onChange={e => handleJobChange('englishProficiency', e.target.value)} />

                 {/* Row 4 - Checkboxes */}
                 <div className="flex items-center h-full pt-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={jobForm.relocate} onChange={e => handleJobChange('relocate', e.target.checked)} className="h-4 w-4 text-primary rounded" />
                        <span className="text-sm text-gray-700">Ready to Relocate?</span>
                    </label>
                 </div>
                 <div className="flex items-center h-full pt-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={jobForm.bikeLicense} onChange={e => handleJobChange('bikeLicense', e.target.checked)} className="h-4 w-4 text-primary rounded" />
                        <span className="text-sm text-gray-700">Bike Driving License?</span>
                    </label>
                 </div>
                 <Select label="Event Listing (Optional)" options={['Mega Job Fair 2024', 'Tech Summit']} value={jobForm.linkedEvent} onChange={e => handleJobChange('linkedEvent', e.target.value)} />

                 {/* Row 5 */}
                 <div className="md:col-span-2">
                    <Input label="LinkedIn URL" value={jobForm.linkedinUrl} onChange={e => handleJobChange('linkedinUrl', e.target.value)} />
                 </div>
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Computer Literacy</label>
                    <div className="flex flex-wrap gap-4">
                        {['Word', 'Excel', 'PowerPoint', 'Google Sheet', 'Google Form'].map(skill => (
                            <label key={skill} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-1 rounded border border-gray-200">
                                <input type="checkbox" checked={jobForm.computerLiteracy.includes(skill)} onChange={() => toggleComputerSkill(skill)} className="h-4 w-4 text-primary rounded" />
                                <span className="text-sm text-gray-700">{skill}</span>
                            </label>
                        ))}
                    </div>
                 </div>

                 {/* Row 6 - Salary */}
                 <Input label="Salary Min" value={jobForm.salaryMin} onChange={e => handleJobChange('salaryMin', e.target.value)} />
                 <Input label="Salary Max" value={jobForm.salaryMax} onChange={e => handleJobChange('salaryMax', e.target.value)} />
                 <Select label="Salary Type" options={['Fixed', 'Incentives', 'Fixed+Incentives']} value={jobForm.salaryType} onChange={e => handleJobChange('salaryType', e.target.value)} />

                 {/* Row 7 */}
                 <div className="md:col-span-2">
                     <Input label="Additional Perks" value={jobForm.perks} onChange={e => handleJobChange('perks', e.target.value)} />
                 </div>
                 <Select label="Receive Apps From" options={['Pan India', 'Overseas', 'Selected Region']} value={jobForm.receiveAppsFrom} onChange={e => handleJobChange('receiveAppsFrom', e.target.value)} />

                 {/* Row 8 */}
                 <Input label="Job Expiry Date (Max 90 days)" type="date" value={jobForm.expiryDate} onChange={e => handleJobChange('expiryDate', e.target.value)} />
                 <Select label="Status" options={['Approved', 'Rejected', 'Waiting for Approval']} value={jobForm.status} onChange={e => handleJobChange('status', e.target.value)} disabled={userType === UserType.CORPORATE} />
                 <div className="md:col-span-3">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Status Reason (Internal Note)</label>
                     <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} value={jobForm.statusReason} onChange={e => handleJobChange('statusReason', e.target.value)}></textarea>
                 </div>

                 {/* Row 9 - Descriptions */}
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} value={jobForm.description} onChange={e => handleJobChange('description', e.target.value)}></textarea>
                 </div>
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Instructions</label>
                    <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} value={jobForm.instructions} onChange={e => handleJobChange('instructions', e.target.value)}></textarea>
                 </div>
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
                  <i className="fas fa-exclamation-circle text-yellow-600 mt-1 mr-3"></i>
                  <div>
                      <h4 className="text-sm font-bold text-yellow-800">Important Note</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                          All job postings are subject to verification and approval by the Admin before going live on the job board.
                      </p>
                  </div>
              </div>

              <div className="flex space-x-4 mt-8">
                  <Button variant="outline" onClick={handlePreview} className="flex-1">Preview</Button>
                  <Button onClick={handlePublishJob} className="flex-1">Publish</Button>
              </div>
            </Card>
          </div>

          <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Job Post Preview">
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="border-b pb-4">
                      <h3 className="text-xl font-bold text-primary">{jobForm.title || "Job Title"}</h3>
                      <p className="text-sm text-gray-600">{jobForm.location} • {jobForm.jobType} • {jobForm.category}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">Status: {jobForm.status}</span>
                          {jobForm.expiryDate && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Exp: {jobForm.expiryDate}</span>}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="font-bold text-gray-700">Salary:</span> {jobForm.salaryMin} - {jobForm.salaryMax} ({jobForm.salaryType})</div>
                      <div><span className="font-bold text-gray-700">Vacancies:</span> {jobForm.vacancies}</div>
                      <div><span className="font-bold text-gray-700">Experience:</span> {jobForm.experience}</div>
                      <div><span className="font-bold text-gray-700">Qualification:</span> {jobForm.qualification}</div>
                      <div><span className="font-bold text-gray-700">Relocate:</span> {jobForm.relocate ? 'Yes' : 'No'}</div>
                      <div><span className="font-bold text-gray-700">Bike License:</span> {jobForm.bikeLicense ? 'Yes' : 'No'}</div>
                      <div className="col-span-2"><span className="font-bold text-gray-700">Computer Literacy:</span> {jobForm.computerLiteracy.join(', ') || 'None'}</div>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-800 mb-1">Description</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{jobForm.description || "No description provided."}</p>
                  </div>

                  <div>
                      <h4 className="font-bold text-gray-800 mb-1">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                          {jobForm.skills.split(',').map((s, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{s.trim()}</span>
                          ))}
                      </div>
                  </div>

                  {jobForm.instructions && (
                      <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
                          <strong>Note:</strong> {jobForm.instructions}
                      </div>
                  )}

                  <div className="pt-4 border-t flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Edit</Button>
                      <Button onClick={handlePublishJob}>Confirm & Publish</Button>
                  </div>
              </div>
          </Modal>
          </>
        );

      // 5. Blog
      case 'blog':
        return (
           <Card title="AI Blog Writer">
             <div className="space-y-4">
               <Input label="Topic / Title" value={blogTopic} onChange={(e) => setBlogTopic(e.target.value)} placeholder="e.g. Future of Remote Work" />
               <Button onClick={handleBlogGen} disabled={loading} className="w-full md:w-auto">
                 {loading ? 'Writing...' : 'Draft with AI'}
               </Button>
               
               <div className="mt-6 p-4 bg-gray-50 border rounded-md">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Content Editor</h4>
                    <span className="text-xs text-gray-500">Edit or write your blog post below</span>
                 </div>
                 <textarea 
                    className="w-full p-3 border border-gray-300 rounded-md text-sm text-gray-700 h-64 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    placeholder="AI generated content will appear here, or start writing manually..."
                    value={generatedBlog}
                    onChange={(e) => setGeneratedBlog(e.target.value)}
                 />
                 <div className="mt-4 flex justify-end">
                    <Button 
                        onClick={handlePostBlog} 
                        disabled={!generatedBlog.trim() || !blogTopic.trim()} 
                        variant={(!generatedBlog.trim() || !blogTopic.trim()) ? 'outline' : 'primary'}
                    >
                      Post to Home Page
                    </Button>
                 </div>
               </div>
             </div>
           </Card>
        );

      // 6. Email Marketing
      case 'email-marketing':
          return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Templates and AI */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title="Saved Templates">
                            <p className="text-xs text-gray-500 mb-2">{templates.length} / 10 used</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {templates.map(t => (
                                    <div key={t.id} className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex justify-between items-center group" onClick={() => handleLoadTemplate(t)}>
                                        <div className="truncate flex-1">
                                            <div className="text-sm font-medium text-gray-800 truncate">{t.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{t.subject}</div>
                                        </div>
                                        <button 
                                            onClick={(e) => {e.stopPropagation(); handleDeleteTemplate(t.id)}} 
                                            className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                            title="Delete Template"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                {templates.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No templates saved.</p>}
                            </div>
                        </Card>

                        <Card title="AI Email Assistant">
                            <p className="text-xs text-gray-500 mb-4">Generate content to populate the composer.</p>
                            <Input label="Job Title" value={emailJobTitle} onChange={e => setEmailJobTitle(e.target.value)} containerClassName="mb-3" />
                            <Input label="Candidate Name" value={emailCandidate} onChange={e => setEmailCandidate(e.target.value)} containerClassName="mb-3" />
                            <Button onClick={handleEmailGen} disabled={loading} className="w-full text-sm">
                                {loading ? 'Generating...' : 'Generate & Fill Composer'}
                            </Button>
                        </Card>
                    </div>

                    {/* Right Column: Composer */}
                    <div className="lg:col-span-2">
                        <Card title="Compose Email">
                            <div className="space-y-4">
                                {/* From Address - Read Only */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                                    <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-gray-600 text-sm">
                                        <i className="fas fa-envelope mr-2 text-gray-400"></i> connect@ampowerjobs.com
                                    </div>
                                </div>

                                <Input 
                                    label="To" 
                                    placeholder="candidate@example.com" 
                                    value={emailTo} 
                                    onChange={e => setEmailTo(e.target.value)} 
                                />
                                <Input 
                                    label="Subject" 
                                    placeholder="Email Subject" 
                                    value={emailSubject} 
                                    onChange={e => setEmailSubject(e.target.value)} 
                                />
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                                    <textarea 
                                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono"
                                        value={emailBody}
                                        onChange={e => setEmailBody(e.target.value)}
                                        placeholder="Write your email here..."
                                    ></textarea>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 gap-4">
                                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                                        <Input 
                                            placeholder="New Template Name" 
                                            value={newTemplateName} 
                                            onChange={e => setNewTemplateName(e.target.value)}
                                            containerClassName="mb-0 w-48"
                                            className="text-sm"
                                        />
                                        <Button variant="outline" onClick={handleSaveTemplate} disabled={templates.length >= 10} className="text-sm whitespace-nowrap">
                                            Save Template
                                        </Button>
                                    </div>
                                    <Button onClick={handleSendEmail} className="w-full sm:w-auto">
                                        <i className="fas fa-paper-plane mr-2"></i> Send Email
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
          );

      // 7. Manage Events (Banner Management)
      case 'manage-events':
        return (
           <div className="space-y-6">
               <Card title="Manage Event Banners">
                   <p className="text-sm text-gray-600 mb-6">Select which banners appear on the Home Page carousel. Click 'Edit' to modify content or choose a different template style.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {banners.map(b => (
                           <div key={b.id} className={`border rounded-lg overflow-hidden shadow-sm relative ${b.isActive ? 'ring-2 ring-primary' : 'opacity-70'}`}>
                               {/* Preview */}
                               <div className={`h-24 p-4 flex flex-col justify-center ${b.style}`}>
                                   <h4 className={`font-bold text-sm truncate ${b.style.includes('text-gray-900') ? 'text-gray-900' : 'text-white'}`}>{b.title}</h4>
                                   <p className={`text-xs truncate ${b.style.includes('text-gray-900') ? 'text-gray-800' : 'text-white/80'}`}>{b.description}</p>
                               </div>
                               
                               <div className="p-3 bg-white">
                                   <div className="flex justify-between items-center mb-2">
                                       <span className="font-bold text-xs text-gray-700">{b.name}</span>
                                       <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                           {b.isActive ? 'Active' : 'Inactive'}
                                       </span>
                                   </div>
                                   <div className="flex space-x-2 mt-3">
                                       <button onClick={() => handleToggleBanner(b.id)} className={`flex-1 text-xs py-1 rounded border ${b.isActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                                           {b.isActive ? 'Deactivate' : 'Activate'}
                                       </button>
                                       <button onClick={() => handleEditBanner(b)} className="flex-1 text-xs py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50">
                                           Edit
                                       </button>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>
               
               {/* Edit Modal */}
               {editingBanner && (
                   <Modal isOpen={!!editingBanner} onClose={() => setEditingBanner(null)} title="Edit Banner Template">
                       <div className="space-y-4">
                           {/* Template Style Selection */}
                           <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">Choose Template Style</label>
                               <div className="grid grid-cols-5 gap-2 mb-2">
                                   {BANNER_TEMPLATES.map(t => (
                                       <button 
                                           key={t.id} 
                                           onClick={() => handleApplyTemplateStyle(t.style)}
                                           className={`h-8 rounded w-full border-2 ${t.style} ${editingBanner.style === t.style ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'} transition-transform shadow-sm`}
                                           title={t.name}
                                       ></button>
                                   ))}
                               </div>
                               <p className="text-xs text-gray-500">Selected Style Preview:</p>
                               <div className={`h-16 w-full rounded mt-1 mb-4 flex items-center justify-center ${editingBanner.style}`}>
                                   <span className={`text-sm font-bold ${editingBanner.style.includes('text-gray-900') ? 'text-gray-900' : 'text-white'}`}>Preview Text</span>
                               </div>
                           </div>

                           <Input label="Title" value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} />
                           <div>
                               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                               <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} value={editingBanner.description} onChange={e => setEditingBanner({...editingBanner, description: e.target.value})}></textarea>
                           </div>
                           <Input label="Button Text" value={editingBanner.buttonText} onChange={e => setEditingBanner({...editingBanner, buttonText: e.target.value})} />
                           <Input label="Link URL" value={editingBanner.link} onChange={e => setEditingBanner({...editingBanner, link: e.target.value})} />
                           
                           <div className="flex justify-end space-x-2 pt-4">
                               <Button variant="outline" onClick={() => setEditingBanner(null)}>Cancel</Button>
                               <Button onClick={handleSaveBanner}>Save Changes</Button>
                           </div>
                       </div>
                   </Modal>
               )}
           </div>
        );

      // 8. Success Stories Management
      case 'success-stories':
        return (
            <div className="space-y-6">
                <Card title="Manage Success Stories">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-gray-600">Add, edit, or remove success stories displayed on the home page.</p>
                        <Button onClick={handleAddStory}><i className="fas fa-plus mr-2"></i> Add New Story</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map(story => (
                            <div key={story.id} className="bg-white border rounded-lg shadow-sm p-4 relative group">
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditStory(story)} className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleDeleteStory(story.id)} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"><i className="fas fa-trash"></i></button>
                                </div>
                                <div className="flex items-center space-x-3 mb-3">
                                    <img src={story.imageUrl} alt={story.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-bold text-gray-800 text-sm">{story.name}</h4>
                                        <p className="text-xs text-gray-500">{story.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 italic">"{story.comment}"</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Modal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} title={editingStoryId ? "Edit Story" : "Add Success Story"}>
                    <div className="space-y-4">
                        <Input label="Name" value={storyForm.name || ''} onChange={e => setStoryForm({...storyForm, name: e.target.value})} />
                        <Input label="Role / Job Title" value={storyForm.role || ''} onChange={e => setStoryForm({...storyForm, role: e.target.value})} placeholder="e.g. Software Engineer @ Google" />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial Comment</label>
                            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} value={storyForm.comment || ''} onChange={e => setStoryForm({...storyForm, comment: e.target.value})}></textarea>
                        </div>
                        <Input label="Image URL" value={storyForm.imageUrl || ''} onChange={e => setStoryForm({...storyForm, imageUrl: e.target.value})} placeholder="https://..." />
                        
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button variant="outline" onClick={() => setIsStoryModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveStory}>Save Story</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );

      // Fallback for inaccessible tabs or removed ones
      default:
        return <div>Select an item from the sidebar.</div>;
    }
  };

  if (userType === UserType.CANDIDATE) {
      return (
          <div className="max-w-7xl mx-auto py-12 px-4">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Candidate Dashboard</h1>
                  <div className="flex space-x-2">
                      <button onClick={() => setCandidateTab('overview')} className={`px-4 py-2 rounded-md text-sm font-medium ${candidateTab === 'overview' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>Overview</button>
                      <button onClick={() => setCandidateTab('profile')} className={`px-4 py-2 rounded-md text-sm font-medium ${candidateTab === 'profile' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>My Profile</button>
                      <button onClick={() => setCandidateTab('saved')} className={`px-4 py-2 rounded-md text-sm font-medium ${candidateTab === 'saved' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}>Saved Jobs</button>
                  </div>
              </div>

              {candidateTab === 'overview' ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card title="Profile Status">
                          <div className="h-2 bg-gray-200 rounded-full mt-2">
                              <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">80% Complete</p>
                          <Button variant="outline" className="mt-4 w-full text-xs" onClick={() => setCandidateTab('profile')}>Update Profile</Button>
                      </Card>
                      <Card title="Applied Jobs">
                          <div className="text-3xl font-bold text-primary">5</div>
                          <p className="text-xs text-gray-500">Active applications</p>
                          <Button variant="outline" className="mt-4 w-full text-xs">View Applications</Button>
                      </Card>
                      <Card title="Saved Jobs">
                          <div className="text-3xl font-bold text-accent">{savedJobsList.length}</div>
                          <p className="text-xs text-gray-500">Bookmarks</p>
                          <Button variant="outline" className="mt-4 w-full text-xs" onClick={() => setCandidateTab('saved')}>View Saved</Button>
                      </Card>
                  </div>
              ) : candidateTab === 'saved' ? (
                  <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                             <h2 className="text-xl font-bold">Saved Jobs</h2>
                             <button onClick={() => setCandidateTab('overview')} className="text-sm text-gray-500 hover:text-primary"> Back to Overview</button>
                          </div>
                          {savedJobsList.length > 0 ? (
                              savedJobsList.map(job => (
                                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                                      <div className="flex items-start space-x-4">
                                          <div className="flex-shrink-0">
                                              {job.companyLogo ? (
                                                  <img src={job.companyLogo} alt={job.company} className="w-12 h-12 object-contain rounded-md border border-gray-100 p-1" />
                                              ) : (
                                                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                                                      <i className="fas fa-building text-xl"></i>
                                                  </div>
                                              )}
                                          </div>
                                          <div className="flex-grow">
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <h3 className="text-lg font-bold text-primary">{job.title}</h3>
                                                      <p className="font-medium text-sm text-gray-700">{job.company}</p>
                                                      <p className="text-xs text-gray-500 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {job.location} • {job.category}</p>
                                                  </div>
                                                  <div className="flex space-x-2">
                                                      <Button variant="outline" className="text-xs border-red-200 text-red-500 hover:bg-red-50" onClick={() => handleUnsaveJob(job.id)}>
                                                          <i className="fas fa-trash mr-1"></i> Remove
                                                      </Button>
                                                      <Button className="text-xs">Apply Now</Button>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </Card>
                              ))
                          ) : (
                              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                  <i className="far fa-heart text-4xl text-gray-300 mb-3"></i>
                                  <p className="text-gray-500">You haven't saved any jobs yet.</p>
                                  <Button variant="outline" className="mt-4" onClick={() => {}}>Browse Jobs</Button>
                              </div>
                          )}
                  </div>
              ) : (
                  <Card title="My Profile Details">
                      <div className="space-y-6">
                          {/* Personal Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
                              <div className="md:col-span-1 flex flex-col items-center">
                                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-3xl mb-3">
                                      <i className="fas fa-user"></i>
                                  </div>
                                  <h3 className="text-xl font-bold">{mockProfile.name}</h3>
                                  <p className="text-gray-500 text-sm">{mockProfile.location}</p>
                                  {mockProfile.linkedin && (
                                      <a href={mockProfile.linkedin} className="text-blue-600 text-xs mt-1 hover:underline">
                                          <i className="fab fa-linkedin mr-1"></i> LinkedIn Profile
                                      </a>
                                  )}
                              </div>
                              <div className="md:col-span-2 space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                      <div><label className="text-xs text-gray-500">Email</label><div className="font-medium">{mockProfile.email}</div></div>
                                      <div><label className="text-xs text-gray-500">Mobile</label><div className="font-medium">{mockProfile.mobile}</div></div>
                                  </div>
                                  <div><label className="text-xs text-gray-500">Languages</label><div className="font-medium">{mockProfile.languages}</div></div>
                                  <div><label className="text-xs text-gray-500">Skills</label><div className="flex flex-wrap gap-2 mt-1">{mockProfile.skills.split(',').map(s => <span key={s} className="bg-teal-50 text-teal-700 px-2 py-1 rounded text-xs">{s.trim()}</span>)}</div></div>
                              </div>
                          </div>

                          {/* Professional */}
                          <div className="border-b pb-6">
                              <h4 className="text-lg font-bold text-gray-800 mb-4">Experience</h4>
                              {mockProfile.experience.map((exp, i) => (
                                  <div key={i} className="mb-4 last:mb-0">
                                      <div className="flex justify-between">
                                          <span className="font-bold text-primary">{exp.role}</span>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                                      </div>
                                      <div className="text-sm font-medium">{exp.company}</div>
                                  </div>
                              ))}
                          </div>

                          {/* Education */}
                          <div className="border-b pb-6">
                              <h4 className="text-lg font-bold text-gray-800 mb-4">Education</h4>
                              {mockProfile.education.map((edu, i) => (
                                  <div key={i} className="mb-2">
                                      <div className="font-bold">{edu.degree}</div>
                                      <div className="text-sm text-gray-600">{edu.institution} • {edu.year}</div>
                                      <div className="text-xs text-gray-500">Score: {edu.percentage}</div>
                                  </div>
                              ))}
                          </div>

                          {/* Preferences */}
                          <div>
                              <h4 className="text-lg font-bold text-gray-800 mb-4">Preferences</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded">
                                  <div><label className="text-xs text-gray-500">Preferred Role</label><div className="font-medium text-sm">{mockProfile.preferences.role}</div></div>
                                  <div><label className="text-xs text-gray-500">Job Type</label><div className="font-medium text-sm">{mockProfile.preferences.type}</div></div>
                                  <div><label className="text-xs text-gray-500">Expected Salary</label><div className="font-medium text-sm">{mockProfile.preferences.salary}</div></div>
                                  <div><label className="text-xs text-gray-500">Willing to Relocate</label><div className="font-medium text-sm">{mockProfile.preferences.relocate}</div></div>
                              </div>
                          </div>
                      </div>
                  </Card>
              )}
          </div>
      )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} userType={userType} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{activeTab.replace('-', ' ')}</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;