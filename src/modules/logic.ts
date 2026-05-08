import { StructuredRequest, LogicOutput } from '../types';

/**
 * Knowledge Base rules simulation
 */
const KB_RULES = [
  "Instructor(x) => Authorized(x, AI_Lab, Slots 1-4)",
  "Student(x) && Enrolled(x, AI_Lab_Support) => Eligible(x, AI_Lab)",
  "Staff(x) => Authorized(x, Maintenance, Any_Slot)",
  "UrgentRequest(x) => PriorityAccess(x)",
];

export function logicReason(request: StructuredRequest): LogicOutput {
  const { role, category, request_type } = request;
  
  let allowed = false;
  let explanation = "";

  // Mock reasoning engine logic
  if (role === 'instructor') {
    allowed = true;
    explanation = `${role} has administrative authorization for all lab resources.`;
  } else if (role === 'student') {
    if (category === 'AI_Lab_Support') {
      allowed = true;
      explanation = `Student is enrolled in AI Lab course and is eligible for support slots.`;
    } else if (category === 'Emergency_Help') {
      allowed = true;
      explanation = `Emergency requests are automatically granted temporary clearance.`;
    } else {
      allowed = false;
      explanation = `Student lacks specific authorization for the requested non-course category.`;
    }
  } else if (role === 'staff') {
    if (category === 'Maintenance' || category === 'Access') {
      allowed = true;
      explanation = `Staff role covers maintenance and campus access requests.`;
    } else {
      allowed = false;
      explanation = `Staff role is not authorized for academic support categories.`;
    }
  }

  return {
    allowed,
    entailed: allowed, // In this simple case, entailed matches allowed
    explanation
  };
}
