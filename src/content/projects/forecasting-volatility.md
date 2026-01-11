---
title: "Forecasting Volatility with Nontraditional Data"
date: 2021-01-01
labels: [Time Series, ARIMA, GARCH, Financial Markets, R]
image: volatility-preview.jpg
description: "Applying statistical forecasting methods with external datasets to predict market volatility."
---

# Forecasting Volatility with Nontraditional Data

## Overview

This project explores whether alternative data sources can improve volatility forecasting beyond traditional GARCH models.

## Methodology

We combine classical volatility models with features derived from:
- Economic news sentiment
- Options market implied volatility
- Social media activity metrics

:::code{title="R: Enhanced GARCH Model" collapsed}
```r
library(rugarch)
library(quantmod)
library(tidyverse)

# Standard GARCH(1,1) specification
spec_base <- ugarchspec(
  variance.model = list(model = "sGARCH", garchOrder = c(1, 1)),
  mean.model = list(armaOrder = c(1, 0)),
  distribution.model = "std"
)

# GARCH-X with external regressors
spec_enhanced <- ugarchspec(
  variance.model = list(
    model = "sGARCH", 
    garchOrder = c(1, 1),
    external.regressors = as.matrix(alt_data[, c("vix_lag", "news_sentiment", "social_volume")])
  ),
  mean.model = list(armaOrder = c(1, 0)),
  distribution.model = "std"
)

# Fit models
fit_base <- ugarchfit(spec_base, returns)
fit_enhanced <- ugarchfit(spec_enhanced, returns)

# Compare information criteria
cat("Base AIC:", infocriteria(fit_base)[1], "\n")
cat("Enhanced AIC:", infocriteria(fit_enhanced)[1], "\n")
```
:::

## Results

The enhanced model with external regressors achieved:
- **8% lower RMSE** in out-of-sample volatility forecasts
- Particularly strong improvement during market stress periods

