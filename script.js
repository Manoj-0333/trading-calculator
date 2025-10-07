// Move all your JavaScript from the HTML file here

// Trading data structure
let tradingData = {
    initialCapital: 1000,
    currentCapital: 1000,
    safetyCapital: 1000,
    trades: [],
    riskReward: 3,
    baseRiskPercent: 0.03,
    safetyLevels: [1000, 5000],
    currentGroupRisk: 0,
    currentGroupTrades: 0,
    groupSize: 2
};
// Get trade group information
        function getTradeGroup(tradeNumber) {
            if (tradeNumber <= 2) return 'Individual';
            if (tradeNumber <= 4) return 'Group 1 (Trades 3-4)';
            if (tradeNumber <= 6) return 'Group 2 (Trades 5-6)';
            if (tradeNumber <= 8) return 'Group 3 (Trades 7-8)';
            return 'Individual (Post $5000)';
        }

        // Calculate risk capital with grouping rules
        function calculateRiskCapital(tradeNumber) {
            const availableProfit = tradingData.currentCapital - tradingData.safetyCapital;
            
            // First trade uses base risk
            if (tradeNumber === 1) {
                tradingData.currentGroupRisk = tradingData.initialCapital * tradingData.baseRiskPercent;
                tradingData.currentGroupTrades = 1;
                return tradingData.currentGroupRisk;
            }
            
            // Check if we need to update safety capital
            if (tradingData.currentCapital >= 5000 && tradingData.safetyCapital < 5000) {
                tradingData.safetyCapital = 5000;
                // Reset grouping when safety capital updates
                tradingData.currentGroupRisk = 0;
                tradingData.currentGroupTrades = 0;
            }
            
            // After $5000 safety capital, each trade calculates risk individually
            if (tradingData.safetyCapital >= 5000) {
                return availableProfit / tradingData.riskReward;
            }
            
            // Grouping rules for trades before $5000 safety capital
            if (tradeNumber <= 2) {
                // Trades 1-2: Individual calculation
                tradingData.currentGroupRisk = availableProfit / tradingData.riskReward;
                tradingData.currentGroupTrades = 1;
                return tradingData.currentGroupRisk;
            } else if (tradeNumber <= 4) {
                // Trades 3-4: Same risk (Group 1)
                if (tradeNumber === 3) {
                    tradingData.currentGroupRisk = availableProfit / tradingData.riskReward;
                    tradingData.currentGroupTrades = 1;
                } else {
                    tradingData.currentGroupTrades = 2;
                }
                return tradingData.currentGroupRisk;
            } else if (tradeNumber <= 6) {
                // Trades 5-6: Same risk (Group 2)
                if (tradeNumber === 5) {
                    tradingData.currentGroupRisk = availableProfit / tradingData.riskReward;
                    tradingData.currentGroupTrades = 1;
                } else {
                    tradingData.currentGroupTrades = 2;
                }
                return tradingData.currentGroupRisk;
            } else if (tradeNumber <= 8) {
                // Trades 7-8: Same risk (Group 3)
                if (tradeNumber === 7) {
                    tradingData.currentGroupRisk = availableProfit / tradingData.riskReward;
                    tradingData.currentGroupTrades = 1;
                } else {
                    tradingData.currentGroupTrades = 2;
                }
                return tradingData.currentGroupRisk;
            }
            
            // Default individual calculation
            tradingData.currentGroupRisk = availableProfit / tradingData.riskReward;
            tradingData.currentGroupTrades = 1;
            return tradingData.currentGroupRisk;
        }

        // Initialize the display
        function initializeDisplay() {
            updateMetrics();
            updateNextTradePreview();
        }

        // Update all metrics
        function updateMetrics() {
            document.getElementById('currentCapital').textContent = formatCurrency(tradingData.currentCapital);
            document.getElementById('safetyCapital').textContent = formatCurrency(tradingData.safetyCapital);
            
            const totalProfit = tradingData.currentCapital - tradingData.initialCapital;
            document.getElementById('totalProfit').textContent = formatCurrency(totalProfit);
            document.getElementById('totalProfit').className = totalProfit >= 0 ? 'metric-value positive' : 'metric-value negative';
            
            // Calculate win rate
            const wins = tradingData.trades.filter(trade => trade.isWin).length;
            const totalTrades = tradingData.trades.length;
            const winRate = totalTrades > 0 ? (wins / totalTrades * 100) : 0;
            document.getElementById('winRate').textContent = winRate.toFixed(1) + '%';
        }

        // Update next trade preview
        function updateNextTradePreview() {
            const nextTradeNumber = tradingData.trades.length + 1;
            const riskCapital = calculateRiskCapital(nextTradeNumber);
            const availableProfit = tradingData.currentCapital - tradingData.safetyCapital;
            const tradeGroup = getTradeGroup(nextTradeNumber);
            
            document.getElementById('availableProfit').textContent = formatCurrency(availableProfit);
            document.getElementById('nextRiskCapital').textContent = formatCurrency(riskCapital);
            document.getElementById('nextTradeNumber').textContent = nextTradeNumber;
            document.getElementById('tradeGroup').textContent = tradeGroup;
        }

        // Execute a trade
        function executeTrade() {
            const entry = parseFloat(document.getElementById('entryPrice').value);
            const sl = parseFloat(document.getElementById('slPrice').value);
            const isWin = document.getElementById('tradeResult').value === 'win';
            
            if (isNaN(entry) || isNaN(sl)) {
                showTradeResult('❌ Please enter valid numbers for Entry and SL', 'error');
                return;
            }
            
            if (entry === sl) {
                showTradeResult('❌ Entry and Stop Loss cannot be the same!', 'error');
                return;
            }
            
            // Calculate trade parameters
            const tradeNumber = tradingData.trades.length + 1;
            const riskPips = Math.abs(entry - sl) * 10;
            const riskCapital = calculateRiskCapital(tradeNumber);
            
            const lotSize = riskCapital / (riskPips * 10);
            const pnl = isWin ? 
                lotSize * riskPips * 10 * tradingData.riskReward : 
                -lotSize * riskPips * 10;
            
            // Update capital
            const capitalBefore = tradingData.currentCapital;
            tradingData.currentCapital += pnl;
            
            // Record trade
            const trade = {
                number: tradeNumber,
                timestamp: new Date().toLocaleString(),
                entry: entry,
                sl: sl,
                riskPips: riskPips.toFixed(2),
                riskCapital: riskCapital,
                lotSize: lotSize.toFixed(2),
                pnl: pnl,
                capitalBefore: capitalBefore,
                capitalAfter: tradingData.currentCapital,
                isWin: isWin,
                result: isWin ? 'WIN' : 'LOSE',
                group: getTradeGroup(tradeNumber)
            };
            
            tradingData.trades.push(trade);
            
            // Update displays
            showTradeResult(trade);
            updateMetrics();
            updateNextTradePreview();
            updateHistoryTable();
        }

        // Show trade result
        function showTradeResult(trade) {
            const resultsDiv = document.getElementById('tradeResults');
            
            if (typeof trade === 'string') {
                // Error message
                resultsDiv.innerHTML = `<div class="trade-result trade-lose">${trade}</div>`;
                return;
            }
            
            const resultClass = trade.isWin ? 'trade-win' : 'trade-lose';
            const resultEmoji = trade.isWin ? '🎉' : '💸';
            
            let groupInfo = '';
            if (trade.group.includes('Group')) {
                groupInfo = `<div class="group-info">📊 ${trade.group} - Same Risk Capital</div>`;
            }
            
            resultsDiv.innerHTML = `
                <div class="trade-result ${resultClass}">
                    <strong>✅ Trade #${trade.number} ${trade.result} ${resultEmoji}</strong>
                </div>
                ${groupInfo}
                <div class="trade-details">
                    <h4>📈 Trade Calculations:</h4>
                    <div class="trade-detail-row">
                        <span>Risk in Pips:</span>
                        <span><strong>${trade.riskPips}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>Price Difference:</span>
                        <span><strong>${(Math.abs(trade.entry - trade.sl)).toFixed(2)}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>Risk Capital:</span>
                        <span><strong>${formatCurrency(trade.riskCapital)}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>Lot Size:</span>
                        <span><strong>${trade.lotSize}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>P&L:</span>
                        <span class="${trade.pnl >= 0 ? 'positive' : 'negative'}"><strong>${formatCurrency(trade.pnl)}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>Capital Change:</span>
                        <span><strong>${formatCurrency(trade.capitalBefore)} → ${formatCurrency(trade.capitalAfter)}</strong></span>
                    </div>
                    <div class="trade-detail-row">
                        <span>Trade Group:</span>
                        <span><strong>${trade.group}</strong></span>
                    </div>
                </div>
            `;
            
            // Show safety capital update if applicable
            if (trade.capitalAfter >= 5000 && tradingData.safetyCapital < 5000) {
                resultsDiv.innerHTML += `
                    <div class="group-info" style="background: #fff3cd; color: #856404;">
                        🎯 SAFETY CAPITAL UPDATED: $1,000 → $5,000
                    </div>
                `;
                tradingData.safetyCapital = 5000;
            }
        }

        // Update history table
        function updateHistoryTable() {
            const historyDiv = document.getElementById('historyTable');
            
            if (tradingData.trades.length === 0) {
                historyDiv.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No trades executed yet. Execute your first trade above!</p>';
                return;
            }
            
            let tableHTML = `
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Entry</th>
                            <th>SL</th>
                            <th>Risk $</th>
                            <th>Lots</th>
                            <th>P&L</th>
                            <th>Capital</th>
                            <th>Group</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            tradingData.trades.forEach(trade => {
                tableHTML += `
                    <tr>
                        <td>${trade.number}</td>
                        <td>${trade.entry}</td>
                        <td>${trade.sl}</td>
                        <td>${formatCurrency(trade.riskCapital)}</td>
                        <td>${trade.lotSize}</td>
                        <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(trade.pnl)}</td>
                        <td>${formatCurrency(trade.capitalAfter)}</td>
                        <td>${trade.group}</td>
                        <td><span class="${trade.isWin ? 'win-badge' : 'lose-badge'}">${trade.result}</span></td>
                    </tr>
                `;
            });
            
            tableHTML += '</tbody></table>';
            historyDiv.innerHTML = tableHTML;
        }

        // Reset trading data
        function resetTrading() {
            tradingData = {
                initialCapital: parseFloat(document.getElementById('initialCapital').value),
                currentCapital: parseFloat(document.getElementById('initialCapital').value),
                safetyCapital: parseFloat(document.getElementById('initialCapital').value),
                trades: [],
                riskReward: parseFloat(document.getElementById('riskReward').value),
                baseRiskPercent: parseFloat(document.getElementById('baseRisk').value) / 100,
                safetyLevels: [1000, 5000],
                currentGroupRisk: 0,
                currentGroupTrades: 0,
                groupSize: 2
            };
            
            document.getElementById('tradeResults').innerHTML = '';
            initializeDisplay();
            updateHistoryTable();
            
            // Show confirmation
            const resultsDiv = document.getElementById('tradeResults');
            resultsDiv.innerHTML = '<div class="trade-result trade-win">🔄 All trades reset successfully!</div>';
        }

        // Format currency
        function formatCurrency(amount) {
            return '$' + amount.toFixed(2);
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeDisplay();
            
            // Update configuration when inputs change
            document.getElementById('initialCapital').addEventListener('change', function() {
                tradingData.initialCapital = parseFloat(this.value);
                tradingData.currentCapital = parseFloat(this.value);
                tradingData.safetyCapital = parseFloat(this.value);
                updateMetrics();
                updateNextTradePreview();
            });
            
            document.getElementById('riskReward').addEventListener('change', function() {
                tradingData.riskReward = parseFloat(this.value);
                updateNextTradePreview();
            });
            
            document.getElementById('baseRisk').addEventListener('change', function() {
                tradingData.baseRiskPercent = parseFloat(this.value) / 100;
                updateNextTradePreview();
            });
        });

// ... rest of your JavaScript functions ...