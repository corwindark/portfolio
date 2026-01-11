---
title: "Mining Features from Massive Comment Datasets"
date: 2024-08-01
labels: [PySpark, NLP, NLTK, AzureML, Sagemaker, Big Data]
image: reddit-preview.jpg
description: "Predicting retail trader activity through Natural Language processing across more than 700 million Reddit comments."
---

# Mining Features from Massive Comment Datasets

## The Challenge

Reddit's financial communities, particularly r/wallstreetbets, have become influential indicators of retail trading sentiment. But analyzing 700+ million comments requires serious infrastructure.

## Technical Approach

This project demonstrates end-to-end big data processing across multiple cloud platforms.

### Data Pipeline Architecture

:::code{title="PySpark: Comment Processing Pipeline" collapsed}
```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, udf, explode, split
from pyspark.ml.feature import HashingTF, IDF, Tokenizer
import nltk

spark = SparkSession.builder \
    .appName("RedditCommentAnalysis") \
    .config("spark.sql.shuffle.partitions", "200") \
    .getOrCreate()

# Load raw comments from parquet
comments_df = spark.read.parquet("s3://reddit-data/comments/")

# Text preprocessing UDF
@udf("string")
def preprocess_text(text):
    if text is None:
        return ""
    # Lowercase, remove special chars, tokenize
    tokens = nltk.word_tokenize(text.lower())
    return " ".join([t for t in tokens if t.isalpha()])

# Apply preprocessing
processed_df = comments_df \
    .filter(col("subreddit").isin(["wallstreetbets", "stocks", "investing"])) \
    .withColumn("clean_text", preprocess_text(col("body")))

# Extract ticker mentions
ticker_pattern = r'\$[A-Z]{1,5}\b'
mentions_df = processed_df \
    .withColumn("tickers", regexp_extract_all(col("clean_text"), ticker_pattern))
```
:::

### Sentiment Analysis at Scale

I implemented a custom sentiment model trained on financial text, then deployed it across the cluster:

:::code{title="Python: Distributed Sentiment Scoring" collapsed}
```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from pyspark.sql.functions import pandas_udf
import pandas as pd

# Broadcast model weights to all workers
model_broadcast = spark.sparkContext.broadcast(model_weights)

@pandas_udf("float")
def score_sentiment(texts: pd.Series) -> pd.Series:
    # Load model on worker
    model = load_model(model_broadcast.value)
    tokenizer = AutoTokenizer.from_pretrained("finbert-tone")
    
    scores = []
    for text in texts:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        score = torch.softmax(outputs.logits, dim=1)[0][2].item()  # Positive prob
        scores.append(score)
    
    return pd.Series(scores)

# Apply sentiment scoring
sentiment_df = mentions_df.withColumn("sentiment", score_sentiment(col("clean_text")))
```
:::

## Results

- Processed **700M+ comments** in under 4 hours using 50-node cluster
- Achieved **0.78 correlation** between aggregated sentiment and next-day retail trading volume
- Built real-time dashboard for monitoring emerging ticker mentions

## Cloud Architecture

The pipeline runs on both AWS (Sagemaker) and Azure (AzureML) to demonstrate platform flexibility and for redundancy.

