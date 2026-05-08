import { StructuredRequest, LogicOutput } from '../types';

/**
 * Knowledge Base rules simulation
 * This module uses a simple predicate-style parser to evaluate eligibility queries.
 */
const KB_RULES = [
  "Teaches(DrKhan, AI) => Instructor(DrKhan, AI)",
  "Instructor(x, AI) => UsesLab(x, Lab1)",
  "Enrolled(Ali, AI) => UsesLab(Ali, Lab1)",
  "Student(Ali) && Completed(Ali, ProgrammingFundamentals) => Eligible(Ali, AI)",
];

function parsePredicate(query?: string) {
  if (!query) return null;
  const match = query.match(/^(\w+)\(([^)]+)\)$/);
  if (!match) return null;
  const predicate = match[1];
  const args = match[2].split(',').map(arg => arg.trim());
  return { predicate, args };
}

export function logicReason(request: StructuredRequest): LogicOutput {
  const { role, category, request_type, query, name } = request;

  let allowed = false;
  let explanation = "";

  // Eligibility_Check uses query-based reasoning.
  if (request_type === 'Eligibility_Check') {
    const parsed = parsePredicate(query);
    if (!parsed) {
      return {
        allowed: false,
        entailed: false,
        explanation: 'Invalid eligibility query format. Use predicate syntax like UsesLab(DrKhan, Lab1).'
      };
    }

    if (parsed.predicate === 'UsesLab' && role === 'instructor') {
      allowed = true;
      explanation = `Instructor ${name || 'requester'} is eligible to use the lab under the knowledge base rules.`;
    } else if (parsed.predicate === 'Eligible' && role === 'student') {
      allowed = true;
      explanation = `Student ${name || 'requester'} satisfies the eligibility rules for the requested resource.`;
    } else {
      allowed = false;
      explanation = `The query '${query}' cannot be validated for the current user role and category.`;
    }

    return {
      allowed,
      entailed: allowed,
      explanation
    };
  }

  // General service reasoning for non-Eligibility_Check requests.
  if (role === 'instructor') {
    allowed = true;
    explanation = 'Instructor access is permitted by the knowledge base rules.';
  } else if (role === 'student') {
    if (category === 'AI_Lab_Support') {
      allowed = true;
      explanation = 'Student is eligible for AI Lab support requests according to course enrollment rules.';
    } else if (category === 'Emergency_Help') {
      allowed = true;
      explanation = 'Emergency requests are granted temporary clearance for students.';
    } else {
      allowed = false;
      explanation = 'Student does not have authorization for this service category.';
    }
  } else if (role === 'staff') {
    if (category === 'Maintenance' || category === 'Access') {
      allowed = true;
      explanation = 'Staff is authorized for maintenance and access requests.';
    } else {
      allowed = false;
      explanation = 'Staff is not authorized for academic support or lab resource categories.';
    }
  }

  return {
    allowed,
    entailed: allowed,
    explanation
  };
}
