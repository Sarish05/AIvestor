/**
 * Utility file for mapping Indian stock/index names to Yahoo Finance symbols
 * This allows users to enter familiar names without needing to add '.NS' suffixes
 */

// Mapping of Indian indices to Yahoo Finance symbols
export const indexMapping: Record<string, string> = {
  // Major Indices
  "NIFTY": "^NSEI",
  "NIFTY50": "^NSEI",
  "SENSEX": "^BSESN",
  "BANKNIFTY": "^NSEBANK",
  "NIFTYBANK": "^NSEBANK",
  "FINNIFTY": "^CNXFIN",
  "NIFTYMIDCAP": "^NSEMDCP50",
  "NIFTYSMALLCAP": "^CNXSC",
  
  // Sector Indices
  "NIFTYIT": "^CNXIT",
  "NIFTYPHARMA": "^CNXPHARMA",
  "NIFTYAUTO": "^CNXAUTO",
  "NIFTYFMCG": "^CNXFMCG",
  "NIFTYMETAL": "^CNXMETAL",
  "NIFTYREALTY": "^CNXREALTY",
  "NIFTYMEDIA": "^CNXMEDIA",
  "NIFTYENERGY": "^CNXENERGY",
  "NIFTYPSUBANK": "^CNXPSUBANK"
};

// Mapping of top Indian stocks to Yahoo Finance symbols
export const stockMapping: Record<string, string> = {
  // IT Companies
  "TCS": "TCS.NS",
  "INFOSYS": "INFY.NS",
  "INFY": "INFY.NS",
  "WIPRO": "WIPRO.NS",
  "HCLTECH": "HCLTECH.NS",
  "TECHM": "TECHM.NS",
  "LTI": "LTI.NS",
  "MINDTREE": "MINDTREE.NS",
  "MPHASIS": "MPHASIS.NS",
  
  // Banks
  "HDFCBANK": "HDFCBANK.NS",
  "ICICIBANK": "ICICIBANK.NS",
  "SBIN": "SBIN.NS",
  "SBI": "SBIN.NS",
  "AXISBANK": "AXISBANK.NS",
  "KOTAKBANK": "KOTAKBANK.NS",
  "INDUSINDBANK": "INDUSIND.NS",
  "BANDHANBANK": "BANDHANBNK.NS",
  "PNB": "PNB.NS",
  
  // Energy
  "RELIANCE": "RELIANCE.NS",
  "ONGC": "ONGC.NS",
  "POWERGRID": "POWERGRID.NS",
  "NTPC": "NTPC.NS",
  "TATAPOWER": "TATAPOWER.NS",
  "ADANIPOWER": "ADANIPOWER.NS",
  
  // Automobile
  "MARUTI": "MARUTI.NS",
  "TATAMOTORS": "TATAMOTORS.NS",
  "M&M": "M&M.NS",
  "HEROMOTOCO": "HEROMOTOCO.NS",
  "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
  "EICHERMOT": "EICHERMOT.NS",
  
  // Pharma
  "SUNPHARMA": "SUNPHARMA.NS",
  "DRREDDY": "DRREDDY.NS",
  "CIPLA": "CIPLA.NS",
  "DIVISLAB": "DIVISLAB.NS",
  "BIOCON": "BIOCON.NS",
  
  // FMCG
  "HINDUNILVR": "HINDUNILVR.NS",
  "ITC": "ITC.NS",
  "NESTLEIND": "NESTLEIND.NS",
  "BRITANNIA": "BRITANNIA.NS",
  "DABUR": "DABUR.NS",
  "MARICO": "MARICO.NS",
  
  // Metals
  "TATASTEEL": "TATASTEEL.NS",
  "HINDALCO": "HINDALCO.NS",
  "JSWSTEEL": "JSWSTEEL.NS",
  "SAIL": "SAIL.NS",
  "NATIONALUM": "NATIONALUM.NS",
  
  // Telecom
  "BHARTIARTL": "BHARTIARTL.NS",
  "AIRTEL": "BHARTIARTL.NS",
  "IDEA": "IDEA.NS",
  
  // New Age Companies
  "ZOMATO": "ZOMATO.NS",
  "NYKAA": "NYKAA.NS",
  "POLICYBAZAAR": "POLICYBZR.NS",
  "PAYTM": "PAYTM.NS",
  
  // Others
  "ADANIPORTS": "ADANIPORTS.NS",
  "ADANIENT": "ADANIENT.NS",
  "ASIANPAINT": "ASIANPAINT.NS",
  "BAJAJFINSV": "BAJAJFINSV.NS",
  "BAJFINANCE": "BAJFINANCE.NS",
  "INDIABULLS": "IBULHSGFIN.NS",
  "L&T": "LT.NS",
  "HDFCLIFE": "HDFCLIFE.NS",
  "GRASIM": "GRASIM.NS",
  "ULTRACEMCO": "ULTRACEMCO.NS",
  "TITAN": "TITAN.NS",
  "JIOFINANCIAL": "JIOFIN.NS"
};

/**
 * Gets the Yahoo Finance symbol for a given stock name or index
 * @param name The stock name or index as commonly known (e.g., "NIFTY50", "TCS")
 * @returns Yahoo Finance compatible symbol
 */
export function getYahooFinanceSymbol(name: string): string {
  // Remove whitespace and convert to uppercase
  const cleanName = name.trim().toUpperCase();
  
  // First check if it's an index
  if (indexMapping[cleanName]) {
    return indexMapping[cleanName];
  }
  
  // Then check if it's a known stock
  if (stockMapping[cleanName]) {
    return stockMapping[cleanName];
  }
  
  // If it's already in Yahoo Finance format (has .NS or ^ prefix), return as is
  if (cleanName.includes('.NS') || cleanName.startsWith('^')) {
    return cleanName;
  }
  
  // If we don't recognize it, assume it's an NSE stock and append .NS
  return `${cleanName}.NS`;
} 