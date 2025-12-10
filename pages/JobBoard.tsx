import React, { useState } from 'react';
import { store } from '../services/store';
import { Card, Button, Input, Select, Modal } from '../components/Shared';

const JobBoard: React.FC = () => {
  const [jobs] = useState(store.getJobs());
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = (id: string) => {
    setSelectedJob(id);
    setIsApplying(true);
  };

  const confirmApply = () => {
    alert("Application Submitted successfully!");
    setIsApplying(false);
    setSelectedJob(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
         <h1 className="text-3xl font-bold text-gray-800">Job Openings</h1>
         <div className="flex space-x-2 mt-4 md:mt-0">
            <Input placeholder="Search..." className="mb-0 w-64" />
            <Button variant="secondary">Search</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1 space-y-6">
           <Card title="Filters">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                 <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2"/> Full Time</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2"/> Part Time</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2"/> Remote</label>
                 </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <Select options={['0-1 Years', '1-3 Years', '3-5 Years', '5+ Years']} />
               </div>
               <Button variant="outline" className="w-full text-xs">Reset Filters</Button>
             </div>
           </Card>
        </div>

        {/* Listings */}
        <div className="md:col-span-3 space-y-4">
           {jobs.map(job => (
             <Card key={job.id} className="hover:shadow-md transition-shadow">
               <div className="flex items-start space-x-4">
                 <div className="flex-shrink-0">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-16 h-16 object-contain rounded-md border border-gray-100 p-1" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200">
                        <i className="fas fa-building text-2xl"></i>
                      </div>
                    )}
                 </div>
                 <div className="flex-grow">
                   <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                        <p className="font-medium text-gray-700">{job.company}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                            <span><i className="fas fa-map-marker-alt mr-1"></i> {job.location}</span>
                            <span><i className="fas fa-clock mr-1"></i> Posted: {job.postedDate}</span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{job.category}</span>
                        </div>
                      </div>
                      <Button onClick={() => handleApply(job.id)}>Apply Now</Button>
                   </div>
                   <p className="mt-4 text-gray-600 text-sm line-clamp-2">{job.description}</p>
                 </div>
               </div>
             </Card>
           ))}
        </div>
      </div>

      <Modal isOpen={isApplying} onClose={() => setIsApplying(false)} title="Apply for Job">
         <p className="mb-4 text-gray-600">You are applying for the position at <span className="font-bold">Tech Corp</span>.</p>
         <div className="space-y-4">
            <Input label="Your Name" defaultValue="John Doe" />
            <Input label="Email" defaultValue="john@example.com" />
            <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm flex justify-between items-center">
               <span>Resume_John_Doe.pdf</span>
               <button className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <Button className="w-full" onClick={confirmApply}>Confirm Application</Button>
         </div>
      </Modal>
    </div>
  );
};

export default JobBoard;