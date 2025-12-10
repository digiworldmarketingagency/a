import React, { useState } from 'react';
import { UserType, Job, Blog, EmailTemplate, SuccessStory, Event, GalleryItem } from '../types';
import { AdminSidebar } from '../components/Layout';
import { Card, Button, Input, Select, Modal } from '../components/Shared';
import { store } from '../services/store';
import { draftBlogPost, generateEmailTemplate } from '../services/geminiService';

const Dashboard: React.FC<{ userType: UserType }> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [candidateTab, setCandidateTab] = useState('overview');
  const [blogTopic, setBlogTopic] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email Marketing State
  const [emailJobTitle, setEmailJobTitle] = useState('');
  const [emailCandidate, setEmailCandidate] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>(store.getEmailTemplates());

  // Success Stories State
  const [storyForm, setStoryForm] = useState({ id: '', name: '', role: '', comment: '', imageUrl: 'https://i.pravatar.cc/150' });
  const [stories, setStories] = useState<SuccessStory[]>(store.getSuccessStories());
  const [isEditingStory, setIsEditingStory] = useState(false);

  // Gallery State
  const [galleryForm, setGalleryForm] = useState({ title: '', url: '', type: 'image' });
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(store.getGallery());

  // Events State
  const [eventForm, setEventForm] = useState({ title: '', date: '', location: '', description: '', imageUrl: 'https://picsum.photos/400/200' });

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
    // Destructure status from jobForm to avoid conflict with Job.status which expects 'OPEN' | 'CLOSED'
    const { status: formStatus, ...restJobForm } = jobForm;

    // Create new Job object
    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title: jobForm.title,
      company: 'My Company', // Dynamic in real app
      location: jobForm.location,
      category: jobForm.category,
      description: jobForm.description,
      postedDate: new Date().toISOString().split('T')[0],
      status: 'OPEN',
      approvalStatus: formStatus as any,
      ...restJobForm
    };

    store.addJob(newJob);
    
    // Add to approvals if waiting
    if (formStatus === 'Waiting for Approval') {
      store.approvals.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'JOB',
        name: jobForm.title,
        details: `Posted by My Company. Status: ${formStatus}`,
        date: new Date().toISOString().split('T')[0],
        status: 'PENDING'
      });
    }

    setIsPreviewOpen(false);
    alert(`Job Published! Status: ${formStatus}. Check 'Approvals' tab.`);
    // Reset form or redirect
    setActiveTab('approvals');
  };

  // Mock Candidate Profile for Dashboard view (since registration data isn't persisted)
  const mockProfile = {
      name: "John Doe",
      email: "john.doe@example.com",
      mobile: "+91 98765 43210",
      location: "Mumbai, Maharashtra",
      linkedin: "https://linkedin.com/in/johndoe",
      skills: "React, TypeScript, Node.js, Tailwind CSS",
      languages: "English (Native), Hindi (Proficient)",
      experience: [
          { role: "Senior Developer", company: "Tech Corp", duration: "2021 - Present" },
          { role: "Junior Developer", company: "StartUp Inc", duration: "2019 - 2021" }
      ],
      education: [
          { degree: "B.Tech Computer Science", institution: "IIT Bombay", year: "2019", percentage: "8.5 CGPA" }
      ],
      preferences: {
          role: "Software Engineer",
          type: "Full Time",
          industry: "IT Services",
          salary: "15-20 LPA",
          relocate: "Yes"
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
    alert('Blog Posted Successfully! It is now live on the Home page.');
    setGeneratedBlog('');
    setBlogTopic('');
  };

  const refreshTemplates = () => setTemplates([...store.getEmailTemplates()]);

  const handleEmailGen = async () => {
    setLoading(true);
    const text = await generateEmailTemplate(emailJobTitle, emailCandidate);
    setEmailBody(text);
    if (!emailSubject) setEmailSubject(`Update regarding ${emailJobTitle} position`);
    setLoading(false);
  };

  const handleLoadTemplate = (t: EmailTemplate) => {
    setEmailSubject(t.subject);
    setEmailBody(t.body);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
        store.deleteEmailTemplate(id);
        refreshTemplates();
    }
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName) return alert("Please enter a name for the template");
    if (!emailSubject || !emailBody) return alert("Subject and Body are required to save a template");
    
    const success = store.addEmailTemplate({
        id: Math.random().toString(36).substr(2, 9),
        name: newTemplateName,
        subject: emailSubject,
        body: emailBody
    });

    if (success) {
        alert("Template saved successfully!");
        setNewTemplateName('');
        refreshTemplates();
    } else {
        alert("Limit Reached: You can only store up to 10 templates. Please delete some old ones.");
    }
  };

  const handleSendEmail = () => {
    if (!emailTo || !emailSubject || !emailBody) return alert("Please fill in To, Subject, and Body fields.");
    
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
        setLoading(false);
        alert(`Email Sent Successfully!\n\nFrom: connect@ampowerjobs.com\nTo: ${emailTo}\nSubject: ${emailSubject}`);
        // Reset fields
        setEmailTo('');
        setEmailSubject('');
        setEmailBody('');
    }, 1500);
  };

  const handleAddStory = () => {
      if (!storyForm.name || !storyForm.role || !storyForm.comment) return alert("Please fill all fields.");
      
      if (isEditingStory) {
          store.updateSuccessStory({
              id: storyForm.id,
              name: storyForm.name,
              role: storyForm.role,
              comment: storyForm.comment,
              imageUrl: storyForm.imageUrl
          });
          setIsEditingStory(false);
      } else {
          store.addSuccessStory({
              id: Math.random().toString(36).substr(2, 9),
              ...storyForm
          });
      }
      
      setStories([...store.getSuccessStories()]);
      setStoryForm({ id: '', name: '', role: '', comment: '', imageUrl: 'https://i.pravatar.cc/150' });
      alert(isEditingStory ? "Story Updated!" : "Success Story Added!");
  };

  const handleEditStory = (story: SuccessStory) => {
      setStoryForm(story);
      setIsEditingStory(true);
  };

  const handleDeleteStory = (id: string) => {
      if(confirm("Delete this story?")) {
        store.deleteSuccessStory(id);
        setStories([...store.getSuccessStories()]);
      }
  };

  const handleAddEvent = () => {
      if (!eventForm.title || !eventForm.date || !eventForm.location) return alert("Please fill all required fields.");
      store.addEvent({
          id: Math.random().toString(36).substr(2, 9),
          ...eventForm
      });
      alert("Event Created Successfully!");
      setEventForm({ title: '', date: '', location: '', description: '', imageUrl: 'https://picsum.photos/400/200' });
  };

  const handleAddGalleryItem = () => {
      if (!galleryForm.title || !galleryForm.url) return alert("Please fill title and URL.");
      store.addGalleryItem({
          id: Math.random().toString(36).substr(2, 9),
          title: galleryForm.title,
          url: galleryForm.url,
          type: galleryForm.type as 'image' | 'video'
      });
      setGalleryItems([...store.getGallery()]);
      setGalleryForm({ title: '', url: '', type: 'image' });
      alert("Added to Gallery!");
  };

  const handleDeleteGalleryItem = (id: string) => {
      if(confirm("Delete this item?")) {
          store.deleteGalleryItem(id);
          setGalleryItems([...store.getGallery()]);
      }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <div className="text-2xl font-bold text-primary">1,245</div>
                    <div className="text-xs text-gray-500">Candidates</div>
                </Card>
                <Card>
                    <div className="text-2xl font-bold text-accent">85</div>
                    <div className="text-xs text-gray-500">Active Jobs</div>
                </Card>
                <Card>
                    <div className="text-2xl font-bold text-blue-600">42</div>
                    <div className="text-xs text-gray-500">Pending Approvals</div>
                </Card>
                <Card>
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-xs text-gray-500">Events</div>
                </Card>
            </div>
            
            <Card title="Download Reports">
                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => alert("Downloading Candidate List.xlsx...")}>
                        <i className="fas fa-file-excel mr-2 text-green-600"></i> Candidate List (XLSX)
                    </Button>
                    <Button variant="outline" onClick={() => alert("Downloading Job Postings.xlsx...")}>
                        <i className="fas fa-file-excel mr-2 text-green-600"></i> Job Postings (XLSX)
                    </Button>
                    <Button variant="outline" onClick={() => alert("Downloading Corporate List.pdf...")}>
                        <i className="fas fa-file-pdf mr-2 text-red-600"></i> Corporate List (PDF)
                    </Button>
                    <Button variant="outline" onClick={() => alert("Downloading Events List.xlsx...")}>
                        <i className="fas fa-file-excel mr-2 text-green-600"></i> Events List (XLSX)
                    </Button>
                </div>
            </Card>
          </div>
        );
      case 'approvals':
        const approvals = store.getApprovals();
        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Jobs must be approved here before they appear on the main Job Board.</p>
                {approvals.map(req => (
                    <div key={req.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded text-white ${req.type === 'CORPORATE' ? 'bg-indigo-500' : 'bg-teal-500'}`}>{req.type}</span>
                                <span className="font-bold">{req.name}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{req.details}</p>
                            <p className="text-xs text-gray-400">{req.date}</p>
                        </div>
                        <div className="flex space-x-2">
                            {req.status === 'PENDING' ? (
                                <>
                                    <Button className="bg-green-600 hover:bg-green-700 text-xs">Approve</Button>
                                    <Button className="bg-red-500 hover:bg-red-600 text-xs">Reject</Button>
                                </>
                            ) : (
                                <span className="text-sm font-bold text-gray-500">{req.status}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
      case 'master':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['City Master', 'State Master', 'Job Title Master', 'Pin Code Master'].map((m, i) => (
                    <Card key={i} title={m}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Last updated: 10 Oct 2023</span>
                            <Button variant="outline" className="text-xs">Upload CSV</Button>
                        </div>
                    </Card>
                ))}
            </div>
        );
      case 'post-job':
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
                 <Input label="Job Expiry Date" type="date" value={jobForm.expiryDate} onChange={e => handleJobChange('expiryDate', e.target.value)} />
                 <Select label="Status" options={['Waiting for Approval', 'Approved', 'Rejected']} value={jobForm.status} onChange={e => handleJobChange('status', e.target.value)} />
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
                          You can track the status of your posting in the 'Approvals' or 'Active Jobs' section.
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
      case 'email':
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
      case 'success-stories':
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title={isEditingStory ? "Edit Success Story" : "Add Success Story"}>
                      <div className="space-y-4">
                          <Input label="Name" value={storyForm.name} onChange={e => setStoryForm({...storyForm, name: e.target.value})} />
                          <Input label="Role" value={storyForm.role} onChange={e => setStoryForm({...storyForm, role: e.target.value})} placeholder="e.g. Software Engineer @ Google" />
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} value={storyForm.comment} onChange={e => setStoryForm({...storyForm, comment: e.target.value})}></textarea>
                          </div>
                          <Input label="Image URL" value={storyForm.imageUrl} onChange={e => setStoryForm({...storyForm, imageUrl: e.target.value})} />
                          <div className="flex gap-2">
                             <Button onClick={handleAddStory}>{isEditingStory ? "Update Story" : "Add Story"}</Button>
                             {isEditingStory && <Button variant="outline" onClick={() => {setIsEditingStory(false); setStoryForm({ id: '', name: '', role: '', comment: '', imageUrl: 'https://i.pravatar.cc/150' })}}>Cancel</Button>}
                          </div>
                      </div>
                  </Card>
                  
                  <div className="space-y-4">
                      {stories.map(s => (
                          <div key={s.id} className="bg-white p-4 rounded shadow flex items-start space-x-4 relative group">
                               <img src={s.imageUrl} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                               <div className="flex-1">
                                   <div className="font-bold">{s.name}</div>
                                   <div className="text-xs text-gray-500 mb-1">{s.role}</div>
                                   <p className="text-sm text-gray-600 italic">"{s.comment}"</p>
                               </div>
                               <div className="flex flex-col space-y-1">
                                 <button onClick={() => handleEditStory(s)} className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
                                 <button onClick={() => handleDeleteStory(s.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                               </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      case 'gallery':
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Add to Gallery">
                      <div className="space-y-4">
                          <Input label="Title" value={galleryForm.title} onChange={e => setGalleryForm({...galleryForm, title: e.target.value})} />
                          <Input label="Image/Video URL" value={galleryForm.url} onChange={e => setGalleryForm({...galleryForm, url: e.target.value})} />
                          <Select label="Type" options={['image', 'video']} value={galleryForm.type} onChange={e => setGalleryForm({...galleryForm, type: e.target.value})} />
                          <Button onClick={handleAddGalleryItem}>Add to Gallery</Button>
                      </div>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-4">
                      {galleryItems.map(item => (
                          <div key={item.id} className="relative group bg-gray-100 rounded overflow-hidden aspect-video">
                              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button onClick={() => handleDeleteGalleryItem(item.id)} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Delete</button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
                                  {item.title}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );
      case 'manage-events':
          return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="Create New Event">
                      <div className="space-y-4">
                          <Input label="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                          <Input label="Date" type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                          <Input label="Location" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} />
                          <Input label="Image URL" value={eventForm.imageUrl} onChange={e => setEventForm({...eventForm, imageUrl: e.target.value})} />
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})}></textarea>
                          </div>
                          <Button onClick={handleAddEvent}>Create Event</Button>
                      </div>
                  </Card>
                  
                  <Card title="Existing Events">
                    <div className="space-y-4">
                         {store.getEvents().map(e => (
                             <div key={e.id} className="p-3 border-b border-gray-100 last:border-0">
                                 <div className="font-bold">{e.title}</div>
                                 <div className="text-xs text-gray-500">{e.date} • {e.location}</div>
                             </div>
                         ))}
                    </div>
                  </Card>
              </div>
          );
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
                          <div className="text-3xl font-bold text-accent">2</div>
                          <p className="text-xs text-gray-500">Bookmarks</p>
                          <Button variant="outline" className="mt-4 w-full text-xs">View Saved</Button>
                      </Card>
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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{activeTab.replace('-', ' ')}</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;