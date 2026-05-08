import { CampusNode, Edge, Role, RequestType, Category } from './types';

export const CAMPUS_NODES: Record<string, CampusNode> = {
  Main_Gate: { id: 'Main_Gate', coords: [0, 4] },
  Bus_Stop: { id: 'Bus_Stop', coords: [0, 1] },
  Medical_Center: { id: 'Medical_Center', coords: [1, 1] },
  Parking: { id: 'Parking', coords: [2, 4] },
  Hostel: { id: 'Hostel', coords: [2, 0] },
  Admin_Block: { id: 'Admin_Block', coords: [3, 5] },
  Cafeteria: { id: 'Cafeteria', coords: [4, 1] },
  Library: { id: 'Library', coords: [6, 2] },
  Science_Block: { id: 'Science_Block', coords: [7, 1] },
  Student_Services: { id: 'Student_Services', coords: [6, 5] },
  Exam_Hall: { id: 'Exam_Hall', coords: [8, 5] },
  Seminar_Room: { id: 'Seminar_Room', coords: [10, 4] },
  AI_Lab: { id: 'AI_Lab', coords: [9, 2] },
};

export const CAMPUS_EDGES: Edge[] = [
  // One-way edges (will be made bidirectional below)
  { from: 'Main_Gate', to: 'Parking', weight: 2 },
  { from: 'Main_Gate', to: 'Bus_Stop', weight: 1 },
  { from: 'Parking', to: 'Admin_Block', weight: 4 },
  { from: 'Parking', to: 'Hostel', weight: 5 },
  { from: 'Parking', to: 'Medical_Center', weight: 2 },
  { from: 'Bus_Stop', to: 'Medical_Center', weight: 2 },
  { from: 'Medical_Center', to: 'Hostel', weight: 2 },
  { from: 'Hostel', to: 'Cafeteria', weight: 2 },
  { from: 'Hostel', to: 'Science_Block', weight: 3 },
  { from: 'Admin_Block', to: 'Student_Services', weight: 1 },
  { from: 'Admin_Block', to: 'Cafeteria', weight: 3 },
  { from: 'Student_Services', to: 'Exam_Hall', weight: 2 },
  { from: 'Student_Services', to: 'Library', weight: 2 },
  { from: 'Exam_Hall', to: 'Seminar_Room', weight: 1 },
  { from: 'Exam_Hall', to: 'Library', weight: 3 },
  { from: 'Library', to: 'Science_Block', weight: 3 },
  { from: 'Library', to: 'AI_Lab', weight: 3 },
  { from: 'Seminar_Room', to: 'AI_Lab', weight: 2 },
  { from: 'Science_Block', to: 'AI_Lab', weight: 1 },
  { from: 'Science_Block', to: 'Cafeteria', weight: 3 },
];

// Add bidirectional edges for campus walk graph
CAMPUS_EDGES.push(
  ...CAMPUS_EDGES.map(edge => ({ from: edge.to, to: edge.from, weight: edge.weight }))
);

export const ROLE_ENCODING: Record<Role, number> = {
  student: 0,
  instructor: 1,
  staff: 2,
};

export const CATEGORY_ENCODING: Record<Category, number> = {
  AI_Lab_Support: 0,
  Viva: 1,
  Access: 2,
  Maintenance: 3,
  Emergency_Help: 4,
};

export const REQUEST_TYPE_ENCODING: Record<RequestType, number> = {
  Navigation_Only: 0,
  Eligibility_Check: 1,
  Booking_or_Scheduling: 2,
  Urgent_Service_Request: 3,
  Full_Service_Request: 4,
};

export const FEATURE_ORDER = [
  'Role',
  'RequestType',
  'Severity',
  'TimeSensitivity',
  'CrowdLevel',
  'Distance',
  'Eligibility'
];
