---
title: "SQL Decimal"
description: ""
date: 2024-03-26
tags: []
---

The definition of the `DECIMAL` data type in [SQL92] (where it is called "exact numeric") can be summarized as follows. A decimal value $d$ has a **precision** $p$ and a **scale** $s$.
- $p$ is a positive integer that determines the number of significant digits in the value. That is, $d$ can have at most $p$ digits.
- For a scale of $s$, the exact numeric value is $d \times 10^{-s}$. In other words, $s$ is the number of digits to the right of the decimal point.

For example, a decimal data type of precision 5 and scale 2, denoted as `DECIMAL(5, 2)`, can store values from -999.99 to 999.99, inclusive.

Different systems may have slightly different definitions. For example, PostgreSQL 15 support a [negative scale](https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL), thus `DECIMAL(2, -3)` can store values between -99000 and 99000.

Apart from the data type definition, internal representation and storage of decimal values can vary between systems.

## MySQL
```c
typedef int32 decimal_digit_t;
struct decimal_t {
int intg, frac, len;
bool sign;
decimal_digit_t *buf;
};
```

## PostgreSQL
```c
#define DECSIZE 30

typedef unsigned char NumericDigit;
typedef struct
{
int ndigits; /* number of digits in digits[] - can be 0! */
int weight; /* weight of first digit */
int rscale; /* result scale */
int dscale; /* display scale */
int sign; /* NUMERIC_POS, NUMERIC_NEG, or NUMERIC_NAN */
NumericDigit *buf; /* start of alloc'd space for digits[] */
NumericDigit *digits; /* decimal digits */
} numeric;

typedef struct
{
int ndigits; /* number of digits in digits[] - can be 0! */
int weight; /* weight of first digit */
int rscale; /* result scale */
int dscale; /* display scale */
int sign; /* NUMERIC_POS, NUMERIC_NEG, or NUMERIC_NAN */
NumericDigit digits[DECSIZE]; /* decimal digits */
} decimal;
```

[SQL92]: https://www.contrib.andrew.cmu.edu/~shadow/sql/sql1992.txt

## Apache Arrow
```rust
pub enum DataType {
    // ...
    Decimal128(u8, i8),
    Decimal256(u8, i8),
    // ...
}
impl ArrowPrimitiveType for Decimal128Type {
    type Native = i128;
}
impl ArrowPrimitiveType for Decimal256Type {
    type Native = i256;
}
```