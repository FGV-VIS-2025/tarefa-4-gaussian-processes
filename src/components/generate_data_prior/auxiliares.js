import * as math from 'mathjs'; 
import { randomNormal, randomLcg } from 'd3-random';

// Funções de Kernel
export function kernel_Matern12(x, y = 0, lengthScale = 1.5) {
  return Math.exp(-Math.abs(x - y) / lengthScale);
}

export function kernel_Periodic(x, y = 0, period = 1.0, lengthScale = 1.0) {
  return Math.exp(-2 * Math.sin(Math.PI * Math.abs(x - y) / period) ** 2 / (lengthScale ** 2));
}

export function kernel_Polynomial(x, y = 0, constant = 0, degree = 3) {
  return Math.pow((x * y + constant), degree);
}

export function kernel_RBF(x, y = 0, lengthScale = 1.0) {
  return Math.exp(-0.5 * ((x - y) ** 2) / (lengthScale ** 2));
}

export function cholesky(A) {
    const n = A.length;
    const L = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        if (i === j) {
          L[i][j] = Math.sqrt(A[i][i] - sum);
        } else {
          L[i][j] = (A[i][j] - sum) / L[j][j];
        }
      }
    }
    return L;
  }

export function generateData(kernelFunction, start = -5, end = 5, step = 0.05) {
  const data = [];
  for (let x = start; x <= end; x += step) {
    data.push({ x, y: kernelFunction(x) });
  }
  return data;
}

export function sampleNormal(mean, cov, seed = -1) {
  /*
  Gera uma amostra de uma distribuição normal multivariada com média e matriz de covariância especificadas.
  */
  if (seed === -1) {
    seed = Math.random();
  }
  const n = mean.length;
  const L = cholesky(cov);
  const normal = randomNormal.source(randomLcg(seed))(0, 1);
  const z = Array.from({ length: n }, () => normal());
  const sample = math.multiply(L, z);
  return sample.map((val, i) => val + mean[i]);
}

export function generateGPSamples(kernelFunction, start = -5, end = 5, step = 0.1, seed = -1) {
  /*
  Gera amostras da GP a priori.
  */
  const xArray = [];
  for (let x = start; x <= end; x += step) {
      xArray.push(Number(x.toFixed(2))); 
  }

  // Matriz de covariância
  const K = [];
  for (let i = 0; i < xArray.length; i++) {
      K[i] = [];
      for (let j = 0; j < xArray.length; j++) {
          K[i][j] = kernelFunction(xArray[i], xArray[j]);
          if (i === j) K[i][j] += 1e-8;
      }
  }

  // Amostragem
  const mean = Array(xArray.length).fill(0);
  const sampledY = sampleNormal(mean, K, seed=seed);
  
  return { x: xArray, y: sampledY }; 
}

export function solveLowerTriangular(L, b) {
  const y = Array(b.length).fill(0);
  for (let i = 0; i < L.length; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) sum += L[i][j] * y[j];
      y[i] = (b[i] - sum) / L[i][i];
  }
  return y;
}

export function solveUpperTriangular(U, y) {
  const x = Array(y.length).fill(0);
  for (let i = y.length - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < y.length; j++) sum += U[i][j] * x[j];
      x[i] = (y[i] - sum) / U[i][i];
  }
  return x;
}

export function transposeMatrix(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

export function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
