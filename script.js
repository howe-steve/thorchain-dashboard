// JavaScript for the Financial Dashboard
document.addEventListener('DOMContentLoaded', () => {

    const style = document.createElement('style');
    style.textContent = `
            :root {
            --primary: #094e90;
            --primary-50: rgba(9, 78, 144, 0.05);
            --primary-100: rgba(9, 78, 144, 0.1);
            --primary-200: rgba(9, 78, 144, 0.2);
            --primary-300: rgba(9, 78, 144, 0.3);
            --primary-400: rgba(9, 78, 144, 0.4);
            --primary-500: rgba(9, 78, 144, 0.5);
            --secondary: #1a73e8;
            --background: #020c1b;
            --surface: rgba(255, 255, 255, 0.05);
            --text: #e6f0ff;
            --text-muted: #8b95a5;
            --success: #059669;
            --warning: #92400e;
            --danger: #8b1c1c;
            --border: rgba(255, 255, 255, 0.1);
            --shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }

        /* Reset default styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, var(--background), var(--surface));
            color: var(--text);
            min-height: 100vh;
            padding: 2rem;
            line-height: 1.7;
        }

        /* Typography */
        .h1, .h2, .h3 {
            font-weight: 700;
            color: var(--text);
            letter-spacing: -0.025em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .h1 {
            font-size: 3rem;
            margin-bottom: 2.5rem;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .h2 {
            font-size: 2.25rem;
            margin-bottom: 1.5rem;
        }

        .h3 {
            font-size: 1.75rem;
            margin-bottom: 1rem;
        }

        /* Layout */
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .pools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        /* Pool Card Styles */
        .pool-card {
            background: linear-gradient(145deg, var(--primary-50), var(--primary-100));
            border-radius: 16px;
            padding: 1.5rem;
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            background: linear-gradient(145deg, var(--primary-50), var(--primary-100));
        }

        .pool-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 16px;
            background: linear-gradient(145deg, transparent, rgba(9, 78, 144, 0.1));
        }

        .pool-card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.3);
        }

        .pool-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            width: 100%;
            flex-wrap: wrap;
        }

        .pool-info img {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: var(--background);
            border: 1px solid var(--border);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .asset-name {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--text);
            white-space: nowrap;
        }

        .asset-amount, .rune-amount {
            font-size: 0.9rem;
            color: var(--text-muted);
            flex: 1 1 auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .pool-stats {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex-grow: 1;
            width: 100%;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0;
            font-size: 0.9rem;
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
        }

        .stat-item .stat-label {
            font-weight: 500;
        }

        .stat-item .stat-value {
            font-weight: 600;
            color: var(--text);
        }

        /* Button Styles */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
            background: linear-gradient(145deg, var(--primary), var(--secondary));
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .btn-secondary {
            background: transparent;
            color: var(--primary);
            border: 2px solid var(--primary);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .btn-secondary:hover {
            background: var(--primary-100);
            transform: scale(1.05);
        }

        /* Global styles */
        .number {
            font-family: 'Inter', monospace;
            font-weight: 500;
        }

        .percentage {
            font-family: 'Inter', monospace;
            font-weight: 600;
        }

        .text-right {
            text-align: right;
        }

        .padding-x {
            padding: 0 0.5rem;
        }
    `
    const APIs = {
        THORChain: 'https://midgard.thorswap.net/v2/',
        MAYAChain: 'https://midgard.mayachain.info/v2/'
    };

    const fetchData = async (api, endpoint) => {
        try {
            const response = await fetch(`${api}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data from ${api}${endpoint}:`, error);
            return null;
        }
    };

    const populateDashboard = async () => {
        const poolsContainer = document.getElementById('pools-container');
        const chains = Object.keys(APIs);

        for (const chain of chains) {
            const pools = await fetchData(APIs[chain], 'pools');
            if (pools) {
                pools.forEach(pool => createPoolCard(pool, chain, poolsContainer));
            }
        }

        adjustCardHeights();
    };

    const createPoolCard = (pool, chain, container) => {
        const card = document.createElement('div');
        card.className = 'pool-card';

        const poolInfo = createPoolInfo(pool, chain);
        const poolStats = createPoolStats(pool);

        card.appendChild(poolInfo);
        card.appendChild(poolStats);
        container.appendChild(card);
    };

    const createPoolInfo = (pool, chain) => {
        const poolInfo = document.createElement('div');
        poolInfo.className = 'pool-info';

        const assetImg = document.createElement('img');
        assetImg.src = getAssetImage(pool.asset, chain);
        assetImg.alt = pool.asset;
        assetImg.style.width = '60px';

        const assetName = document.createElement('div');
        const [chainPart, assetPart] = pool.asset.split('.');
        assetName.textContent = assetPart.split('-')[0].toUpperCase();
        assetName.style.width = '70%';
        assetName.style.fontSize = '1.2em';

        const assetChain = document.createElement('div');
        assetChain.textContent = `Network: ${chainPart.toUpperCase()}`;
        assetChain.style.width = '100%';

        const assetAmount = document.createElement('div');
        assetAmount.textContent = `${safeFormatNumber(pool.assetDepth)} ${assetPart.split('-')[0].toUpperCase()}`;
        assetAmount.style.width = '100%';

        const runeAmount = document.createElement('div');
        runeAmount.textContent = `${safeFormatNumber(pool.runeDepth)} RUNE`;

        poolInfo.append(assetImg, assetName, assetChain, assetAmount, runeAmount);
        return poolInfo;
    };

    const createPoolStats = (pool) => {
        const poolStats = document.createElement('div');
        poolStats.className = 'pool-stats';
    
        const stats = [
            { label: 'APR', value: safeFormatPercentage(pool.poolAPY) },
            { label: 'Total Value (USD)', value: `$${safeFormatNumber(pool.assetPriceUSD * pool.assetDepth, 1e8)}` },
            { label: '24-hour Volume', value: `$${safeFormatNumber(pool.volume24h)}` },
            { label: '30-day APR', value: safeFormatPercentage(pool.annualPercentageRate) },
            { label: 'Earnings', value: `$${safeFormatNumber(pool.earnings)}` },
            { label: 'Earnings (Annual % of Depth)', value: safeFormatPercentage(pool.earningsAnnualAsPercentOfDepth) },
            { label: 'Liquidity Units', value: safeFormatNumber(pool.liquidityUnits) },
            { label: 'Synth Supply', value: safeFormatNumber(pool.synthSupply) },
            { label: 'Synth Units', value: safeFormatNumber(pool.synthUnits) },
            { label: 'Savers APR', value: safeFormatPercentage(pool.saversAPR) },
            { label: 'Savers Depth', value: safeFormatNumber(pool.saversDepth) },
            { label: 'Savers Units', value: safeFormatNumber(pool.saversUnits) },
            { label: 'Status', value: pool.status },
            { label: 'Asset Price', value: safeFormatNumber(pool.assetPrice, 1) },
            { label: 'Asset Price (USD)', value: `$${safeFormatNumber(pool.assetPriceUSD, 1)}` }
        ];
    
        stats.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item';
            statDiv.innerHTML = `<span class="stat-label">${stat.label}</span><span class="stat-value">${stat.value}</span>`;
            poolStats.appendChild(statDiv);
        });
    
        return poolStats;
    };

    const getAssetImage = (asset, chain) => {
        const images = {
            THORChain: '/static/thor.png',
            MAYAChain: '/static/maya.png'
        };
        return images[chain] || 'https://via.placeholder.com/40';
    };

    const formatNumber = (num, maximumFractionDigits = 2) => 
        Number(num).toLocaleString('en', { maximumFractionDigits });

    const formatPercentage = (num) => `${(num * 100).toFixed(2)}%`;

    const safeFormatNumber = (value, divisor = 1e8, maximumFractionDigits = 2) => 
        value != null ? formatNumber(value / divisor, maximumFractionDigits) : 'N/A';

    const safeFormatPercentage = (value) => 
        value != null ? formatPercentage(value) : 'N/A';

    const adjustCardHeights = () => {
        const poolCards = document.querySelectorAll('.pool-card');
        const maxHeight = Array.from(poolCards).reduce((max, card) => {
            card.style.height = 'auto';
            return Math.max(max, card.scrollHeight);
        }, 0);

        poolCards.forEach(card => {
            card.style.height = `${maxHeight}px`;
            card.style.minHeight = 'auto';
            card.style.maxHeight = 'none';
        });
    };

    populateDashboard();
});