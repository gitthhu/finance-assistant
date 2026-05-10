// 技术指标计算模块
// 纯TypeScript实现，无需依赖外部库

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MACDResult {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}

export interface RSIResult {
  date: string;
  rsi: number;
}

export interface KDJResult {
  date: string;
  k: number;
  d: number;
  j: number;
}

export interface BollingerBandsResult {
  date: string;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * 计算移动平均线 (MA)
 */
export function calculateMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
}

/**
 * 计算指数移动平均线 (EMA)
 */
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    
    if (i === period - 1) {
      // 第一个EMA值 = SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
      continue;
    }
    
    // EMA = (Close - EMA_prev) * multiplier + EMA_prev
    const prevEMA = result[result.length - 1] as number;
    const ema = (data[i] - prevEMA) * multiplier + prevEMA;
    result.push(ema);
  }
  
  return result;
}

/**
 * 计算MACD指标
 * 默认参数：fast=12, slow=26, signal=9
 */
export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult[] {
  const closes = data.map(d => d.close);
  
  // 计算快线和慢线
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);
  
  // 计算MACD线 = 快线 - 慢线
  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i]! - slowEMA[i]!);
    }
  }
  
  // 计算信号线 (MACD的EMA)
  const validMacd = macdLine.filter((v): v is number => v !== null);
  const signalEMA = calculateEMA(validMacd, signalPeriod);
  
  // 组装结果
  const result: MACDResult[] = [];
  let signalIndex = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === null || signalEMA[signalIndex] === null) {
      if (macdLine[i] !== null) {
        // MACD有值但signal还没有
        result.push({
          date: data[i].date,
          macd: parseFloat(macdLine[i]!.toFixed(4)),
          signal: 0,
          histogram: parseFloat(macdLine[i]!.toFixed(4)),
        });
      } else {
        result.push({
          date: data[i].date,
          macd: 0,
          signal: 0,
          histogram: 0,
        });
      }
    } else {
      const macd = macdLine[i]!;
      const signal = signalEMA[signalIndex]!;
      result.push({
        date: data[i].date,
        macd: parseFloat(macd.toFixed(4)),
        signal: parseFloat(signal.toFixed(4)),
        histogram: parseFloat((macd - signal).toFixed(4)),
      });
      signalIndex++;
    }
  }
  
  return result;
}

/**
 * 计算RSI指标
 * 默认参数：period=14
 */
export function calculateRSI(data: OHLCV[], period: number = 14): RSIResult[] {
  const result: RSIResult[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push({ date: data[i].date, rsi: 50 }); // 默认值
      continue;
    }
    
    // 计算价格变化
    const changes: number[] = [];
    for (let j = 0; j < period; j++) {
      changes.push(data[i - j].close - data[i - j - 1].close);
    }
    
    // 计算平均涨幅和跌幅
    let avgGain = 0;
    let avgLoss = 0;
    
    changes.forEach(change => {
      if (change > 0) {
        avgGain += change;
      } else {
        avgLoss += Math.abs(change);
      }
    });
    
    avgGain /= period;
    avgLoss /= period;
    
    // 计算RS和RSI
    const rs = avgGain / (avgLoss || 1); // 避免除以0
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      date: data[i].date,
      rsi: parseFloat(rsi.toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 计算KDJ指标
 * 默认参数：n=9, m1=3, m2=3
 */
export function calculateKDJ(
  data: OHLCV[],
  n: number = 9,
  m1: number = 3,
  m2: number = 3
): KDJResult[] {
  const result: KDJResult[] = [];
  let k = 50; // K值初始值
  let d = 50; // D值初始值
  
  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) {
      result.push({ date: data[i].date, k: 50, d: 50, j: 50 });
      continue;
    }
    
    // 计算n日内最高价和最低价
    let highest = data[i].high;
    let lowest = data[i].low;
    
    for (let j = 0; j < n; j++) {
      const idx = i - j;
      if (data[idx].high > highest) highest = data[idx].high;
      if (data[idx].low < lowest) lowest = data[idx].low;
    }
    
    // 计算RSV
    const rsv = lowest === highest 
      ? 50 
      : ((data[i].close - lowest) / (highest - lowest)) * 100;
    
    // 计算K、D、J值
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
    const j = 3 * k - 2 * d;
    
    result.push({
      date: data[i].date,
      k: parseFloat(k.toFixed(2)),
      d: parseFloat(d.toFixed(2)),
      j: parseFloat(j.toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 计算布林带 (Bollinger Bands)
 * 默认参数：period=20, multiplier=2
 */
export function calculateBollingerBands(
  data: OHLCV[],
  period: number = 20,
  multiplier: number = 2
): BollingerBandsResult[] {
  const result: BollingerBandsResult[] = [];
  const closes = data.map(d => d.close);
  const ma = calculateMA(closes, period);
  
  for (let i = 0; i < data.length; i++) {
    if (ma[i] === null) {
      result.push({
        date: data[i].date,
        upper: data[i].close,
        middle: data[i].close,
        lower: data[i].close,
      });
      continue;
    }
    
    // 计算标准差
    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      const diff = closes[i - j] - ma[i]!;
      sumSquaredDiff += diff * diff;
    }
    const stdDev = Math.sqrt(sumSquaredDiff / period);
    
    result.push({
      date: data[i].date,
      upper: parseFloat((ma[i]! + multiplier * stdDev).toFixed(2)),
      middle: parseFloat(ma[i]!.toFixed(2)),
      lower: parseFloat((ma[i]! - multiplier * stdDev).toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 生成买卖建议
 * 基于MACD、KDJ、RSI指标
 */
export function generateSignal(
  macd: MACDResult[],
  rsi: RSIResult[],
  kdj: KDJResult[]
): '买入' | '卖出' | '持有' {
  if (macd.length === 0 || rsi.length === 0 || kdj.length === 0) {
    return '持有';
  }
  
  const lastMACD = macd[macd.length - 1];
  const lastRSI = rsi[rsi.length - 1];
  const lastKDJ = kdj[kdj.length - 1];
  
  let buyScore = 0;
  let sellScore = 0;
  
  // MACD信号
  if (lastMACD.macd > lastMACD.signal) {
    buyScore++;
  } else {
    sellScore++;
  }
  
  // RSI信号
  if (lastRSI.rsi < 30) {
    buyScore += 2; // 超卖
  } else if (lastRSI.rsi > 70) {
    sellScore += 2; // 超买
  }
  
  // KDJ信号
  if (lastKDJ.k < 20 && lastKDJ.j < 0) {
    buyScore += 2; // 超卖
  } else if (lastKDJ.k > 80 && lastKDJ.j > 100) {
    sellScore += 2; // 超买
  }
  
  if (buyScore > sellScore) return '买入';
  if (sellScore > buyScore) return '卖出';
  return '持有';
}
