# Augmented Search for Semantic Scholar

A tool for searching the Semantic Scholar database with multiple keywords and combining the results into a single deduplicated list.

## Why?

Searching for scientific papers often requires trying multiple keywords or phrases. Doing this manually results in overlapping results and unnecessary duplicate papers.

This tool automates the process by:
- Searching Semantic Scholar for each keyword
- Combining all results
- Removing duplicate papers
- Returning a single, clean list for further review

Ideal for systematic literature reviews and exploratory research.

## Usage

### CLI

```bash
ssm search \
  --keywords "battery electric vehicle" \
  --keywords "hybrid electric vehicle" \
  --limit 100
```

Example output:

```
Found:
- 178 papers
- 146 unique papers
- 32 duplicates removed
```

### Web

Visit:

```
https://your-website.com
```

Enter your keywords and download the merged results.

## Example

Input keywords:

```
battery electric vehicle
hybrid electric vehicle
electric mobility
```

Output:

- One combined list
- Duplicate papers removed
- Sorted by relevance *(or citations/date, depending on implementation)*


## Publication

This tool was developed as part of the methodology used in the following publication:

> **Methodology for AI-Based Search Strategy of Scientific Papers: Exemplary Search for Hybrid and Battery Electric Vehicles in the Semantic Scholar Database**
