require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

/**
 * Hybrid System Evaluation Script
 * 
 * Tests the complete system with:
 * - Logic-heavy queries (structured API strength)
 * - Vague/unstructured queries (RAG strength)
 * - Hybrid queries (both required)
 */

const API_BASE_URL = 'http://localhost:5001/api';

// You'll need to set this with a valid token for testing
let AUTH_TOKEN = null;

/**
 * Load test data
 */
const loadGoldSet = async () => {
    const goldSetPath = path.join(__dirname, 'gold_set_hybrid.json');
    const data = await fs.readFile(goldSetPath, 'utf-8');
    return JSON.parse(data);
};

/**
 * Make authenticated API call to chat endpoint
 */
const queryChatAPI = async (question, token) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/chat/query`,
            {
                question: question,
                conversationHistory: []
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return {
            success: true,
            answer: response.data.answer,
            sources: response.data.sources
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
};

/**
 * Check if answer contains expected content
 */
const checkAnswerQuality = (answer, expectedContains) => {
    const answerLower = answer.toLowerCase();
    const matches = expectedContains.filter(term =>
        answerLower.includes(term.toLowerCase())
    );
    
    return {
        score: matches.length / expectedContains.length,
        matched: matches,
        missing: expectedContains.filter(term => !matches.includes(term))
    };
};

/**
 * Verify correct data source was used
 */
const verifyDataSource = (sources, expectedDataSource, requiresRAG, requiresStructured) => {
    const usedRAG = sources.reviewsUsed > 0;
    const usedStructured = sources.coursesAvailable > 0 || sources.professorsAvailable > 0;
    
    let correctSource = true;
    const issues = [];
    
    if (requiresRAG && !usedRAG) {
        correctSource = false;
        issues.push('Expected RAG data but none was retrieved');
    }
    
    if (requiresStructured && !usedStructured) {
        correctSource = false;
        issues.push('Expected structured data but none was used');
    }
    
    if (expectedDataSource === 'rag' && !usedRAG) {
        correctSource = false;
        issues.push('RAG-specific query but no reviews retrieved');
    }
    
    return {
        correct: correctSource,
        usedRAG,
        usedStructured,
        issues
    };
};

/**
 * Evaluate a single test case
 */
const evaluateTestCase = async (testCase, token) => {
    console.log(`\n📝 Evaluating [${testCase.category}]: ${testCase.id}`);
    console.log(`   Question: ${testCase.question}`);
    
    try {
        const result = await queryChatAPI(testCase.question, token);
        
        if (!result.success) {
            console.log(`   ❌ API Error: ${result.error}`);
            return {
                id: testCase.id,
                category: testCase.category,
                type: testCase.type,
                question: testCase.question,
                error: result.error,
                passed: false
            };
        }
        
        // Check answer quality
        const qualityCheck = checkAnswerQuality(
            result.answer,
            testCase.expected_answer_contains
        );
        
        // Verify data source
        const sourceCheck = verifyDataSource(
            result.sources,
            testCase.expected_data_source,
            testCase.requires_rag,
            testCase.requires_structured_data
        );
        
        const passed = qualityCheck.score >= 0.5 && sourceCheck.correct;
        
        console.log(`   ${passed ? '✅' : '❌'} Answer Quality: ${(qualityCheck.score * 100).toFixed(1)}%`);
        console.log(`   ${sourceCheck.correct ? '✅' : '❌'} Data Source: ${sourceCheck.usedRAG ? 'RAG' : ''}${sourceCheck.usedRAG && sourceCheck.usedStructured ? '+' : ''}${sourceCheck.usedStructured ? 'Structured' : ''}`);
        console.log(`   Reviews Used: ${result.sources.reviewsUsed}`);
        
        if (qualityCheck.missing.length > 0) {
            console.log(`   ⚠️  Missing keywords: ${qualityCheck.missing.join(', ')}`);
        }
        
        if (sourceCheck.issues.length > 0) {
            console.log(`   ⚠️  Source issues: ${sourceCheck.issues.join(', ')}`);
        }
        
        return {
            id: testCase.id,
            category: testCase.category,
            type: testCase.type,
            question: testCase.question,
            answer: result.answer,
            sources: result.sources,
            quality_score: qualityCheck.score,
            matched_keywords: qualityCheck.matched,
            missing_keywords: qualityCheck.missing,
            source_correct: sourceCheck.correct,
            source_issues: sourceCheck.issues,
            passed: passed
        };
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return {
            id: testCase.id,
            category: testCase.category,
            type: testCase.type,
            question: testCase.question,
            error: error.message,
            passed: false
        };
    }
};

/**
 * Calculate metrics by category
 */
const calculateCategoryMetrics = (results) => {
    const categories = {
        logic_heavy: { total: 0, passed: 0, avg_quality: 0 },
        vague_unstructured: { total: 0, passed: 0, avg_quality: 0 },
        hybrid: { total: 0, passed: 0, avg_quality: 0 }
    };
    
    results.forEach(r => {
        if (!r.error) {
            const cat = categories[r.category];
            cat.total++;
            if (r.passed) cat.passed++;
            cat.avg_quality += r.quality_score;
        }
    });
    
    // Calculate averages
    Object.keys(categories).forEach(key => {
        const cat = categories[key];
        if (cat.total > 0) {
            cat.avg_quality = cat.avg_quality / cat.total;
            cat.pass_rate = cat.passed / cat.total;
        }
    });
    
    return categories;
};

/**
 * Main evaluation function
 */
const runEvaluation = async (authToken) => {
    console.log('=== Hybrid System Evaluation ===\n');
    
    if (!authToken) {
        console.error('❌ Error: Authentication token required!');
        console.log('\nTo get a token:');
        console.log('1. Login to your app at http://localhost:3000');
        console.log('2. Open browser DevTools > Application > Local Storage');
        console.log('3. Copy the "token" value');
        console.log('4. Run: node evaluate_hybrid.js YOUR_TOKEN\n');
        process.exit(1);
    }
    
    console.log('Loading gold set...');
    const goldSet = await loadGoldSet();
    console.log(`Loaded ${goldSet.test_cases.length} test cases\n`);
    
    const results = [];
    
    for (const testCase of goldSet.test_cases) {
        const result = await evaluateTestCase(testCase, authToken);
        results.push(result);
        
        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Calculate metrics
    console.log('\n\n=== RESULTS BY CATEGORY ===\n');
    const categoryMetrics = calculateCategoryMetrics(results);
    
    Object.entries(categoryMetrics).forEach(([category, metrics]) => {
        console.log(`${category.toUpperCase().replace('_', ' ')}:`);
        console.log(`  Tests: ${metrics.passed}/${metrics.total} passed (${(metrics.pass_rate * 100).toFixed(1)}%)`);
        console.log(`  Avg Quality Score: ${(metrics.avg_quality * 100).toFixed(1)}%\n`);
    });
    
    // Overall metrics
    const totalTests = results.filter(r => !r.error).length;
    const totalPassed = results.filter(r => r.passed).length;
    const overallPassRate = totalTests > 0 ? totalPassed / totalTests : 0;
    const avgQuality = results
        .filter(r => !r.error)
        .reduce((sum, r) => sum + r.quality_score, 0) / totalTests;
    
    console.log('=== OVERALL METRICS ===\n');
    console.log(`Total Tests: ${results.length}`);
    console.log(`Successful API Calls: ${totalTests}`);
    console.log(`Tests Passed: ${totalPassed}/${totalTests} (${(overallPassRate * 100).toFixed(1)}%)`);
    console.log(`Average Answer Quality: ${(avgQuality * 100).toFixed(1)}%`);
    
    // Save report
    const reportPath = path.join(__dirname, 'hybrid_evaluation_report.json');
    await fs.writeFile(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        goldSet: goldSet.metadata,
        results,
        categoryMetrics,
        overallMetrics: {
            total_tests: results.length,
            successful_calls: totalTests,
            tests_passed: totalPassed,
            pass_rate: overallPassRate,
            avg_quality: avgQuality
        }
    }, null, 2));
    
    console.log(`\n✅ Evaluation complete! Report saved to: ${reportPath}\n`);
    
    return { results, categoryMetrics };
};

// Run evaluation if called directly
if (require.main === module) {
    const token = process.argv[2];
    
    runEvaluation(token)
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Evaluation failed:', error);
            process.exit(1);
        });
}

module.exports = { runEvaluation, evaluateTestCase };

