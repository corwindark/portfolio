---
title: "Driving Game Profitability with AB Tests"
date: 2024-10-15
labels: [AB Testing, Python]
image: ab-test-preview.jpg
description: "Using AB tests to drive greater engagement and conversion rate throughout the funnel of a game I developed on the Roblox platform, improving return by 30%."
---

# Driving Game Profitability with AB Tests

## Overview

This project demonstrates how I used A/B testing methodologies to optimize player engagement and monetization in a hypercasual game I developed on the Roblox platform.

## The Challenge

When running a live game with thousands of daily players, every design decision impacts revenue. But how do you know which changes actually improve the player experience and which hurt it?

## Methodology

I implemented a robust A/B testing framework that allowed me to:

1. **Segment players randomly** into control and treatment groups
2. **Track key metrics** including session length, return rate, and conversion
3. **Analyze statistical significance** before rolling out changes

:::code{title="Python: Statistical Significance Testing" collapsed}
```python
import scipy.stats as stats
import numpy as np

def calculate_significance(control_conversions, control_total, 
                          treatment_conversions, treatment_total):
    """
    Calculate statistical significance of A/B test results
    using a two-proportion z-test.
    """
    p_control = control_conversions / control_total
    p_treatment = treatment_conversions / treatment_total
    p_pooled = (control_conversions + treatment_conversions) / (control_total + treatment_total)
    
    se = np.sqrt(p_pooled * (1 - p_pooled) * (1/control_total + 1/treatment_total))
    z_score = (p_treatment - p_control) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_score)))
    
    return {
        'z_score': z_score,
        'p_value': p_value,
        'significant': p_value < 0.05,
        'lift': (p_treatment - p_control) / p_control * 100
    }
```
:::

## Results

Through systematic testing, I achieved:

- **30% improvement** in return on ad spend
- **15% increase** in day-1 retention
- **22% higher** average session length

## Key Learnings

The most impactful changes weren't always the ones I expected. Small UI adjustments often outperformed major feature additions, reinforcing the importance of data-driven decision making.

