---
title: "Automating my ETF Portfolio"
date: 2020-03-01
labels: [Shiny, R, Web Apps, Portfolio Management]
image: shiny-preview.jpg
description: "Building a ShinyApp web application to automate portfolio rebalancing and tax-loss harvesting."
---

# Automating My ETF Portfolio with Shiny

## The Problem

Managing a diversified ETF portfolio requires regular:
- **Rebalancing** to maintain target allocations
- **Tax-loss harvesting** to offset gains
- **Cash deployment** from new contributions

Doing this manually is tedious and error-prone. So I built an app.

## The Solution

A Shiny web application that connects to my brokerage API and generates optimal trades.

:::code{title="R: Shiny App Core Logic" collapsed}
```r
library(shiny)
library(tidyverse)
library(httr)

# Define target allocation
target_allocation <- tibble(
  ticker = c("VTI", "VXUS", "BND", "VNQ"),
  target = c(0.50, 0.25, 0.20, 0.05)
)

calculate_rebalance <- function(holdings, targets, cash_available = 0) {
  # Join current holdings with targets
  portfolio <- holdings %>%
    full_join(targets, by = "ticker") %>%
    mutate(
      current_value = replace_na(shares * price, 0),
      target_value = target * (sum(current_value) + cash_available),
      difference = target_value - current_value,
      shares_to_trade = floor(difference / price)
    )
  
  return(portfolio)
}

# UI
ui <- fluidPage(
  titlePanel("ETF Portfolio Manager"),
  sidebarLayout(
    sidebarPanel(
      numericInput("cash", "New Cash to Deploy ($)", 0),
      actionButton("refresh", "Refresh Holdings"),
      actionButton("calculate", "Calculate Trades")
    ),
    mainPanel(
      tableOutput("holdings"),
      plotOutput("allocation_chart"),
      tableOutput("trades")
    )
  )
)
```
:::

## Features

- Real-time portfolio visualization
- One-click rebalancing calculations
- Tax-lot selection for optimal harvesting
- Historical performance tracking

