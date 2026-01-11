---
title: "Boosted Trees for Reddit Comment Analysis"
date: 2020-06-01
labels: [XGBoost, Random Forests, API, Naive Bayes, Python]
image: reddit-trees-preview.jpg
description: "Evaluating Reddit sentiment's impact on market movements using gradient boosted trees."
---

# Boosted Trees for Reddit Comment Analysis

## Overview

This project is the first part of my Reddit analysis series, focusing on building predictive models using gradient boosted trees.

## Data Collection

:::code{title="Python: Reddit API Data Collection" collapsed}
```python
import praw
import pandas as pd
from datetime import datetime, timedelta

reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_SECRET",
    user_agent="sentiment_analysis"
)

def collect_daily_comments(subreddit_name, date, limit=1000):
    """Collect comments from a subreddit for a specific date."""
    subreddit = reddit.subreddit(subreddit_name)
    
    comments_data = []
    for submission in subreddit.new(limit=limit):
        submission.comments.replace_more(limit=0)
        for comment in submission.comments.list():
            comments_data.append({
                'body': comment.body,
                'score': comment.score,
                'created_utc': comment.created_utc,
                'ticker_mentions': extract_tickers(comment.body)
            })
    
    return pd.DataFrame(comments_data)
```
:::

## Model Training

:::code{title="Python: XGBoost Sentiment Model" collapsed}
```python
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import roc_auc_score

# Prepare features
X = daily_features[['comment_count', 'avg_sentiment', 'ticker_diversity', 
                     'weekend_flag', 'vix_level']]
y = (next_day_returns > 0).astype(int)

# Time series cross-validation
tscv = TimeSeriesSplit(n_splits=5)

model = xgb.XGBClassifier(
    max_depth=4,
    n_estimators=100,
    learning_rate=0.1,
    objective='binary:logistic'
)

scores = []
for train_idx, test_idx in tscv.split(X):
    model.fit(X.iloc[train_idx], y.iloc[train_idx])
    preds = model.predict_proba(X.iloc[test_idx])[:, 1]
    scores.append(roc_auc_score(y.iloc[test_idx], preds))

print(f"Average AUC: {np.mean(scores):.3f}")
```
:::

## Results

- Achieved **0.58 AUC** in predicting next-day return direction
- Comment volume was the strongest predictive feature
- Model performance degraded significantly during high-volatility periods

