import React, { useState } from 'react';
import { UserType } from '../types';
import { AdminSidebar } from '../components/Layout';
import { Card, Button, Input, Select } from '../components/Shared';
import { store } from '../services/store';
import { draftBlogPost, generateEmailTemplate } from '../services/geminiService';

const Dashboard: React.FC<{ userType: UserType }> = ({ userType }) => {
  const [activeTab, setActiveTab] = useState('reports');
  const [blogTopic, setBlogTopic] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Email Marketing State
  const [emailJobTitle, setEmailJobTitle] = useState('');
  const [emailCandidate, setEmailCandidate] = useState('');
  const [emailContent, setEmailContent] = useState('');

  const handleBlogGen = async () => {
    setLoading(true);
    const text = await draftBlogPost(blogTopic);
    setGeneratedBlog(text);
    setLoading(false);
  };

  const handleEmailGen = async () => {
    setLoading(true);
    const text = await generateEmailTemplate(emailJobTitle, emailCandidate);
    setEmailContent(text);
    setLoading(false);
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
                    <Button variant="outline"><i className="fas fa-file-csv mr-2"></i> Candidate List</Button>
                    <Button variant="outline"><i className="fas fa-file-excel mr-2"></i> Job Postings</Button>
                    <Button variant="outline"><i className="fas fa-file-pdf mr-2"></i> Corporate List</Button>
                </div>
            </Card>
          </div>
        );
      case 'approvals':
        const approvals = store.getApprovals();
        return (
            <div className="space-y-4">
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
          <Card title="Post a New Job">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Job Title" />
              <Input label="Location" />
              <Select label="Category" options={['IT', 'Finance', 'Marketing']} />
              <Input label="Salary Range" />
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={4}></textarea>
              </div>
              <Button className="md:col-span-2">Submit for Approval</Button>
            </div>
          </Card>
        );
      case 'blog':
        return (
           <Card title="AI Blog Writer">
             <div className="space-y-4">
               <Input label="Topic / Title" value={blogTopic} onChange={(e) => setBlogTopic(e.target.value)} placeholder="e.g. Future of Remote Work" />
               <Button onClick={handleBlogGen} disabled={loading}>
                 {loading ? 'Writing...' : 'Draft with AI'}
               </Button>
               {generatedBlog && (
                 <div className="mt-6 p-4 bg-gray-50 border rounded-md">
                   <h4 className="font-bold mb-2">Draft Content:</h4>
                   <p className="whitespace-pre-wrap text-sm text-gray-700">{generatedBlog}</p>
                   <div className="mt-4 flex space-x-2">
                      <Button className="text-sm">Publish</Button>
                      <Button variant="outline" className="text-sm">Edit</Button>
                   </div>
                 </div>
               )}
             </div>
           </Card>
        );
      case 'email':
          return (
            <Card title="Email Marketing Assistant">
                <p className="text-sm text-gray-600 mb-4">Generate professional emails to notify companies about candidates.</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="Job Title" value={emailJobTitle} onChange={e => setEmailJobTitle(e.target.value)} />
                    <Input label="Candidate Name" value={emailCandidate} onChange={e => setEmailCandidate(e.target.value)} />
                </div>
                <Button onClick={handleEmailGen} disabled={loading}>{loading ? 'Generating...' : 'Generate Email Template'}</Button>
                
                {emailContent && (
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Generated Email</label>
                        <textarea className="w-full h-40 p-3 border rounded text-sm bg-gray-50" value={emailContent} readOnly></textarea>
                        <div className="mt-2">
                             <Button variant="secondary">Send to HR</Button>
                        </div>
                    </div>
                )}
            </Card>
          );
      default:
        return <div>Select an item from the sidebar.</div>;
    }
  };

  if (userType === UserType.CANDIDATE) {
      return (
          <div className="max-w-7xl mx-auto py-12 px-4">
              <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card title="Profile Status">
                      <div className="h-2 bg-gray-200 rounded-full mt-2">
                          <div className="h-2 bg-green-500 rounded-full w-3/4"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">80% Complete</p>
                      <Button variant="outline" className="mt-4 w-full text-xs">Update Profile</Button>
                  </Card>
                  <Card title="Applied Jobs">
                      <div className="text-3xl font-bold text-primary">5</div>
                      <p className="text-xs text-gray-500">Active applications</p>
                  </Card>
                  <Card title="Saved Jobs">
                      <div className="text-3xl font-bold text-accent">2</div>
                      <p className="text-xs text-gray-500">Bookmarks</p>
                  </Card>
              </div>
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