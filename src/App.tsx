import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  MapPin, 
  BrainCircuit, 
  Cpu, 
  Table, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  RefreshCcw,
  Zap,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Navigation
} from 'lucide-react';
import { StructuredRequest, FinalResponse, RequestType, Role, Category } from './types';
import { CAMPUS_NODES } from './constants';
import { processPipeline } from './modules/router';

const STEPS = [
  { id: 'identity', title: 'Identity', fields: ['name', 'role'] },
  { id: 'request', title: 'Request Type', fields: ['request_type', 'category'] },
  { id: 'context', title: 'Location & Timing', fields: ['current_location', 'destination', 'preferred_slot'] },
  { id: 'priority', title: 'Urgency Factors', fields: ['severity', 'time_sensitivity', 'crowd_level'] },
  { id: 'review', title: 'Finalize & Run', fields: ['description_note', 'eligibility_claim'] },
];

const ROLES: Role[] = ['student', 'instructor', 'staff'];
const REQUEST_TYPES: RequestType[] = [
  'Navigation_Only',
  'Eligibility_Check',
  'Booking_or_Scheduling',
  'Urgent_Service_Request',
  'Full_Service_Request'
];
const CATEGORIES: Category[] = ['AI_Lab_Support', 'Viva', 'Access', 'Maintenance', 'Emergency_Help'];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FinalResponse | null>(null);
  
  const [formData, setFormData] = useState<Partial<StructuredRequest>>({
    request_id: `REQ-${Math.floor(Math.random() * 10000)}`,
    name: '',
    role: 'student',
    request_type: 'Navigation_Only',
    category: 'AI_Lab_Support',
    current_location: 'Main_Gate',
    destination: 'AI_Lab',
    preferred_slot: 1,
    severity: 5,
    time_sensitivity: 5,
    crowd_level: 5,
    eligibility_claim: true
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleRun = () => {
    setIsProcessing(true);
    // Simulate thinking delay
    setTimeout(() => {
      const response = processPipeline(formData);
      setResult(response);
      setIsProcessing(false);
    }, 1500);
  };

  const handleReset = () => {
    setResult(null);
    setCurrentStep(0);
  };

  const renderField = (field: string) => {
    switch (field) {
      case 'name':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ali"
            />
          </div>
        );
      case 'role':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Your Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.role === r ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 'request_type':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Request Type</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              value={formData.request_type}
              onChange={e => setFormData({ ...formData, request_type: e.target.value as RequestType })}
            >
              {REQUEST_TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        );
      case 'category':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Service Category</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        );
      case 'current_location':
      case 'destination':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{field === 'current_location' ? 'Current Location' : 'Target Destination'}</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              value={field === 'current_location' ? formData.current_location : formData.destination}
              onChange={e => setFormData({ ...formData, [field]: e.target.value })}
            >
              <option value="">-- Select Nodes --</option>
              {Object.keys(CAMPUS_NODES).map(nodeId => (
                <option key={nodeId} value={nodeId}>{nodeId.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        );
      case 'preferred_slot':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Preferred Slot (1-4)</label>
            <input 
              type="range" min="1" max="4" 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              value={formData.preferred_slot}
              onChange={e => setFormData({ ...formData, preferred_slot: parseInt(e.target.value) })}
            />
            <div className="text-center font-bold text-blue-600">Slot {formData.preferred_slot}</div>
          </div>
        );
      case 'severity':
      case 'time_sensitivity':
      case 'crowd_level':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{field.replace(/_/g, ' ').toUpperCase()} (1-10)</label>
            <div className="flex items-center gap-4">
               <input 
                type="range" min="1" max="10" 
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                value={formData[field as keyof StructuredRequest] as number}
                onChange={e => setFormData({ ...formData, [field]: parseInt(e.target.value) })}
              />
              <span className="w-8 text-center font-bold text-blue-600">{formData[field as keyof StructuredRequest] as number}</span>
            </div>
          </div>
        );
      case 'description_note':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Additional Notes</label>
            <textarea 
              className="w-full px-4 py-2 border rounded-lg h-24 outline-none resize-none"
              value={formData.description_note}
              onChange={e => setFormData({ ...formData, description_note: e.target.value })}
              placeholder="Explain your situation..."
            />
          </div>
        );
       case 'eligibility_claim':
        return (
          <div className="flex items-center gap-2 py-4">
             <input 
              type="checkbox" 
              id="eligibility"
              className="w-5 h-5 accent-blue-600"
              checked={formData.eligibility_claim}
              onChange={e => setFormData({ ...formData, eligibility_claim: e.target.checked })}
            />
            <label htmlFor="eligibility" className="text-sm font-medium text-slate-700">I claim eligibility for this service</label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[700px]">
        {/* Sidebar Status */}
        <div className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Smart Campus AI</h1>
            </div>
            <p className="text-xs text-slate-400">AL2002 Capstone Project</p>
          </div>

          <div className="flex-1 space-y-6">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-4 group">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${idx === currentStep ? 'bg-blue-600 text-white scale-110' : idx < currentStep ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-400'}
                `}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <span className={`text-sm font-medium ${idx === currentStep ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-4 tracking-widest">Active Request</div>
            <div className="p-4 bg-slate-800 rounded-xl">
              <div className="text-xs text-slate-400 mb-1">ID: {formData.request_id}</div>
              <div className="text-sm font-bold truncate">{formData.name || 'Untitled Participant'}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold">
                {formData.request_type?.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-8 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep].title}</h2>
                    <p className="text-sm text-slate-500">Please provide the details below to initialize the AI pipeline.</p>
                  </div>

                  <div className="space-y-6 flex-1">
                    {STEPS[currentStep].fields.map(field => (
                      <div key={field}>{renderField(field)}</div>
                    ))}
                  </div>

                  <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-6 py-2 flex items-center gap-2 text-slate-600 font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900"
                    >
                      <ChevronLeft size={18} /> Back
                    </button>

                    {currentStep === STEPS.length - 1 ? (
                      <button
                        onClick={handleRun}
                        disabled={!formData.name}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? <RefreshCcw className="animate-spin" size={20} /> : <Play size={20} />}
                        Run Intelligent Pipeline
                      </button>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                      >
                        Continue <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col"
                >
                  {/* Result Header */}
                  <div className={`p-6 rounded-2xl mb-6 flex items-center gap-6 ${result.decision === 'accepted' ? 'bg-green-50 text-green-900 border border-green-100' : 'bg-red-50 text-red-900 border border-red-100'}`}>
                    <div className={`p-4 rounded-xl ${result.decision === 'accepted' ? 'bg-green-500' : 'bg-red-500'} text-white shadow-xl shadow-current/20`}>
                      {result.decision === 'accepted' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Final Decision</div>
                      <h3 className="text-2xl font-black">{result.decision.toUpperCase()}</h3>
                      <p className="text-sm opacity-80 mt-1">{result.message}</p>
                    </div>
                  </div>

                  {/* Module Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {/* ANN Priority */}
                    {result.priority && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2 text-blue-600 mb-3">
                          <Zap size={18} />
                          <span className="text-xs font-bold uppercase tracking-tighter">ANN Module Output</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-slate-500 mb-1">Final Multiclass Priority</div>
                          <div className="text-lg font-bold text-slate-900 mb-4">{result.priority.final_priority.toUpperCase()}</div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${result.priority.confidence * 100}%` }} />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                             <span className="text-[10px] text-slate-400">Confidence Score</span>
                             <span className="text-[10px] font-bold text-blue-600">{(result.priority.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Logic KB */}
                    {result.eligibility && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2 text-indigo-600 mb-3">
                          <ShieldCheck size={18} />
                          <span className="text-xs font-bold uppercase tracking-tighter">Logic KB Module</span>
                        </div>
                        <div className="flex-1">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold mb-3 ${result.eligibility.allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {result.eligibility.allowed ? 'AUTHORIZED' : 'DENIED'}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                            "{result.eligibility.explanation}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CSP Scheduler */}
                    {result.assignment && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2 text-orange-600 mb-3">
                          <Clock size={18} />
                          <span className="text-xs font-bold uppercase tracking-tighter">CSP Scheduler</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                            <span className="text-xs text-slate-500">Assigned Room</span>
                            <span className="text-xs font-bold text-slate-800">{result.assignment.assigned_room}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                            <span className="text-xs text-slate-500">Time Slot</span>
                            <span className="text-xs font-bold text-slate-800">Slot {result.assignment.assigned_slot}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{result.assignment.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Search Navigation */}
                    {result.route && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                        <div className="flex items-center gap-2 text-teal-600 mb-3">
                          <Navigation size={18} />
                          <span className="text-xs font-bold uppercase tracking-tighter">Search & Navigation</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex flex-wrap gap-1 mb-4">
                            {result.route.path.map((node, i) => (
                              <div key={i} className="flex items-center">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${i === 0 ? 'bg-slate-900 text-white' : i === result.route!.path.length - 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                  {node.replace(/_/g, ' ')}
                                </span>
                                {i < result.route!.path.length - 1 && <ChevronRight size={12} className="mx-0.5 text-slate-400" />}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] bg-white p-2 rounded-lg">
                            <span className="text-slate-500">Algo: <b className="text-slate-900">{result.route.algorithm_used}</b></span>
                            <span className="text-slate-500">Distance: <b className="text-slate-900">{result.route.cost}m</b></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                    >
                      New Request
                    </button>
                    <button
                      className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                      onClick={() => {
                        if (result) {
                          const dataStr = JSON.stringify(result, null, 2);
                          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                          const exportFileDefaultName = `request-${result.request_id}.json`;
                          const linkElement = document.createElement('a');
                          linkElement.setAttribute('href', dataUri);
                          linkElement.setAttribute('download', exportFileDefaultName);
                          linkElement.click();
                        }
                      }}
                    >
                      Export JSON
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}

