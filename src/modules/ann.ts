import { ROLE_ENCODING, REQUEST_TYPE_ENCODING } from '../constants';
import { StructuredRequest, ANNOutput } from '../types';

/**
 * Sigmoid activation function
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Normalizes input vector [0-1]
 */
function normalizeVector(vec: number[]): number[] {
  // Simple normalization for our categorical/ordinal inputs
  // Role: 0-2 -> role/2
  // RequestType: 0-4 -> type/4
  // Severity: 1-10 -> sev/10
  // TimeSense: 1-10 -> time/10
  // Crowd: 1-10 -> crowd/10
  // Distance: 0-10 -> dist/10
  // Eligibility: 0-1 -> val
  return [
    vec[0] / 2,
    vec[1] / 4,
    vec[2] / 10,
    vec[3] / 10,
    vec[4] / 10,
    vec[5] / 10,
    vec[6]
  ];
}

/**
 * Perceptron: Binary Baseline Model
 * Predicts: urgent (1) vs not_urgent (0)
 */
export function perceptronPredict(request: StructuredRequest): 'urgent' | 'not_urgent' {
  const roleVal = ROLE_ENCODING[request.role] ?? 0;
  const typeVal = REQUEST_TYPE_ENCODING[request.request_type] ?? 0;
  const x = normalizeVector([
    roleVal,
    typeVal,
    request.severity ?? 5,
    request.time_sensitivity ?? 5,
    request.crowd_level ?? 5,
    request.distance ?? 5,
    request.eligibility_claim ? 1 : 0
  ]);

  // Hardcoded weights for demonstration (favoring severity and time sensitivity)
  const weights = [0.1, 0.2, 2.5, 2.5, 0.5, 0.2, 0.8];
  const bias = -2.5;

  const sum = x.reduce((acc, val, i) => acc + val * weights[i], 0) + bias;
  const output = sigmoid(sum);

  return output >= 0.5 ? 'urgent' : 'not_urgent';
}

/**
 * MLP: Final Multiclass Operational Model
 * NOTE: This is manually weighted logic for demo purposes. A real ANN would:
 * - Use TensorFlow/PyTorch for training
 * - Have actual neural network layers with learnable weights
 * - Be trained on labeled datasets
 * - Use backpropagation for optimization
 */
export function mlpPredict(request: StructuredRequest): ANNOutput {
  const roleVal = ROLE_ENCODING[request.role] ?? 0;
  const typeVal = REQUEST_TYPE_ENCODING[request.request_type] ?? 0;
  const x = normalizeVector([
    roleVal,
    typeVal,
    request.severity ?? 5,
    request.time_sensitivity ?? 5,
    request.crowd_level ?? 5,
    request.distance ?? 5,
    request.eligibility_claim ? 1 : 0
  ]);

  // Simulated Multilayer Perceptron Logic
  // In a real project, this would be matrix multiplication of trained weights.
  // Here we use a weighted logic to simulate the classes:
  
  const score = (
    x[0] * 0.1 + // Role
    x[1] * 0.2 + // Type
    x[2] * 0.4 + // Severity (Highest weight)
    x[3] * 0.4 + // TimeSensitivity (Highest weight)
    x[4] * 0.1 + // Crowd
    x[5] * 0.1 + // Distance
    x[6] * 0.2   // Eligibility
  );

  let finalPriority: 'low' | 'normal' | 'high' | 'urgent';
  let confidence: number;

  if (score > 0.85) {
    finalPriority = 'urgent';
    confidence = 0.8 + Math.random() * 0.15;
  } else if (score > 0.6) {
    finalPriority = 'high';
    confidence = 0.7 + Math.random() * 0.2;
  } else if (score > 0.3) {
    finalPriority = 'normal';
    confidence = 0.6 + Math.random() * 0.3;
  } else {
    finalPriority = 'low';
    confidence = 0.5 + Math.random() * 0.4;
  }

  return {
    binary_priority: perceptronPredict(request),
    final_priority: finalPriority,
    confidence: Number(confidence.toFixed(2))
  };
}
