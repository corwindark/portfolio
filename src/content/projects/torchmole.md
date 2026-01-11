---
title: "Encoding Atomic Environments with PyTorch"
date: 2024-06-01
labels: [PyTorch, Package Development, CI/CD, Data Visualization, Python]
image: torchmole-preview.jpg
description: "Building TorchMole, a Python package for encoding atomic environments using graph neural networks."
---

# TorchMole: Atomic Environment Encoding

## Overview

TorchMole is a PyTorch-based package I developed for encoding atomic environments in molecular and materials science applications. It provides efficient graph neural network implementations for learning representations of atomic structures.

## Key Features

- **Graph-based molecular representations** using message-passing neural networks
- **Efficient neighbor list computation** with CUDA acceleration
- **Modular architecture** for easy experimentation with different encoding schemes
- **Full CI/CD pipeline** with automated testing and documentation

## Architecture

:::code{title="Python: TorchMole Model Architecture" collapsed}
```python
import torch
import torch.nn as nn
from torch_geometric.nn import MessagePassing
from torch_geometric.data import Data

class AtomicEncoder(nn.Module):
    """
    Graph neural network for encoding atomic environments.
    Uses message-passing to aggregate neighbor information.
    """
    def __init__(self, hidden_dim=128, num_layers=3, cutoff=5.0):
        super().__init__()
        self.cutoff = cutoff
        
        # Embedding layers
        self.atom_embedding = nn.Embedding(100, hidden_dim)  # Atomic numbers
        self.distance_expansion = GaussianBasis(0, cutoff, num_gaussians=50)
        
        # Message passing layers
        self.interactions = nn.ModuleList([
            InteractionBlock(hidden_dim, hidden_dim)
            for _ in range(num_layers)
        ])
        
        # Output network
        self.output_net = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, 1)
        )
    
    def forward(self, atomic_numbers, positions, batch):
        # Compute neighbor list
        edge_index, edge_attr = self.compute_edges(positions, batch)
        
        # Initial embeddings
        x = self.atom_embedding(atomic_numbers)
        
        # Message passing
        for interaction in self.interactions:
            x = interaction(x, edge_index, edge_attr)
        
        # Aggregate to per-structure prediction
        out = self.output_net(x)
        return scatter_add(out, batch, dim=0)


class InteractionBlock(MessagePassing):
    """Continuous-filter convolution for atomic interactions."""
    
    def __init__(self, in_dim, out_dim):
        super().__init__(aggr='add')
        self.mlp = nn.Sequential(
            nn.Linear(in_dim + 50, out_dim),
            nn.SiLU(),
            nn.Linear(out_dim, out_dim)
        )
        self.update_net = nn.Sequential(
            nn.Linear(out_dim + in_dim, out_dim),
            nn.SiLU()
        )
    
    def forward(self, x, edge_index, edge_attr):
        return self.propagate(edge_index, x=x, edge_attr=edge_attr)
    
    def message(self, x_j, edge_attr):
        return self.mlp(torch.cat([x_j, edge_attr], dim=-1))
    
    def update(self, aggr_out, x):
        return self.update_net(torch.cat([x, aggr_out], dim=-1))
```
:::

## Package Development

The package follows modern Python best practices:

:::code{title="YAML: GitHub Actions CI/CD" collapsed}
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        pip install -e ".[dev]"
    
    - name: Run tests
      run: pytest tests/ --cov=torchmole
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```
:::

## Results

TorchMole achieves competitive results on standard molecular property prediction benchmarks while providing a clean, extensible API for research applications.

