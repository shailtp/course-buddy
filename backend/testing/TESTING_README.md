# RAG & Hybrid System Evaluation Framework

## Overview

This testing framework provides comprehensive evaluation of your Course Buddy recommendation system, comparing:
- **RAG System Performance** (retrieval + generation quality)
- **Hybrid System Performance** (structured API + RAG)

## Framework Structure

```
testing/
├── gold_set_rag.json           # 10 questions testing RAG retrieval
├── gold_set_hybrid.json        # 12 questions testing hybrid system
├── evaluate_rag.js             # RAG-specific evaluation (RAGAS-like metrics)
├── evaluate_hybrid.js          # End-to-end hybrid system evaluation
├── rag_evaluation_report.json  # Generated RAG metrics report
└── hybrid_evaluation_report.json  # Generated hybrid metrics report
```

## Metrics Explained

### RAG System Metrics (RAGAS-inspired)

#### 1. **Context Recall** (Retrieval Quality)
- **What it measures**: Did we retrieve the expected relevant reviews?
- **Formula**: `|relevant_retrieved| / |total_relevant|`
- **Range**: 0-1 (higher is better)
- **Example**: If 3 out of 4 expected reviews were retrieved = 0.75

#### 2. **Context Precision** (Retrieval Quality)
- **What it measures**: What proportion of retrieved reviews were actually relevant?
- **Formula**: `|relevant_retrieved| / |total_retrieved|`
- **Range**: 0-1 (higher is better)
- **Example**: If 3 out of 5 retrieved reviews were relevant = 0.60

#### 3. **F1 Score** (Combined Retrieval Quality)
- **What it measures**: Harmonic mean of precision and recall
- **Formula**: `2 * (precision * recall) / (precision + recall)`
- **Range**: 0-1 (higher is better)
- **Best when**: Both precision and recall are high

#### 4. **Context Relevance** (Retrieval Quality)
- **What it measures**: Do retrieved contexts contain expected keywords?
- **Formula**: `|matched_keywords| / |total_keywords|`
- **Range**: 0-1 (higher is better)

#### 5. **Answer Relevance** (Generation Quality)
- **What it measures**: Does the formatted answer contain expected information?
- **Formula**: Keyword overlap in generated context
- **Range**: 0-1 (higher is better)

#### 6. **Entity Accuracy** (Generation Quality)
- **What it measures**: Are expected professors/courses mentioned in retrieval?
- **Formula**: Average of professor and course mention rates
- **Range**: 0-1 (higher is better)

### Hybrid System Metrics

#### 1. **Answer Quality Score**
- **What it measures**: Does answer contain expected keywords/concepts?
- **Formula**: `|matched_expected_terms| / |total_expected_terms|`
- **Threshold**: ≥ 0.5 to pass

#### 2. **Data Source Correctness**
- **What it measures**: Did system use appropriate data sources?
- Checks:
  - Logic-heavy queries → Should use structured data
  - Vague queries → Should use RAG
  - Hybrid queries → Should use both

#### 3. **Pass Rate by Category**
- **Logic-Heavy**: Structured API performance
- **Vague/Unstructured**: RAG system performance
- **Hybrid**: Combined system performance

## Test Case Categories

### Gold Set: RAG (10 questions)
1. **Professor Teaching Style** (4 questions)
   - Tests semantic understanding of teaching methods
   - Example: "How does Professor Sun explain complex concepts?"

2. **Course Structure** (2 questions)
   - Tests retrieval of course logistics
   - Example: "What is the homework structure for CSC 510?"

3. **Course Difficulty** (2 questions)
   - Tests student experience retrieval
   - Example: "How difficult are the exams?"

4. **Professor Comparison** (2 questions)
   - Tests multi-entity retrieval
   - Example: "Who is more helpful outside of class?"

### Gold Set: Hybrid (12 questions)
1. **Logic-Heavy** (4 questions)
   - Tests structured API queries
   - Example: "What are the prerequisites for CSC 340?"

2. **Vague/Unstructured** (4 questions)
   - Tests RAG semantic search
   - Example: "I want a professor who breaks down complex topics"

3. **Hybrid** (4 questions)
   - Tests combined system
   - Example: "I need CSC 510 - what do students say and who teaches it?"

## Running Evaluations

### 1. RAG System Evaluation

**Tests:** Retrieval and context quality only (no end-to-end LLM)

```bash
cd backend
npm run eval:rag
```

**Output:**
- Context recall, precision, F1 scores per question
- Aggregate metrics across all 10 test cases
- JSON report saved to `rag_evaluation_report.json`


### 2. Hybrid System Evaluation

**Tests:** Complete end-to-end system with LLM generation

**Step 1: Get Auth Token**
```bash
# 1. Login at http://localhost:3000
# 2. Open DevTools > Application > Local Storage
# 3. Copy "token" value
```

**Step 2: Run Evaluation**
```bash
cd backend
npm run eval:hybrid YOUR_TOKEN_HERE
```

**Output:**
- Pass/fail for each question
- Answer quality scores
- Source verification (RAG vs Structured)
- Category-wise metrics
- JSON report saved to `hybrid_evaluation_report.json`

**Expected Results:**
- Logic-Heavy: 80-100% (structured data is precise)
- Vague/Unstructured: 60-80% (depends on RAG quality)
- Hybrid: 70-90% (combination of both)

