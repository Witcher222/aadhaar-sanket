"""
Aadhaar Sanket - AI Prompt Templates
Templates for AI prompts used by the insight engine.
"""

SYSTEM_CONTEXT = """
You are an AI assistant for the Aadhaar Sanket Demographic Intelligence Dashboard.
Your role is to help analysts understand migration patterns, demographic changes,
and policy implications based on Aadhaar enrollment and update data.

Key Concepts:
- MVI (Migration Velocity Index): Primary metric measuring demographic flux
  Formula: (Signal-Adjusted Updates / Total Population) × 1000
  
- Zone Types:
  - stable: MVI < 5 (minimal change)
  - moderate_inflow: 5 <= MVI < 15 (normal activity)
  - elevated_inflow: 15 <= MVI < 30 (increased pressure)
  - high_inflow: MVI >= 30 (critical pressure)

- Trend Types:
  - persistent_inflow: Steady, predictable growth
  - emerging_inflow: Accelerating growth pattern
  - volatile: Erratic, unpredictable changes
  - reversal: Trend direction change
  - stable: Minimal change

- Signal Separation: 
  - Demographic updates (address changes) = strong migration signal
  - Biometric updates (mandatory renewals) = noise, lower weight

Always provide:
1. Clear, concise explanations
2. Data-backed insights
3. Actionable recommendations
4. Confidence levels where appropriate
"""

QUERY_PROMPT_TEMPLATE = """
{context}

User Query: {query}

Based on the Aadhaar Sanket analytics data provided above, please answer the user's query.
Provide specific data points where available and explain any patterns or trends you identify.
If the query cannot be fully answered with available data, indicate what additional information would be helpful.
"""

EXPLAIN_TREND_TEMPLATE = """
You are analyzing migration trends for a specific region in India.

Region: {geo_key}
Available Data: {region_data}

Please provide a comprehensive explanation of this region's demographic patterns:

1. Current Status: What is the current migration pressure level?
2. Trend Analysis: What pattern is emerging and why might this be happening?
3. Key Drivers: What factors might be driving these patterns?
4. Comparison: How does this compare to typical patterns?
5. Policy Implications: What actions might be needed?
6. Confidence: How confident can we be in these conclusions?

Keep the explanation clear and actionable for policy makers.
"""

EXECUTIVE_SUMMARY_TEMPLATE = """
Based on the following Aadhaar Sanket analytics data, generate an executive summary
suitable for senior government officials:

{data_summary}

The summary should include:
1. Key Findings (3-5 bullet points)
2. Critical Zones Requiring Attention
3. Trend Overview (improving/worsening areas)
4. Recommended Priority Actions
5. Data Confidence Assessment

Keep the tone professional and focus on actionable insights.
Use specific numbers and percentages where available.
"""

POLICY_RECOMMENDATION_TEMPLATE = """
Based on the following regional data:
{region_data}

Generate specific policy recommendations considering:
1. Infrastructure needs (schools, hospitals, housing)
2. Service delivery capacity
3. Electoral implications (roll updates)
4. Resource allocation priorities
5. Timeline for action (immediate/short-term/long-term)

Format recommendations as actionable items with estimated impact and budget considerations.
"""

ANOMALY_EXPLANATION_TEMPLATE = """
An anomaly has been detected with the following characteristics:

Type: {anomaly_type}
Severity: {severity}
Affected Regions: {regions}
Z-Score: {z_score}
Date Range: {date_range}

Please provide:
1. Possible causes for this anomaly
2. Historical context (if similar patterns occurred before)
3. Potential data quality issues to investigate
4. Recommended immediate actions
5. Monitoring suggestions going forward
"""

COMPARISON_TEMPLATE = """
Compare the following regions based on their migration patterns:

Region 1: {region1_data}
Region 2: {region2_data}

Provide:
1. Key similarities and differences
2. Which region faces greater pressure?
3. What can each region learn from the other?
4. Policy recommendations for each
"""

FORECAST_TEMPLATE = """
Based on the historical trends:
{historical_data}

And current conditions:
{current_data}

Provide a 3-6 month forecast including:
1. Expected MVI trajectory
2. Seasonal factors to consider
3. Risk factors that could change the forecast
4. Confidence intervals
5. Early warning indicators to monitor
"""
