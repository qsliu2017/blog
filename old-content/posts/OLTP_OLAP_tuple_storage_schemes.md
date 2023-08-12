---
title: OLTP/OLAP and Tuple Storage Schemes
date: 2022-11-13
description: Brief about OLTP/OLAP and column/row oriented storage.
tags: [database]
---

# Database Workloads

*On-Line Transaction Processing* (OLTP) is a type of workloads that DBMS tends to (1)focus on writing more than reading and/or (2)deal with small amount of data each time.

While *On-Line Analytical Processing* (OLAP) is another type that DBMS tends to (1)focus more on reading and/or (2)access amount of data each time.

> There is another type named *Hybrid Transactional/Analytical Processing* (HTAP) that hybrids these two types of workloads togetger.

# Tuple Storage Schemes

There are two common schemes of tuple storage: *column-oriented storage* and *row-oriented storage*.

Let's say we have the following tuples (logically):

```python
# (name, age, sex, department)
[
  ("Anna", 25, "F", "Comp. Sci."),
  ("Betty", 23, "F", "Software Eng."),
  # ...
  ("Candy", 24, "F", "Software Eng."),
  ("David", 24, "M", "Comp. Sci."),
  # ...
]
```

In row-oriented storage scheme, these tuples are stored in almost the same way:

```python
# Block 1
[
  ("Anna", 25, "F", "Comp. Sci."),
  ("Betty", 23, "F", "Software Eng."),
  # ...
],
# Block 2
[
  ("Candy", 24, "F", "Software Eng."),
  ("David", 24, "M", "Comp. Sci."),
  # ...
]
```

While in column-oriented storage scheme, values of a single attribute are stored together:
```python
# Block 1 (for attribute "name")
[
  "Anna", "Betty", # ...
  "Candy", "David", # ...
]
# Block 2 (for attribute "age")
[
  25, 23, # ...
  24, 24, # ...
]
# Block 3 (for attribute "sex")
[
  "F", "F", # ...
  "F", "M", # ...
]
# Block 4 (for attribute "department")
[
  "Comp. Sci.", "Software Eng.", # ...
  "Software Eng.", "Comp. Sci.", # ...
]
```

||Row-Oriented|Column-Oriented|
|:-:|--|--|
|Pros|1. Reduce IO to insert/update/delete tuple<br/>2. Reduce multiple IO to access an entire tuple|1. Each block contains more values of an attribute (good for queries only access a subset of attrbutes)<br/>2. Column level compression|
|Cons|1. Waste IO when a few attributes are needed<br/>2. Waste IO to scan large poritions of data|1. Multiple IO caused by insert/update/delete<br/>2. Reduce CPU time to reconstruct tuples and/or decompress columns|
|Works For|OLTP|OLAP|
