/**
 * Search Module
 * NOTE: Only operational algorithms (BFS, UCS, A*) are implemented for runtime use.
 * Academic comparison algorithms (DFS, DLS, IDS, Bidirectional BFS, Greedy, RBFS)
 * were intentionally excluded from deployment to focus on practical pathfinding.
 * For academic evaluation, these would be implemented separately for comparison studies.
 */
import { CAMPUS_NODES, CAMPUS_EDGES } from '../constants';
import { SearchOutput } from '../types';

/**
 * Calculates straight-line distance between two nodes for A* heuristic
 */
function getHeuristic(currentId: string, targetId: string): number {
  const current = CAMPUS_NODES[currentId];
  const target = CAMPUS_NODES[targetId];
  if (!current || !target) return 0;
  
  const [x1, y1] = current.coords;
  const [x2, y2] = target.coords;
  
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Breadth-First Search for unweighted graphs
 */
export function bfs(start: string, goal: string): SearchOutput {
  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    
    if (current === goal) {
      return {
        algorithm_used: 'BFS',
        path,
        cost: path.length - 1,
        steps: path.length - 1
      };
    }

    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = CAMPUS_EDGES.filter(e => e.from === current).map(e => e.to);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push([neighbor, [...path, neighbor]]);
        }
      }
    }
  }

  throw new Error(`No route found from ${start} to ${goal} using BFS`);
}

/**
 * Uniform Cost Search (fallback for weighted graphs without heuristics)
 */
export function ucs(start: string, goal: string): SearchOutput {
  const priorityQueue: { node: string; path: string[]; cost: number }[] = [
    { node: start, path: [start], cost: 0 }
  ];
  const visited = new Map<string, number>();

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.cost - b.cost);
    const { node, path, cost } = priorityQueue.shift()!;

    if (node === goal) {
      return {
        algorithm_used: 'UCS',
        path,
        cost,
        steps: path.length - 1
      };
    }

    if (!visited.has(node) || visited.get(node)! > cost) {
      visited.set(node, cost);
      const outgoingEdges = CAMPUS_EDGES.filter(e => e.from === node);
      for (const edge of outgoingEdges) {
        priorityQueue.push({
          node: edge.to,
          path: [...path, edge.to],
          cost: cost + edge.weight
        });
      }
    }
  }

  throw new Error(`No route found from ${start} to ${goal} using UCS`);
}

/**
 * A* Search for weighted graphs with heuristics
 */
export function aStar(start: string, goal: string): SearchOutput {
  const priorityQueue: { node: string; path: string[]; g: number; f: number }[] = [
    { node: start, path: [start], g: 0, f: getHeuristic(start, goal) }
  ];
  const visited = new Map<string, number>();

  while (priorityQueue.length > 0) {
    priorityQueue.sort((a, b) => a.f - b.f);
    const { node, path, g } = priorityQueue.shift()!;

    if (node === goal) {
      return {
        algorithm_used: 'A*',
        path,
        cost: g,
        steps: path.length - 1
      };
    }

    if (!visited.has(node) || visited.get(node)! > g) {
      visited.set(node, g);
      const outgoingEdges = CAMPUS_EDGES.filter(e => e.from === node);
      for (const edge of outgoingEdges) {
        const nextG = g + edge.weight;
        const nextF = nextG + getHeuristic(edge.to, goal);
        priorityQueue.push({
          node: edge.to,
          path: [...path, edge.to],
          g: nextG,
          f: nextF
        });
      }
    }
  }

  throw new Error(`No route found from ${start} to ${goal} using A*`);
}

export function computeRoute(start: string, goal: string, graphType: 'weighted' | 'unweighted' = 'weighted'): SearchOutput {
  if (graphType === 'unweighted') {
    return bfs(start, goal);
  } else {
    try {
      return aStar(start, goal);
    } catch {
      return ucs(start, goal);
    }
  }
}
