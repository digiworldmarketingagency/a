import React, { useState } from 'react';
import { UserType } from '../types';
import { Button, Input, Select, Card } from '../components/Shared';
import { generateResumeContent } from '../services/geminiService';

interface RegistrationProps {
  type: UserType;
  onNavigate: (page: string) => void;
}

const Registration: React.FC<RegistrationProps> = ({ type, onNavigate }) => {
  // Steps
  // Candidate: 0:OTP, 1:Basic, 2:Edu/Exp, 3:Skills/Resume, 4:Preferences, 5:Review
  // Corporate: 0:Account, 1:Company, 2:Legal/Address, 3:Review
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState<any>({
    // Common
    name: '', firstName: '', middleName: '', lastName: '', 
    email: '', mobile: '', password: '', confirmPassword: '',
    address: '', state: '', city: '', pincode: '',
    gender: '', dob: '',
    linkedinUrl: '', // New field
    
    // Candidate
    currentlyWorking: 'No',
    currentJobTitle: '',
    currentJobRole: '',
    currentIndustry: '',

    readyToRelocate: 'No',
    education: [{ institution: '', degree: '', year: '', percentage: '', activities: '', achievements: '' }], 
    experience: [{ company: '', role: '', start: '', end: '', description: '' }],
    skills: '', languages: '',
    englishProficiency: '',
    preferredRoles: '', preferredIndustry: '', expectedSalary: '', jobType: 'Full Time',

    // Corporate
    companyName: '', contactPerson: '', industry: '', companySize: '', website: '', description: '',
    gst: '', cin: '', 
    agreeTerms: false
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Helper for arrays (Education/Experience)
  const handleArrayChange = (arrayName: string, index: number, field: string, value: string) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    handleChange(arrayName, newArray);
  };

  const addItem = (arrayName: string, itemTemplate: any) => {
    handleChange(arrayName, [...formData[arrayName], itemTemplate]);
  };

  const removeItem = (arrayName: string, index: number) => {
    const newArray = [...formData[arrayName]];
    newArray.splice(index, 1);
    handleChange(arrayName, newArray);
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
    const blob = new Blob([resumeText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const downloadName = formData.firstName ? `${formData.firstName}_${formData.lastName || ''}` : (formData.name || 'Candidate');
    a.download = `Resume_${downloadName}.doc`;
    a.click();
  };

  // --- Candidate Step Renders ---
  
  const renderCandidateSteps = () => {
    switch(step) {
      case 0: // OTP
         return (
             <div className="space-y-4">
                 <h3 className="text-xl font-bold text-primary">Mobile Verification</h3>
                 <p className="text-sm text-gray-500">We'll send a one-time password to verify your number.</p>
                 <Input label="Mobile Number" value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder="+91..." />
                 {!otpSent ? (
                     <Button className="w-full" onClick={sendOtp} disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</Button>
                 ) : (
                     <>
                        <Input label="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                        <Button className="w-full" onClick={verifyOtp}>Verify & Proceed</Button>
                        <button className="text-xs text-primary underline w-full text-center mt-2" onClick={() => setOtpSent(false)}>Resend OTP</button>
                     </>
                 )}
             </div>
         );
      case 1: // Basic & Location
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Basic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Name" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} placeholder="First Name" />
                <Input label="Middle Name" value={formData.middleName} onChange={e => handleChange('middleName', e.target.value)} placeholder="Middle Name" />
                <Input label="Last Name" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} placeholder="Last Name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select label="Gender" options={['Male', 'Female', 'Prefer not to say']} value={formData.gender} onChange={e => handleChange('gender', e.target.value)} />
                <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email Address" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                <Input label="LinkedIn Profile URL" placeholder="https://www.linkedin.com/in/..." value={formData.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Input label="Password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} />
                <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} />
            </div>
            
            <h4 className="font-bold text-gray-700 mt-2 border-t pt-2">Address</h4>
            <Input label="Street Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <Select label="State" options={['Maharashtra', 'Delhi', 'Karnataka', 'Telangana']} value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                <Select label="City" options={['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad']} value={formData.city} onChange={e => handleChange('city', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
                <Input label="Pin Code" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} />
                <div className="mb-4">
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={formData.readyToRelocate === 'Yes'} onChange={e => handleChange('readyToRelocate', e.target.checked ? 'Yes' : 'No')} />
                        <span className="text-sm font-medium text-gray-700">Willing to Relocate</span>
                     </label>
                </div>
            </div>

            <Button className="w-full" onClick={handleNext}>Next: Education & Exp</Button>
          </div>
        );
      case 2: // Education & Experience
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary">Professional Profile</h3>
            
            {/* Current Employment Status */}
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-700 mb-4">Current Employment Status</h4>
                <div className="mb-4">
                  <Select 
                    label="Currently working?" 
                    options={['Yes', 'No']} 
                    value={formData.currentlyWorking} 
                    onChange={e => handleChange('currentlyWorking', e.target.value)} 
                    containerClassName="mb-0 max-w-xs"
                  />
                </div>
                
                {formData.currentlyWorking === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                    <Input label="Job Title" placeholder="e.g. Senior Developer" value={formData.currentJobTitle} onChange={e => handleChange('currentJobTitle', e.target.value)} />
                    <Input label="Job Role" placeholder="e.g. Engineering" value={formData.currentJobRole} onChange={e => handleChange('currentJobRole', e.target.value)} />
                    <Select label="Industry" options={['IT / Technology', 'Banking & Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail']} value={formData.currentIndustry} onChange={e => handleChange('currentIndustry', e.target.value)} />
                  </div>
                )}
            </div>

            {/* Education Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Education</h4>
                </div>
                {formData.education.map((edu: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200 mb-3 relative">
                        {formData.education.length > 1 && (
                            <button onClick={() => removeItem('education', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                        )}
                        <Input label="Institution / University" value={edu.institution} onChange={e => handleArrayChange('education', index, 'institution', e.target.value)} className="mb-2" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <Select label="Degree" options={['High School', 'Diploma', 'B.Tech', 'B.Sc', 'B.Com', 'MBA', 'M.Tech', 'PhD']} value={edu.degree} onChange={e => handleArrayChange('education', index, 'degree', e.target.value)} className="mb-0" />
                            <Input label="Year of Passing (MM/YYYY)" placeholder="MM/YYYY" value={edu.year} onChange={e => handleArrayChange('education', index, 'year', e.target.value)} className="mb-0" />
                            <Input label="Percentage / CGPA" value={edu.percentage} onChange={e => handleArrayChange('education', index, 'percentage', e.target.value)} className="mb-0" />
                        </div>
                        <Input label="Extracurricular Activities" placeholder="Clubs, Sports, Volunteering..." value={edu.activities} onChange={e => handleArrayChange('education', index, 'activities', e.target.value)} className="mb-2" />
                        <Input label="Achievements" placeholder="Awards, Scholarships, Competitions..." value={edu.achievements} onChange={e => handleArrayChange('education', index, 'achievements', e.target.value)} className="mb-0" />
                    </div>
                ))}
                <Button variant="outline" onClick={() => addItem('education', { institution: '', degree: '', year: '', percentage: '', activities: '', achievements: '' })} className="text-sm w-full border-dashed"><i className="fas fa-plus mr-1"></i> Add Education</Button>
            </div>

            {/* Experience Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Previous Work Experience</h4>
                </div>
                {formData.experience.map((exp: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200 mb-3 relative">
                         <button onClick={() => removeItem('experience', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                         <Input label="Company Name" value={exp.company} onChange={e => handleArrayChange('experience', index, 'company', e.target.value)} className="mb-2" />
                         <Input label="Role / Designation" value={exp.role} onChange={e => handleArrayChange('experience', index, 'role', e.target.value)} className="mb-2" />
                         <div className="grid grid-cols-2 gap-4 mb-2">
                            <Input label="Start Date" type="date" value={exp.start} onChange={e => handleArrayChange('experience', index, 'start', e.target.value)} className="mb-0" />
                            <Input label="End Date" type="date" value={exp.end} onChange={e => handleArrayChange('experience', index, 'end', e.target.value)} className="mb-0" />
                         </div>
                    </div>
                ))}
                <Button variant="outline" onClick={() => addItem('experience', { company: '', role: '', start: '', end: '', description: '' })} className="text-sm w-full border-dashed"><i className="fas fa-plus mr-1"></i> Add Experience</Button>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Next: Skills</Button>
            </div>
          </div>
        );
      case 3: // Skills & Resume
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Skills & Documents</h3>
            
            <Input label="Key Skills (comma separated)" placeholder="e.g. Java, Python, React, Communication" value={formData.skills} onChange={e => handleChange('skills', e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Languages Known" placeholder="e.g. English, Hindi, Urdu" value={formData.languages} onChange={e => handleChange('languages', e.target.value)} containerClassName="mb-0" />
              <Select 
                label="English Proficiency" 
                options={['Native', 'Proficient', 'Advanced', 'Beginner']} 
                value={formData.englishProficiency} 
                onChange={e => handleChange('englishProficiency', e.target.value)} 
                containerClassName="mb-0"
              />
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors mt-4">
              <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
              <p className="text-sm text-gray-500">Upload Resume (PDF/DOCX)</p>
              <input type="file" className="hidden" id="resume-upload" />
              <label htmlFor="resume-upload" className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded shadow-sm cursor-pointer text-sm font-medium hover:bg-gray-50">Choose File</label>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <i className="fas fa-robot text-6xl text-blue-800"></i>
                </div>
                <h4 className="text-blue-800 font-bold text-sm mb-1">AI Resume Builder</h4>
                <p className="text-blue-600 text-xs mb-3">No resume? We can generate a professional one based on the details you've entered.</p>
                <Button variant="secondary" onClick={handleGenerateResume} disabled={loading} className="text-xs w-full">
                  {loading ? 'Generating...' : 'Generate Resume with AI'}
                </Button>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Next: Preferences</Button>
            </div>
          </div>
        );
      case 4: // Preferences
         return (
             <div className="space-y-4">
                 <h3 className="text-xl font-bold text-primary">Job Preferences</h3>
                 <p className="text-sm text-gray-500">Help us find the right jobs for you.</p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select 
                        label="Preferred Job Role" 
                        options={['Software Engineer', 'Data Analyst', 'Sales Manager', 'HR Executive', 'Marketing Manager', 'Accountant', 'Customer Support', 'Content Writer', 'Graphic Designer', 'Project Manager', 'Teacher/Educator']} 
                        value={formData.preferredRoles} 
                        onChange={e => handleChange('preferredRoles', e.target.value)} 
                    />
                    <Select label="Preferred Industry" options={['IT Services', 'Banking & Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing']} value={formData.preferredIndustry} onChange={e => handleChange('preferredIndustry', e.target.value)} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <Select label="Preferred Job Type" options={['Full Time', 'Part Time', 'Contract', 'Internship']} value={formData.jobType} onChange={e => handleChange('jobType', e.target.value)} />
                     <Input label="Expected Salary (LPA)" placeholder="e.g. 5.5" value={formData.expectedSalary} onChange={e => handleChange('expectedSalary', e.target.value)} />
                 </div>

                 <div className="flex space-x-4 mt-6">
                    <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                    <Button onClick={handleNext} className="flex-1">Review Profile</Button>
                 </div>
             </div>
         );
      case 5: // Review
         return (
             <div className="space-y-6">
                 <h3 className="text-xl font-bold text-primary">Review & Submit</h3>
                 <div className="bg-gray-50 p-4 rounded text-sm space-y-3 shadow-inner">
                     {/* Basic Info */}
                     <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-200">
                         <span className="text-gray-500">Name:</span>
                         <span className="col-span-2 font-medium text-gray-900">{[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')}</span>
                         
                         {formData.gender && (
                           <>
                             <span className="text-gray-500">Gender:</span>
                             <span className="col-span-2 font-medium">{formData.gender}</span>
                           </>
                         )}
                         {formData.dob && (
                           <>
                             <span className="text-gray-500">DOB:</span>
                             <span className="col-span-2 font-medium">{formData.dob}</span>
                           </>
                         )}

                         <span className="text-gray-500">Email:</span>
                         <span className="col-span-2 font-medium">{formData.email}</span>
                         <span className="text-gray-500">Phone:</span>
                         <span className="col-span-2 font-medium">{formData.mobile}</span>
                         <span className="text-gray-500">Location:</span>
                         <span className="col-span-2 font-medium">{formData.city}, {formData.state}</span>
                         
                         {formData.linkedinUrl && (
                            <>
                                <span className="text-gray-500">LinkedIn:</span>
                                <span className="col-span-2 font-medium text-blue-600 truncate">{formData.linkedinUrl}</span>
                            </>
                         )}
                         
                         <span className="text-gray-500">Relocate?</span>
                         <span className="col-span-2 font-medium">{formData.readyToRelocate}</span>
                     </div>

                     {/* Professional Status */}
                     <div className="py-2 border-b border-gray-200">
                         <div className="grid grid-cols-3 gap-2">
                             <span className="text-gray-500">Working?</span>
                             <span className="col-span-2 font-medium">{formData.currentlyWorking}</span>
                             
                             {formData.currentlyWorking === 'Yes' && (
                                <>
                                    <span className="text-gray-500">Current:</span>
                                    <span className="col-span-2 font-medium">{formData.currentJobTitle} ({formData.currentJobRole}) in {formData.currentIndustry}</span>
                                </>
                             )}
                         </div>
                     </div>

                     {/* Skills & Languages */}
                     <div className="py-2 border-b border-gray-200">
                         <h4 className="font-bold text-gray-700 mb-2">Skills & Languages</h4>
                         <div className="grid grid-cols-1 gap-2">
                             <div>
                                 <span className="text-gray-500 block text-xs">Skills:</span>
                                 <span className="font-medium">{formData.skills || 'N/A'}</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <span className="text-gray-500 block text-xs">Languages:</span>
                                     <span className="font-medium">{formData.languages || 'N/A'}</span>
                                 </div>
                                 <div>
                                     <span className="text-gray-500 block text-xs">English Prof:</span>
                                     <span className="font-medium">{formData.englishProficiency || 'N/A'}</span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Preferences */}
                     <div className="py-2 border-b border-gray-200">
                         <h4 className="font-bold text-gray-700 mb-2">Job Preferences</h4>
                         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                             <div>
                               <span className="text-gray-500 block text-xs">Preferred Role:</span>
                               <span className="font-medium">{formData.preferredRoles || 'Any'}</span>
                             </div>
                             <div>
                               <span className="text-gray-500 block text-xs">Industry:</span>
                               <span className="font-medium">{formData.preferredIndustry || 'Any'}</span>
                             </div>
                             <div>
                               <span className="text-gray-500 block text-xs">Job Type:</span>
                               <span className="font-medium">{formData.jobType || 'Full Time'}</span>
                             </div>
                             <div>
                               <span className="text-gray-500 block text-xs">Expected Salary:</span>
                               <span className="font-medium">{formData.expectedSalary ? `${formData.expectedSalary} LPA` : 'Not specified'}</span>
                             </div>
                         </div>
                     </div>

                     {/* Experience */}
                     <div className="py-2 border-b border-gray-200">
                         <h4 className="font-bold text-gray-700 mb-1">Experience</h4>
                         {formData.experience.filter((e: any) => e.company).length > 0 ? (
                             formData.experience.map((e: any, i: number) => (
                                 e.company && (
                                     <div key={i} className="mb-2 last:mb-0">
                                        <p className="text-gray-800 font-medium text-sm">{e.role} at {e.company}</p>
                                        <p className="text-gray-500 text-xs">
                                            {e.start || 'Start'} to {e.end || 'Present'}
                                        </p>
                                     </div>
                                 )
                             ))
                         ) : <p className="text-gray-400 text-xs italic">No experience details added.</p>}
                     </div>

                     {/* Education */}
                     <div className="pt-2">
                         <h4 className="font-bold text-gray-700 mb-1">Education</h4>
                         {formData.education.filter((e: any) => e.institution).length > 0 ? (
                             formData.education.map((e: any, i: number) => (
                                 e.institution && (
                                     <div key={i} className="mb-2 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <p className="text-gray-800 font-medium text-sm">{e.degree} from {e.institution}</p>
                                        <p className="text-gray-600 text-xs">Passed: {e.year} | Score: {e.percentage}</p>
                                        {(e.activities || e.achievements) && (
                                            <p className="text-gray-500 text-xs mt-1 truncate">
                                                {e.activities && `Act: ${e.activities} `} 
                                                {e.achievements && `| Ach: ${e.achievements}`}
                                            </p>
                                        )}
                                     </div>
                                 )
                             ))
                         ) : <p className="text-gray-400 text-xs italic">No education details added.</p>}
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-2">
                     <input type="checkbox" id="terms" className="h-4 w-4 text-primary border-gray-300 rounded" />
                     <label htmlFor="terms" className="text-sm text-gray-600">I agree to the Terms & Conditions and Privacy Policy of AMPOWERJOBS.com.</label>
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

  // --- Corporate Step Renders ---
  
  const renderCorporateSteps = () => {
      switch(step) {
          case 0: // Account Setup
             return (
                 <div className="space-y-4">
                     <h3 className="text-xl font-bold text-primary">Partner Account Setup</h3>
                     <Input label="Contact Person Name" value={formData.contactPerson} onChange={e => handleChange('contactPerson', e.target.value)} />
                     <Input label="Work Email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                     <Input label="Mobile Number" value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} />
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} />
                        <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} />
                     </div>
                     <Button className="w-full mt-4" onClick={handleNext}>Next: Company Details</Button>
                 </div>
             );
          case 1: // Company Details
             return (
                 <div className="space-y-4">
                     <h3 className="text-xl font-bold text-primary">Company Profile</h3>
                     <Input label="Company Name" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} />
                     <div className="grid grid-cols-2 gap-4">
                        <Select label="Industry" options={['IT / Technology', 'Manufacturing', 'Consulting', 'Education', 'Healthcare']} value={formData.industry} onChange={e => handleChange('industry', e.target.value)} />
                        <Select label="Company Size" options={['1-10', '11-50', '51-200', '201-500', '500+']} value={formData.companySize} onChange={e => handleChange('companySize', e.target.value)} />
                     </div>
                     <Input label="Website URL" value={formData.website} onChange={e => handleChange('website', e.target.value)} />
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                        <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} value={formData.description} onChange={e => handleChange('description', e.target.value)}></textarea>
                     </div>
                     
                     <div className="flex space-x-4 mt-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                        <Button onClick={handleNext} className="flex-1">Next: Legal Info</Button>
                     </div>
                 </div>
             );
          case 2: // Legal & Address
             return (
                 <div className="space-y-4">
                     <h3 className="text-xl font-bold text-primary">Legal & Location</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="GST Number" value={formData.gst} onChange={e => handleChange('gst', e.target.value)} />
                        <Input label="CIN / Registration No" value={formData.cin} onChange={e => handleChange('cin', e.target.value)} />
                     </div>
                     <h4 className="font-bold text-gray-700 mt-2">Registered Office Address</h4>
                     <Input label="Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
                     <div className="grid grid-cols-2 gap-4">
                        <Select label="State" options={['Maharashtra', 'Delhi', 'Karnataka']} value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                        <Select label="City" options={['Mumbai', 'Pune', 'Delhi', 'Bangalore']} value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                     </div>
                     <Input label="Pin Code" value={formData.pincode} onChange={e => handleChange('pincode', e.target.value)} />

                     <div className="flex space-x-4 mt-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                        <Button onClick={handleNext} className="flex-1">Next: Verification</Button>
                     </div>
                 </div>
             );
          case 3: // Review & Submit
             return (
                 <div className="space-y-6">
                     <h3 className="text-xl font-bold text-primary">Verification</h3>
                     
                     <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <p className="text-sm text-gray-500">Upload Company Logo</p>
                        <label className="mt-2 inline-block px-4 py-1 bg-gray-200 rounded cursor-pointer text-sm">Browse</label>
                     </div>

                     <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                         <strong>Note:</strong> Your account will be subject to approval by the admin. You will receive an email once approved.
                     </div>

                     <div className="flex items-start space-x-2">
                        <input type="checkbox" className="mt-1" checked={formData.agreeTerms} onChange={e => handleChange('agreeTerms', e.target.checked)} />
                        <span className="text-sm text-gray-600">I declare that the information provided is true and I agree to the Terms & Conditions of AMPOWERJOBS.com.</span>
                     </div>

                     <div className="flex space-x-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1">Back</Button>
                        <Button className="flex-1" onClick={handleSubmit}>Register Company</Button>
                     </div>
                 </div>
             );
          default: return null;
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-lg w-full space-y-8">
        <div className="text-center border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {type === UserType.CANDIDATE ? 'Candidate Registration' : 'Partner Registration'}
          </h2>
          {/* Progress Bar */}
          <div className="mt-4 flex justify-center space-x-2">
             {[...Array(type === UserType.CANDIDATE ? 6 : 4)].map((_, i) => (
                 <div key={i} className={`h-1 w-8 rounded ${i <= step ? 'bg-primary' : 'bg-gray-300'}`}></div>
             ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 uppercase tracking-wide">
             Step {step + 1} of {type === UserType.CANDIDATE ? 6 : 4}
          </p>
        </div>
        
        <div className="mt-6">
            {type === UserType.CANDIDATE ? renderCandidateSteps() : renderCorporateSteps()}
        </div>
      </Card>
    </div>
  );
};

export default Registration;