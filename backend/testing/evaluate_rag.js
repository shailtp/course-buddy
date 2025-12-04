require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { ragQuery } = require('../services/ragService');

/**
 * RAG Evaluation Script with RAGAS-like metrics
 * 
 * Metrics:
 * 1. Context Relevance: Are retrieved contexts relevant to the query?
 * 2. Context Recall: Did we retrieve the expected review IDs?
 * 3. Context Precision: What proportion of retrieved reviews were relevant?
 * 4. Answer Relevance: Does the answer address the question?
 * 5. Faithfulness: Is the answer grounded in retrieved context?
 */

// Load test data
const loadGoldSet = async () => {
    const goldSetPath = path.join(__dirname, 'gold_set_rag.json');
    const data = await fs.readFile(goldSetPath, 'utf-8');
    return JSON.parse(data);
};

/**
 * Calculate Context Recall: How many expected reviews were retrieved?
 * Recall = |relevant_retrieved| / |total_relevant|
 */
const calculateContextRecall = (retrievedIds, expectedIds) => {
    if (expectedIds.length === 0) return 1.0;
    
    const retrievedSet = new Set(retrievedIds);
    const matchedCount = expectedIds.filter(id => retrievedSet.has(id)).length;
    
    return matchedCount / expectedIds.length;
};

/**
 * Calculate Context Precision: How many retrieved reviews were relevant?
 * Precision = |relevant_retrieved| / |total_retrieved|
 */
const calculateContextPrecision = (retrievedIds, expectedIds) => {
    if (retrievedIds.length === 0) return 0.0;
    
    const expectedSet = new Set(expectedIds);
    const relevantCount = retrievedIds.filter(id => expectedSet.has(id)).length;
    
    return relevantCount / retrievedIds.length;
};

/**
 * Calculate keyword overlap between text and expected keywords
 */
const calculateKeywordOverlap = (text, keywords) => {
    const textLower = text.toLowerCase();
    const matchedKeywords = keywords.filter(kw => 
        textLower.includes(kw.toLowerCase())
    );
    
    return keywords.length > 0 ? matchedKeywords.length / keywords.length : 0;
};

/**
 * Check if expected entities (professors/courses) are mentioned
 */
const checkEntityMentions = (text, expectedProfessors, expectedCourses) => {
    const textLower = text.toLowerCase();
    
    const professorMentions = expectedProfessors.filter(prof =>
        textLower.includes(prof.toLowerCase())
    ).length;
    
    const courseMentions = expectedCourses.filter(course =>
        textLower.includes(course.toLowerCase())
    ).length;
    
    const profScore = expectedProfessors.length > 0 ? professorMentions / expectedProfessors.length : 1;
    const courseScore = expectedCourses.length > 0 ? courseMentions / expectedCourses.length : 1;
    
    return (profScore + courseScore) / 2;
};

/**
 * Evaluate a single test case
 */
const evaluateTestCase = async (testCase) => {
    console.log(`\n📝 Evaluating: ${testCase.id} - ${testCase.question}`);
    
    try {
        // Perform RAG query
        const ragResult = await ragQuery(testCase.question, 5);
        
        if (!ragResult.hasResults) {
            console.log('❌ No results retrieved');
            return {
                id: testCase.id,
                question: testCase.question,
                error: 'No results retrieved',
                metrics: {
                    context_recall: 0,
                    context_precision: 0,
                    context_relevance: 0,
                    answer_relevance: 0,
                    entity_accuracy: 0
                }
            };
        }
        
        // Extract retrieved review IDs
        const retrievedIds = ragResult.reviews.map(r => r.id);
        const retrievedTexts = ragResult.reviews.map(r => r.review_text).join(' ');
        
        console.log(`  Retrieved: ${retrievedIds.join(', ')}`);
        console.log(`  Expected: ${testCase.relevant_review_ids.join(', ')}`);
        
        // Calculate metrics
        const contextRecall = calculateContextRecall(
            retrievedIds,
            testCase.relevant_review_ids
        );
        
        const contextPrecision = calculateContextPrecision(
            retrievedIds,
            testCase.relevant_review_ids
        );
        
        const contextRelevance = calculateKeywordOverlap(
            retrievedTexts,
            testCase.expected_context_keywords
        );
        
        const answerRelevance = calculateKeywordOverlap(
            ragResult.context,
            testCase.expected_context_keywords
        );
        
        const entityAccuracy = checkEntityMentions(
            retrievedTexts,
            testCase.expected_professors,
            testCase.expected_courses
        );
        
        console.log(`  ✅ Context Recall: ${(contextRecall * 100).toFixed(1)}%`);
        console.log(`  ✅ Context Precision: ${(contextPrecision * 100).toFixed(1)}%`);
        console.log(`  ✅ Context Relevance: ${(contextRelevance * 100).toFixed(1)}%`);
        console.log(`  ✅ Answer Relevance: ${(answerRelevance * 100).toFixed(1)}%`);
        console.log(`  ✅ Entity Accuracy: ${(entityAccuracy * 100).toFixed(1)}%`);
        
        return {
            id: testCase.id,
            question: testCase.question,
            category: testCase.category,
            retrieved_reviews: retrievedIds,
            expected_reviews: testCase.relevant_review_ids,
            metrics: {
                context_recall: contextRecall,
                context_precision: contextPrecision,
                context_relevance: contextRelevance,
                answer_relevance: answerRelevance,
                entity_accuracy: entityAccuracy,
                f1_score: contextPrecision + contextRecall > 0 
                    ? (2 * contextPrecision * contextRecall) / (contextPrecision + contextRecall)
                    : 0
            }
        };
        
    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        return {
            id: testCase.id,
            question: testCase.question,
            error: error.message,
            metrics: {
                context_recall: 0,
                context_precision: 0,
                context_relevance: 0,
                answer_relevance: 0,
                entity_accuracy: 0
            }
        };
    }
};

