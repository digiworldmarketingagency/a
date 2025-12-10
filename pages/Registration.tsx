import React, { useState } from 'react';
import { UserType } from '../types';
import { Button, Input, Select, Card } from '../components/Shared';
import { generateResumeContent } from '../services/geminiService';

interface RegistrationProps {
  type: UserType;
  onNavigate: (page: string) => void;
}

const Registration: React.FC<RegistrationProps> = ({ type, onNavigate }) => {
  const [step, setStep] = useState(type === UserType.CANDIDATE ? 0 : 1); // 0 is OTP step for candidate
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState<any>({
    // Candidate
    name: '', email: '', mobile: '', password: '', 
    state: '', city: '', pincode: '', readyToRelocate: 'No',
    education: [{ institution: '', degree: '', year: '' }], 
    experience: [{ company: '', role: '', start: '', end: '' }],
    skills: '', 
    // Corporate
    companyName: '', contactPerson: '', gst: '', cin: '', website: '',
    agreeTerms: false
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    handleChange('education', newEdu);
  };

  const addEducation = () => {
    handleChange('education', [...formData.education, { institution: '', degree: '', year: '' }]);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const sendOtp = () => {
    if (!formData.mobile) return alert("Enter Mobile Number");
    setLoading(true);
    setTimeout(() => { setLoading(false); setOtpSent(true); alert(`OTP Sent to ${formData.mobile}: 1234`); }, 1000);
  };

  const verifyOtp = () => {
    if (otp === '1234') {
        setStep(1);
    } else {
        alert("Invalid OTP");
    }
  };

  const handleSubmit = async () => {
    if (type === UserType.CORPORATE && !formData.agreeTerms) return alert("Please agree to T&C");
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Registration Successful! Please login.');
      onNavigate(type === UserType.CANDIDATE ? 'login-candidate' : 'login-corporate');
    }, 1500);
  };

  const handleGenerateResume = async () => {
    setLoading(true);
    const resumeText = await generateResumeContent(formData);
    setLoading(false);
    // Create a blob and download
    const blob = new Blob([resumeText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${formData.name || 'Candidate'}.doc`;
    a.click();
  };

  const renderCandidateForm = () => {
    switch(step) {
      case 0: // OTP
         return (
             <div className="space-y-4">
                 <h3 className="text-xl font-bold text-primary">Mobile Verification</h3>
                 <Input label="Mobile Number" value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder="+91..." />
                 {!otpSent ? (
                     <Button className="w-full" onClick={sendOtp} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</Button>
                 ) : (
                     <>
                        <Input label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                        <Button className="w-full" onClick={verifyOtp}>Verify & Proceed</Button>
                     </>
                 )}
             </div>
         );
      case 1: // Basic & Location
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Basic Details</h3>
            <Input label="Full Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
            <Input label="Email Address" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
            <Input label="Set Password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} />
            
            <h4 className="font-bold text-gray-700 mt-4">Location</h4>
            <div className="grid grid-cols-2 gap-4">
                <Select label="State" options={['Maharashtra', 'Delhi', 'Karnataka']} value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                <Select label="City" options={['Mumbai', 'Pune', 'Delhi', 'Bangalore']} value={formData.city} onChange={e => handleChange('city', e.target.value)} />
            </div>
            <Input label="Pin Code" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} />
            <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-gray-700">Ready to relocate?</span>
                <input type="checkbox" checked={formData.readyToRelocate === 'Yes'} onChange={e => handleChange('readyToRelocate', e.target.checked ? 'Yes' : 'No')} />
            </div>

            <Button className="w-full" onClick={handleNext}>Next: Education</Button>
          </div>
        );
      case 2: // Education & Experience
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Education & Experience</h3>
            
            {formData.education.map((edu: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                    <h4 className="font-medium text-sm mb-2 text-primary">Education #{index + 1}</h4>
                    <Input label="Institution" value={edu.institution} onChange={e => handleEducationChange(index, 'institution', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <Select label="Degree" options={['B.Tech', 'B.Sc', 'MBA', 'B.Com']} value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} />
                        <Input label="Year" value={edu.year} onChange={e => handleEducationChange(index, 'year', e.target.value)} />
                    </div>
                </div>
            ))}
            <button className="text-sm text-primary hover:underline" onClick={addEducation}>+ Add Another Education</button>

            <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-4">
                <h4 className="font-medium text-sm mb-2 text-accent">Latest Experience</h4>
                <Input label="Company" placeholder="Last company name" />
                <Input label="Role" placeholder="Job Title" />
                <div className="grid grid-cols-2 gap-2">
                   <Input label="Start Date" type="date" />
                   <Input label="End Date" type="date" />
                </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Next: Skills</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Skills & Resume</h3>
            <Input label="Skills (comma separated)" placeholder="React, Node, Excel..." value={formData.skills} onChange={e => handleChange('skills', e.target.value)} />
            <Select label="English Proficiency" options={['Basic', 'Intermediate', 'Fluent', 'Native']} />
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-500">Upload Resume (PDF/DOCX)</p>
              <input type="file" className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="mt-2 inline-block px-4 py-1 bg-gray-200 rounded cursor-pointer text-sm">Browse</label>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="text-blue-800 font-bold text-sm mb-1">AI Resume Generator</h4>
                <p className="text-blue-600 text-xs mb-3">Don't have a resume? Let AI build one from your profile data.</p>
                <Button variant="secondary" onClick={handleGenerateResume} disabled={loading} className="text-xs w-full">
                  {loading ? 'Generating...' : 'Generate & Download Resume'}
                </Button>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Submitting...' : 'Complete Registration'}
              </Button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderCorporateForm = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-primary">Partner Registration</h3>
      <Input label="Company Name" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} />
      <Input label="Contact Person" value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} />
      <Input label="Official Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
      <div className="grid grid-cols-2 gap-4">
         <Input label="GST Number" value={formData.gst} onChange={e => handleChange('gst', e.target.value)} />
         <Input label="CIN" value={formData.cin} onChange={e => handleChange('cin', e.target.value)} />
      </div>
      <Input label="Website" value={formData.website} onChange={e => handleChange('website', e.target.value)} />
      
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
          <p className="text-sm text-gray-500">Upload Company Logo</p>
          <label className="mt-2 inline-block px-4 py-1 bg-gray-200 rounded cursor-pointer text-sm">Browse</label>
      </div>

      <div className="flex items-start space-x-2 mt-4">
         <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={e => handleChange('agreeTerms', e.target.checked)} />
         <span className="text-xs text-gray-600">I declare that the information provided is true and I agree to the Terms & Conditions of AMP JobConnect.</span>
      </div>

      <Button className="w-full" onClick={handleSubmit}>Register Company</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {type === UserType.CANDIDATE ? 'Candidate Registration' : 'Corporate Partner'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
             {type === UserType.CANDIDATE && step > 0 ? `Step ${step} of 3` : 'Join the network'}
          </p>
        </div>
        {type === UserType.CANDIDATE ? renderCandidateForm() : renderCorporateForm()}
      </Card>
    </div>
  );
};

export default Registration;