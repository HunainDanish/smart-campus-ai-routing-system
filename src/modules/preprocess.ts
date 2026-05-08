import { StructuredRequest } from '../types';
import { CAMPUS_NODES, CAMPUS_EDGES } from '../constants';

/**
 * Calculates shortest path distance between two nodes
 */
function calculateGraphDistance(start: string, goal: string): number {
  if (start === goal) return 0;
  
  const queue: [string, number][] = [[start, 0]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [current, dist] = queue.shift()!;
    
    if (current === goal) return dist;
    
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = CAMPUS_EDGES.filter(e => e.from === current).map(e => ({ to: e.to, weight: e.weight }));
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.to)) {
          queue.push([neighbor.to, dist + neighbor.weight]);
        }
      }
    }
  }
  
  return Infinity; // No path found
}

/**
 * Validates and normalizes request data
 */
export function preprocessRequest(formData: any): StructuredRequest {
  // Validation
  if (!formData.name || formData.name.trim() === '') {
    throw new Error('Name is required');
  }

  if (!formData.role || !['student', 'instructor', 'staff'].includes(formData.role)) {
    throw new Error('Invalid role');
  }

  if (!formData.request_type || !['Navigation_Only', 'Eligibility_Check', 'Booking_or_Scheduling', 'Urgent_Service_Request', 'Full_Service_Request'].includes(formData.request_type)) {
    throw new Error('Invalid request type');
  }

  if (formData.current_location && !CAMPUS_NODES[formData.current_location]) {
    throw new Error('Invalid current location');
  }

  if (formData.destination && !CAMPUS_NODES[formData.destination]) {
    throw new Error('Invalid destination');
  }

  if (formData.preferred_slot && (formData.preferred_slot < 1 || formData.preferred_slot > 4)) {
    throw new Error('Invalid preferred slot (must be 1-4)');
  }

  if (formData.severity && (formData.severity < 1 || formData.severity > 10)) {
    throw new Error('Invalid severity (must be 1-10)');
  }

  if (formData.time_sensitivity && (formData.time_sensitivity < 1 || formData.time_sensitivity > 10)) {
    throw new Error('Invalid time sensitivity (must be 1-10)');
  }

  if (formData.crowd_level && (formData.crowd_level < 1 || formData.crowd_level > 10)) {
    throw new Error('Invalid crowd level (must be 1-10)');
  }

  // Normalization
  const normalized: StructuredRequest = {
    request_id: formData.request_id || `REQ-${Math.floor(Math.random() * 10000)}`,
    name: formData.name.trim(),
    role: formData.role,
    request_type: formData.request_type,
    category: formData.category,
    current_location: formData.current_location || 'Main_Gate',
    destination: formData.destination,
    preferred_slot: formData.preferred_slot || 1,
    severity: formData.severity || 5,
    time_sensitivity: formData.time_sensitivity || 5,
    crowd_level: formData.crowd_level || 5,
    distance: formData.distance || (formData.current_location && formData.destination ? calculateGraphDistance(formData.current_location, formData.destination) : 5),
    group_id: formData.group_id,
    query: formData.query,
    description_note: formData.description_note,
    eligibility_claim: formData.eligibility_claim ?? false
  };

  return normalized;
}