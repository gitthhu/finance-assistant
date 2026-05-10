// 高级技术指标计算模块
// 包含更多专业指标

import { OHLCV } from "./technical-indicators";

/**
 * 计算威廉指标 (Williams %R)
 * 参数：period = 14
 * 范围：-100 到 0
 * 解读：低于 -80 超卖，高于 -20 超买
 */
export function calculateWilliamsR(
  data: OHLCV[],
  period: number = 14
): { date: string; wr: number }[] {
  const result: { date: string; wr: number }[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ date: data[i].date, wr: -50 });
      continue;
    }
    
    // 找到n日内最高价和最低价
    let highest = data[i].high;
    let lowest = data[i].low;
    
    for (let j = 0; j < period; j++) {
      const idx = i - j;
      if (data[idx].high > highest) highest = data[idx].high;
      if (data[idx].low < lowest) lowest = data[idx].low;
    }
    
    // 计算WR
    const wr = highest === lowest 
      ? -50 
      : ((highest - data[i].close) / (highest - lowest)) * -100;
    
    result.push({
      date: data[i].date,
      wr: parseFloat(wr.toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 计算CCI (Commodity Channel Index)
 * 参数：period = 20
 * 解读：高于 +100 超买，低于 -100 超卖
 */
export function calculateCCI(
  data: OHLCV[],
  period: number = 20
): { date: string; cci: number }[] {
  const result: { date: string; cci: number }[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push({ date: data[i].date, cci: 0 });
      continue;
    }
    
    // 计算典型价格 TP = (High + Low + Close) / 3
    const tp: number[] = [];
    for (let j = 0; j < period; j++) {
      const idx = i - period + 1 + j;
      tp.push((data[idx].high + data[idx].low + data[idx].close) / 3);
    }
    
    // 计算TP的SMA
    const tpMA = tp.reduce((sum, val) => sum + val, 0) / period;
    
    // 计算平均绝对偏差
    const meanDeviation = tp.reduce((sum, val) => sum + Math.abs(val - tpMA), 0) / period;
    
    // 计算CCI
    const cci = meanDeviation === 0 ? 0 : (tp[tp.length - 1] - tpMA) / (0.015 * meanDeviation);
    
    result.push({
      date: data[i].date,
      cci: parseFloat(cci.toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 计算ATR (Average True Range)
 * 衡量波动性
 */
export function calculateATR(
  data: OHLCV[],
  period: number = 14
): { date: string; atr: number }[] {
  const result: { date: string; atr: number }[] = [];
  const trs: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      trs.push(data[i].high - data[i].low);
      result.push({ date: data[i].date, atr: data[i].high - data[i].low });
      continue;
    }
    
    // 计算真实波幅 TR
    const tr = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i - 1].close),
      Math.abs(data[i].low - data[i - 1].close)
    );
    
    trs.push(tr);
    
    if (i < period) {
      // 使用简单平均
      const atr = trs.reduce((sum, val) => sum + val, 0) / trs.length;
      result.push({ date: data[i].date, atr: parseFloat(atr.toFixed(2)) });
    } else {
      // 使用指数移动平均
      const prevATR = result[result.length - 1].atr;
      const atr = (prevATR * (period - 1) + tr) / period;
      result.push({ date: data[i].date, atr: parseFloat(atr.toFixed(2)) });
    }
  }
  
  return result;
}

/**
 * 计算OBV (On-Balance Volume)
 * 累积能量线，结合价格与成交量
 */
export function calculateOBV(
  data: OHLCV[]
): { date: string; obv: number }[] {
  const result: { date: string; obv: number }[] = [];
  let obv = 0;
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push({ date: data[i].date, obv: 0 });
      continue;
    }
    
    if (data[i].close > data[i - 1].close) {
      obv += data[i].volume;
    } else if (data[i].close < data[i - 1].close) {
      obv -= data[i].volume;
    }
    // 如果收盘价相等，OBV不变
    
    result.push({ date: data[i].date, obv });
  }
  
  return result;
}

/**
 * 计算ADX (Average Directional Index)
 * 衡量趋势强度，不包含趋势方向
 * 参数：period = 14
 * 解读：ADX > 25 表示强趋势，ADX < 20 表示弱趋势
 */
