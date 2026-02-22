#!/usr/bin/env node
import { db } from '../server/database.js';
import { getCostSummary, getDailyTotal, getProjectTotal, getCostReport, exportCsv } from '../server/services/costTracker.js';
import fs from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--daily') {
    options.daily = true;
  } else if (arg === '--project' && args[i + 1]) {
    options.project = parseInt(args[i + 1]);
    i++; // Skip next argument
  } else if (arg === '--from' && args[i + 1]) {
    options.from = args[i + 1];
    i++;
  } else if (arg === '--to' && args[i + 1]) {
    options.to = args[i + 1];
    i++;
  } else if (arg === '--export' && args[i + 1]) {
    options.export = args[i + 1];
    i++;
  } else if (arg === '--groupBy' && args[i + 1]) {
    options.groupBy = args[i + 1];
    i++;
  } else if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }
}

function showHelp() {
  console.log(`
ShotPilot Cost Report CLI

Usage:
  node scripts/cost-report.js [options]

Options:
  --daily                Show today's costs
  --project <id>         Show costs for specific project
  --from <date>          Start date (YYYY-MM-DD)
  --to <date>            End date (YYYY-MM-DD)  
  --groupBy <field>      Group by: day, action, model, provider, project
  --export <file>        Export to CSV file
  --help, -h             Show this help

Examples:
  node scripts/cost-report.js                    # Summary
  node scripts/cost-report.js --daily           # Today only  
  node scripts/cost-report.js --project 1       # Project 1 costs
  node scripts/cost-report.js --from 2026-02-20 --to 2026-02-21
  node scripts/cost-report.js --export costs.csv
`);
}

function formatCurrency(amount) {
  return `$${amount.toFixed(4)}`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString();
}

function printSummary() {
  const summary = getCostSummary();
  
  console.log('\n📊 ShotPilot Cost Summary\n');
  
  if (summary.last_action) {
    const lastAction = summary.last_action;
    console.log(`💰 Last Action: ${formatCurrency(lastAction.cost)} (${lastAction.action} via ${lastAction.model})`);
    console.log(`   Timestamp: ${formatDate(lastAction.timestamp)}`);
  } else {
    console.log('💰 Last Action: No activity');
  }
  
  console.log(`📅 Today: ${formatCurrency(summary.daily_total.total_cost)} (${summary.daily_total.call_count} calls)`);
  
  if (summary.daily_total.breakdown_by_action.length > 0) {
    console.log('   Breakdown:');
    for (const action of summary.daily_total.breakdown_by_action) {
      console.log(`     ${action.action}: ${formatCurrency(action.cost)} (${action.count}x)`);
    }
  }
  
  if (summary.project_totals.length > 0) {
    console.log('\n📁 Project Totals:');
    for (const project of summary.project_totals.slice(0, 5)) { // Top 5
      console.log(`   Project ${project.project_id}: ${formatCurrency(project.total_cost)} (${project.call_count} calls)`);
    }
    if (summary.project_totals.length > 5) {
      console.log(`   ... and ${summary.project_totals.length - 5} more projects`);
    }
  }
}

function printDaily(date) {
  const daily = getDailyTotal(date);
  const dateStr = date || new Date().toISOString().split('T')[0];
  
  console.log(`\n📅 Daily Report: ${dateStr}\n`);
  console.log(`Total Cost: ${formatCurrency(daily.total_cost)}`);
  console.log(`API Calls: ${daily.call_count}`);
  
  if (daily.breakdown_by_action.length > 0) {
    console.log('\nBreakdown by Action:');
    console.table(daily.breakdown_by_action.map(item => ({
      Action: item.action,
      Cost: formatCurrency(item.cost),
      Calls: item.count,
      'Avg Cost': formatCurrency(item.cost / item.count)
    })));
  } else {
    console.log('\nNo activity for this date.');
  }
}

function printProject(projectId) {
  const project = getProjectTotal(projectId);
  
  console.log(`\n📁 Project Report: #${projectId}\n`);
  console.log(`Total Cost: ${formatCurrency(project.total_cost)}`);
  console.log(`API Calls: ${project.call_count}`);
  
  if (project.breakdown_by_action.length > 0) {
    console.log('\nBreakdown by Action:');
    console.table(project.breakdown_by_action.map(item => ({
      Action: item.action,
      Cost: formatCurrency(item.cost),
      Calls: item.count,
      'Avg Cost': formatCurrency(item.cost / item.count)
    })));
  }
  
  if (project.breakdown_by_model.length > 0) {
    console.log('\nBreakdown by Model:');
    console.table(project.breakdown_by_model.map(item => ({
      Model: item.model,
      Cost: formatCurrency(item.cost),
      Calls: item.count,
      'Avg Cost': formatCurrency(item.cost / item.count)
    })));
  }
  
  if (project.breakdown_by_action.length === 0 && project.breakdown_by_model.length === 0) {
    console.log('\nNo activity for this project.');
  }
}

function printReport(options) {
  const report = getCostReport(options);
  const { groupBy = 'day', from, to } = options;
  
  let title = `Report grouped by ${groupBy}`;
  if (from || to) {
    title += ` (${from || 'start'} to ${to || 'today'})`;
  }
  
  console.log(`\n📈 ${title}\n`);
  
  if (report.length > 0) {
    const headers = {
      Group: 'group',
      'Total Cost': item => formatCurrency(item.total_cost),
      Calls: 'call_count',
      'Avg Cost': item => formatCurrency(item.avg_cost)
    };
    
    console.table(report.map(item => {
      const row = {};
      for (const [header, accessor] of Object.entries(headers)) {
        row[header] = typeof accessor === 'function' ? accessor(item) : item[accessor];
      }
      return row;
    }));
    
    const totalCost = report.reduce((sum, item) => sum + item.total_cost, 0);
    const totalCalls = report.reduce((sum, item) => sum + item.call_count, 0);
    console.log(`\nTotals: ${formatCurrency(totalCost)} (${totalCalls} calls)`);
  } else {
    console.log('No data for the specified criteria.');
  }
}

function exportToCSV(filename, options) {
  try {
    const csvData = exportCsv(options);
    fs.writeFileSync(filename, csvData, 'utf8');
    console.log(`\n✅ Exported cost data to ${filename}`);
    
    // Show summary of exported data
    const lines = csvData.split('\n').length - 2; // Exclude header and last empty line
    const sizeKB = (Buffer.byteLength(csvData, 'utf8') / 1024).toFixed(1);
    console.log(`   ${lines} records, ${sizeKB} KB`);
  } catch (err) {
    console.error(`\n❌ Export failed: ${err.message}`);
    process.exit(1);
  }
}

// Main execution
try {
  if (options.export) {
    exportToCSV(options.export, { from: options.from, to: options.to });
  } else if (options.daily) {
    printDaily();
  } else if (options.project) {
    printProject(options.project);
  } else if (options.from || options.to || options.groupBy) {
    printReport(options);
  } else {
    printSummary();
  }
} catch (err) {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
}