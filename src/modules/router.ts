import { StructuredRequest, RouterOutput, FinalResponse } from '../types';
import { preprocessRequest } from './preprocess';
import { mlpPredict } from './ann';
import { logicReason } from './logic';
import { cspSchedule } from './csp';
import { computeRoute } from './search';

export function routeRequest(request: StructuredRequest): RouterOutput {
  const { request_type, route_guidance_requested } = request;
  
  const output: RouterOutput = {
    request_id: request.request_id,
    selected_pipeline: [],
    needs_ann: false,
    needs_logic: false,
    needs_csp: false,
    needs_search: false
  };

  switch (request_type) {
    case 'Navigation_Only':
      output.selected_pipeline = route_guidance_requested ? ['Search'] : [];
      output.needs_search = !!route_guidance_requested;
      break;
    case 'Eligibility_Check':
      output.selected_pipeline = ['Logic_KB'];
      output.needs_logic = true;
      break;
    case 'Booking_or_Scheduling':
      output.selected_pipeline = ['Logic_KB', 'CSP'];
      output.needs_logic = true;
      output.needs_csp = true;
      if (route_guidance_requested) {
        output.selected_pipeline.push('Search');
        output.needs_search = true;
      }
      break;
    case 'Urgent_Service_Request':
    case 'Full_Service_Request':
      output.selected_pipeline = ['ANN', 'Logic_KB', 'CSP'];
      output.needs_ann = true;
      output.needs_logic = true;
      output.needs_csp = true;
      if (route_guidance_requested) {
        output.selected_pipeline.push('Search');
        output.needs_search = true;
      }
      break;
  }

  return output;
}

export function processPipeline(formData: any): FinalResponse {
  try {
    const request = preprocessRequest(formData);
    const router = routeRequest(request);
    const response: FinalResponse = {
      request_id: request.request_id,
      decision: 'pending',
      message: ""
    };

    // 1. ANN Module
    if (router.needs_ann) {
      response.priority = mlpPredict(request);
    }

    // 2. Logic / KB Module
    if (router.needs_logic) {
      const logicRes = logicReason(request);
      response.eligibility = logicRes;
      
      if (!logicRes.allowed) {
        response.decision = 'rejected';
        response.message = `Request rejected by Logic Module: ${logicRes.explanation}`;
        return response;
      }
    }

    // 3. CSP Module
    if (router.needs_csp) {
      const cspRes = cspSchedule(request);
      response.assignment = cspRes;
      response.decision = cspRes.decision;
      
      if (cspRes.decision === 'rejected') {
        response.message = `Request rejected by CSP Module: ${cspRes.notes}`;
        return response;
      }
      
      // Update destination if assigned by CSP
      if (cspRes.destination) {
        request.destination = cspRes.destination;
      }
    }

    // 4. Search Module
    if (router.needs_search) {
      const start = request.current_location || "Main_Gate";
      const goal = request.destination;
      
      if (goal && start !== goal) {
        try {
          response.route = computeRoute(start, goal);
        } catch (e) {
          response.decision = 'rejected';
          response.message += " Error computing route: " + (e as Error).message;
        }
      }
    }

    // Final Response Construction
    if (response.decision === 'pending') response.decision = 'accepted';
    
    let msg = `Request ${request.request_id} processed successfully. `;
    if (response.priority) msg += `Urgency: ${response.priority.final_priority}. `;
    if (response.assignment) msg += `Assigned to ${response.assignment.assigned_room} at slot ${response.assignment.assigned_slot}. `;
    if (response.route) msg += `Route calculated with ${response.route.steps} steps.`;
    
    response.message = msg;

    return response;
  } catch (error) {
    return {
      request_id: formData.request_id || 'unknown',
      decision: 'rejected',
      message: `Preprocessing failed: ${(error as Error).message}`
    };
  }
}