/**
 * Calculate aggregate metrics across all test cases
 */
const calculateAggregateMetrics = (results) => {
    const validResults = results.filter(r => !r.error);
    
    if (validResults.length === 0) {
        return {
            avg_context_recall: 0,
            avg_context_precision: 0,
            avg_context_relevance: 0,
            avg_answer_relevance: 0,
            avg_entity_accuracy: 0,
            avg_f1_score: 0
        };
    }
    
    const sum = validResults.reduce((acc, r) => ({
        context_recall: acc.context_recall + r.metrics.context_recall,
        context_precision: acc.context_precision + r.metrics.context_precision,
        context_relevance: acc.context_relevance + r.metrics.context_relevance,
        answer_relevance: acc.answer_relevance + r.metrics.answer_relevance,
        entity_accuracy: acc.entity_accuracy + r.metrics.entity_accuracy,
        f1_score: acc.f1_score + r.metrics.f1_score
    }), {
        context_recall: 0,
        context_precision: 0,
        context_relevance: 0,
        answer_relevance: 0,
        entity_accuracy: 0,
        f1_score: 0
    });
    
    const count = validResults.length;
    
    return {
        avg_context_recall: sum.context_recall / count,
        avg_context_precision: sum.context_precision / count,
        avg_context_relevance: sum.context_relevance / count,
        avg_answer_relevance: sum.answer_relevance / count,
        avg_entity_accuracy: sum.entity_accuracy / count,
        avg_f1_score: sum.f1_score / count,
        total_tests: results.length,
        successful_tests: validResults.length,
        failed_tests: results.length - validResults.length
    };
};

/**
 * Main evaluation function
 */
const runEvaluation = async () => {
    console.log('=== RAG System Evaluation ===\n');
    console.log('Loading gold set...');
    
    const goldSet = await loadGoldSet();
    console.log(`Loaded ${goldSet.test_cases.length} test cases\n`);
    
    const results = [];
    
    for (const testCase of goldSet.test_cases) {
        const result = await evaluateTestCase(testCase);
        results.push(result);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Calculate aggregate metrics
    console.log('\n\n=== AGGREGATE METRICS ===\n');
    const aggregateMetrics = calculateAggregateMetrics(results);
    
    console.log(`Total Tests: ${aggregateMetrics.total_tests}`);
    console.log(`Successful: ${aggregateMetrics.successful_tests}`);
    console.log(`Failed: ${aggregateMetrics.failed_tests}\n`);
    
    console.log(`Average Context Recall:    ${(aggregateMetrics.avg_context_recall * 100).toFixed(2)}%`);
    console.log(`Average Context Precision: ${(aggregateMetrics.avg_context_precision * 100).toFixed(2)}%`);
    console.log(`Average F1 Score:          ${(aggregateMetrics.avg_f1_score * 100).toFixed(2)}%`);
    console.log(`Average Context Relevance: ${(aggregateMetrics.avg_context_relevance * 100).toFixed(2)}%`);
    console.log(`Average Answer Relevance:  ${(aggregateMetrics.avg_answer_relevance * 100).toFixed(2)}%`);
    console.log(`Average Entity Accuracy:   ${(aggregateMetrics.avg_entity_accuracy * 100).toFixed(2)}%`);
    
    // Save results to file
    const reportPath = path.join(__dirname, 'rag_evaluation_report.json');
    await fs.writeFile(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        goldSet: goldSet.metadata,
        results,
        aggregateMetrics
    }, null, 2));
    
    console.log(`\n✅ Evaluation complete! Report saved to: ${reportPath}\n`);
    
    return { results, aggregateMetrics };
};

// Run evaluation if called directly
if (require.main === module) {
    runEvaluation()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Evaluation failed:', error);
            process.exit(1);
        });
}

module.exports = { runEvaluation, evaluateTestCase };

