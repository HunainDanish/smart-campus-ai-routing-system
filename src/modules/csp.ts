import { StructuredRequest, CSPOutput } from '../types';

/**
 * Mock CSP Scheduler
 * NOTE: This is a simulation for demo purposes. A real CSP solver would use:
 * - Backtracking algorithm
 * - AC-3 constraint propagation
 * - Domain reduction techniques
 * - Variable and value ordering heuristics
 */
export function cspSchedule(request: StructuredRequest): CSPOutput {
  const { preferred_slot, category, severity } = request;
  
  // Simulated room domains
  const ROOMS = ["AI_Lab_01", "AI_Lab_02", "Smart_Classroom", "Maintenance_Office"];
  
  // Simulate constraints: high severity requests might conflict
  const hasConflict = severity && severity > 8 ? Math.random() > 0.5 : Math.random() > 0.7;
  
  if (hasConflict) {
    return {
      decision: 'rejected',
      notes: `No available slots for high-priority request. All rooms are fully booked.`
    };
  }
  
  // Random availability simulation
  const isSlotAvailable = Math.random() > 0.3; // 70% chance available
  
  if (!isSlotAvailable) {
    // Conflict-free assignment: find next slot
    const nextSlot = ((preferred_slot ?? 1) % 4) + 1;
    return {
      decision: 'accepted',
      assigned_room: category === 'AI_Lab_Support' ? ROOMS[0] : ROOMS[2],
      assigned_slot: nextSlot,
      destination: category === 'AI_Lab_Support' ? 'AI_Lab' : 'Student_Services',
      notes: `Preferred slot ${preferred_slot} was unavailable. Allocated next available slot ${nextSlot}.`
    };
  }

  return {
    decision: 'accepted',
    assigned_room: category === 'AI_Lab_Support' ? ROOMS[0] : ROOMS[2],
    assigned_slot: preferred_slot ?? 1,
    destination: category === 'AI_Lab_Support' ? 'AI_Lab' : 'Student_Services',
    notes: "Assigned requested slot successfully."
  };
}
