import React, { useState } from 'react';
import { Card, Button, Input } from '../components/Shared';
import { generateInterviewTips } from '../services/geminiService';

const Resources: React.FC = () => {
  const [role, setRole] = useState('');
  const [tips, setTips] = useState('');
  const [loading, setLoading] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  const handleGetTips = async () => {
    if (!role) return;
    setLoading(true);
    const result = await generateInterviewTips(role);
    setTips(result);
    setLoading(false);
  };

  const handleGenerateMeet = () => {
    // In a real app, this would call Google Calendar API
    const uniqueId = Math.random().toString(36).substring(7);
    setMeetLink(`https://meet.google.com/abc-${uniqueId}-xyz`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Resource Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card title="A) Resume Builder" className="bg-gradient-to-br from-white to-teal-50 border-t-4 border-primary">
          <p className="text-gray-600 mb-4 text-sm">Create a professional, ATS-friendly resume in minutes using our AI-powered tool.</p>
          <ul className="list-disc list-inside text-xs text-gray-500 mb-6">
             <li>Auto-formatting</li>
             <li>AI content suggestions</li>
             <li>Export to DOCX/PDF</li>
          </ul>
          <Button onClick={() => window.location.href='/register-candidate'}>Go to Profile Builder</Button>
        </Card>

        <Card title="B) Interview Prep" className="bg-gradient-to-br from-white to-orange-50 border-t-4 border-accent">
          <p className="text-gray-600 mb-4 text-sm">Get tailored interview questions and tips for your specific job role.</p>
          <div className="flex flex-col space-y-2">
            <Input 
              placeholder="Enter Job Role (e.g. Java Dev)" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              className="mb-0"
            />
            <Button onClick={handleGetTips} disabled={loading} className="w-full">
                {loading ? 'Asking AI...' : 'Get Tips'}
            </Button>
          </div>
          {tips && (
            <div className="mt-4 p-4 bg-white rounded shadow text-xs text-gray-700 whitespace-pre-wrap h-40 overflow-y-auto">
                {tips}
            </div>
          )}
        </Card>

        <Card title="C) Schedule Interview" className="bg-gradient-to-br from-white to-blue-50 border-t-4 border-blue-500">
           <p className="text-gray-600 mb-4 text-sm">Organize virtual interviews seamlessly with Google Meet integration.</p>
           <div className="text-center py-4">
              <i className="fas fa-video text-4xl text-blue-500 mb-4"></i>
              {!meetLink ? (
                <Button onClick={handleGenerateMeet} variant="outline" className="w-full">Generate Meet Link</Button>
              ) : (
                <div className="bg-white p-3 rounded border border-blue-200">
                  <p className="text-xs text-gray-500 mb-1">Meeting Link:</p>
                  <a href={meetLink} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm break-all hover:underline">{meetLink}</a>
                  <Button onClick={() => navigator.clipboard.writeText(meetLink)} className="mt-2 text-xs w-full">Copy Link</Button>
                </div>
              )}
           </div>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Video Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => (
             <div key={i} className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center relative group cursor-pointer overflow-hidden">
                <img src={`https://picsum.photos/400/225?random=${i+20}`} alt="Video Thumbnail" className="rounded-lg object-cover w-full h-full group-hover:scale-105 transition-transform"/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/80 rounded-full p-4 group-hover:bg-white transition-colors">
                        <i className="fas fa-play text-primary text-xl"></i>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-sm font-medium rounded-b-lg">
                    Interview Body Language Part {i}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;