export function calculateADX(
  data: OHLCV[],
  period: number = 14
): { date: string; adx: number; plusDI: number; minusDI: number }[] {
  const result: { date: string; adx: number; plusDI: number; minusDI: number }[] = [];
  
  if (data.length < period + 1) {
    return data.map(d => ({ date: d.date, adx: 0, plusDI: 0, minusDI: 0 }));
  }
  
  // 计算+DM, -DM, TR
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const upMove = data[i].high - data[i - 1].high;
    const downMove = data[i - 1].low - data[i].low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    
    tr.push(
      Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      )
    );
  }
  
  // 计算平滑值（简化版，使用SMA）
  for (let i = period; i < data.length; i++) {
    const startIdx = i - period;
    
    const avgPlusDM = plusDM.slice(startIdx, i).reduce((a, b) => a + b, 0) / period;
    const avgMinusDM = minusDM.slice(startIdx, i).reduce((a, b) => a + b, 0) / period;
    const avgTR = tr.slice(startIdx, i).reduce((a, b) => a + b, 0) / period;
    
    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;
    const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100;
    
    // ADX是DX的平滑平均（简化：使用当前DX值）
    result.push({
      date: data[i].date,
      adx: parseFloat(dx.toFixed(2)),
      plusDI: parseFloat(plusDI.toFixed(2)),
      minusDI: parseFloat(minusDI.toFixed(2)),
    });
  }
  
  return result;
}

/**
 * 生成综合买卖建议
 * 结合多个技术指标
 */
export function generateAdvancedSignal(
  rsi: { date: string; rsi: number }[],
  macd: { macd: number; signal: number; histogram: number }[],
  kdj: { k: number; d: number; j: number }[],
  wr: { wr: number }[],
  cci: { cci: number }[]
): {
  signal: '强力买入' | '买入' | '持有' | '卖出' | '强力卖出';
  reasons: string[];
} {
  if (rsi.length === 0) {
    return { signal: '持有', reasons: ['数据不足'] };
  }
  
  const lastRSI = rsi[rsi.length - 1].rsi;
  const lastMACD = macd[macd.length - 1];
  const lastKDJ = kdj[kdj.length - 1];
  const lastWR = wr[wr.length - 1].wr;
  const lastCCI = cci[cci.length - 1].cci;
  
  let buyScore = 0;
  let sellScore = 0;
  const reasons: string[] = [];
  
  // RSI信号
  if (lastRSI < 30) {
    buyScore += 2;
    reasons.push(`RSI(${lastRSI.toFixed(1)})超卖`);
  } else if (lastRSI > 70) {
    sellScore += 2;
    reasons.push(`RSI(${lastRSI.toFixed(1)})超买`);
  }
  
  // MACD信号
  if (lastMACD.macd > lastMACD.signal && lastMACD.histogram > 0) {
    buyScore += 2;
    reasons.push('MACD金叉');
  } else if (lastMACD.macd < lastMACD.signal && lastMACD.histogram < 0) {
    sellScore += 2;
    reasons.push('MACD死叉');
  }
  
  // KDJ信号
  if (lastKDJ.k < 20 && lastKDJ.j < 0) {
    buyScore += 2;
    reasons.push(`KDJ超卖(K=${lastKDJ.k.toFixed(1)})`);
  } else if (lastKDJ.k > 80 && lastKDJ.j > 100) {
    sellScore += 2;
    reasons.push(`KDJ超买(K=${lastKDJ.k.toFixed(1)})`);
  }
  
  // WR信号
  if (lastWR < -80) {
    buyScore += 1;
    reasons.push(`WR(${lastWR.toFixed(1)})超卖`);
  } else if (lastWR > -20) {
    sellScore += 1;
    reasons.push(`WR(${lastWR.toFixed(1)})超买`);
  }
  
  // CCI信号
  if (lastCCI < -100) {
    buyScore += 1;
    reasons.push(`CCI(${lastCCI.toFixed(1)})超卖`);
  } else if (lastCCI > 100) {
    sellScore += 1;
    reasons.push(`CCI(${lastCCI.toFixed(1)})超买`);
  }
  
  // 生成最终信号
  const diff = buyScore - sellScore;
  
  if (diff >= 3) {
    return { signal: '强力买入', reasons };
  } else if (diff > 0) {
    return { signal: '买入', reasons };
  } else if (diff === 0) {
    return { signal: '持有', reasons: ['信号中性'] };
  } else if (diff > -3) {
    return { signal: '卖出', reasons };
  } else {
    return { signal: '强力卖出', reasons };
  }
}
