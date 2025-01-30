document.addEventListener('DOMContentLoaded', () => {
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

    const sortPools = (field, ascending = true) => {
        const poolsContainer = document.getElementById('pools-container');
        const cards = Array.from(poolsContainer.children);

        cards.sort((a, b) => {
            let valueA = parseFloat(a.dataset[field]) || 0;
            let valueB = parseFloat(b.dataset[field]) || 0;
            return ascending ? valueA - valueB : valueB - valueA;
        });

        poolsContainer.innerHTML = '';
        cards.forEach(card => poolsContainer.appendChild(card));
    };

    const createPoolStats = (pool) => {
        const poolStats = document.createElement('div');
        poolStats.className = 'pool-stats';

        const topStats = document.createElement('div');
        topStats.className = 'stats-top';
        const topStatsData = [
            { label: 'Asset Depth', value: safeFormatNumber(pool.assetDepth) },
            { label: 'Rune Depth', value: safeFormatNumber(pool.runeDepth) }
        ];

        const leftColumn = document.createElement('div');
        leftColumn.className = 'stats-column';
        const leftStats = [
            { label: 'APR', value: safeFormatPercentage(pool.poolAPY) },
            { label: 'Total Value (USD)', value: `$${safeFormatNumber(pool.assetPriceUSD * pool.assetDepth, 1e8)}` },
            { label: '24-hour Volume', value: `$${safeFormatNumber(pool.volume24h)}` },
            { label: '30-day APR', value: safeFormatPercentage(pool.annualPercentageRate) },
            { label: 'Earnings', value: `$${safeFormatNumber(pool.earnings)}` },
            { label: 'Earnings (Annual % of Depth)', value: safeFormatPercentage(pool.earningsAnnualAsPercentOfDepth) }
        ];

        const rightColumn = document.createElement('div');
        rightColumn.className = 'stats-column';
        const rightStats = [
            { label: 'Liquidity Units', value: safeFormatNumber(pool.liquidityUnits) },
            { label: 'Synth Supply', value: safeFormatNumber(pool.synthSupply) },
            { label: 'Synth Units', value: safeFormatNumber(pool.synthUnits) },
            { label: 'Savers APR', value: safeFormatPercentage(pool.saversAPR) },
            { label: 'Savers Depth', value: safeFormatNumber(pool.saversDepth) },
            { label: 'Savers Units', value: safeFormatNumber(pool.saversUnits) }
        ];

        const bottomStats = document.createElement('div');
        bottomStats.className = 'stats-bottom';
        const bottomStatsData = [
            { label: 'Status', value: pool.status },
            { label: 'Asset Price', value: safeFormatNumber(pool.assetPrice, 1) },
            { label: 'Asset Price (USD)', value: `$${safeFormatNumber(pool.assetPriceUSD, 1)}` },
            { label: 'Risk Score', value: calculateRiskScore(pool.synthSupply, pool.synthUnits) }
        ];

        const createStatItems = (stats, container) => {
            stats.forEach(stat => {
                const statDiv = document.createElement('div');
                statDiv.className = 'stat-item';
                statDiv.innerHTML = `<span class="stat-label">${stat.label}</span><span class="stat-value">${stat.value}</span>`;
                container.appendChild(statDiv);
            });
        };

        createStatItems(topStatsData, topStats);
        createStatItems(leftStats, leftColumn);
        createStatItems(rightStats, rightColumn);
        createStatItems(bottomStatsData, bottomStats);

        poolStats.appendChild(topStats);
        poolStats.appendChild(leftColumn);
        poolStats.appendChild(rightColumn);
        poolStats.appendChild(bottomStats);

        return poolStats;
    };

    const createPoolInfo = (pool, chain) => {
        console.log(pool)
        const poolInfo = document.createElement('div');
        poolInfo.className = 'pool-info';

        const assetImg = document.createElement('img');
        assetImg.src = getAssetImage(pool.asset, chain);
        assetImg.alt = pool.asset;

        const assetName = document.createElement('div');
        const [chainPart, assetPart] = pool.asset.split('.');
        assetName.textContent = `${assetPart.split('-')[0].toUpperCase()} (${chainPart})`;
        assetName.className = 'asset-name';

        poolInfo.append(assetImg, assetName);
        return poolInfo;
    };

    const createPoolCard = (pool, chain, container) => {
        const card = document.createElement('div');
        card.className = 'pool-card';

        // Calculate and store risk score as a data attribute
        const riskScore = calculateRiskScore(pool.synthSupply, pool.synthUnits);
        card.dataset.riskScore = riskScore;

        // Store sorting values as data attributes
        card.dataset.poolAPY = pool.poolAPY || 0;
        card.dataset.totalValueUSD = pool.assetPriceUSD * pool.assetDepth / 1e8 || 0;
        card.dataset.volume24h = pool.volume24h / 1e8 || 0;
        card.dataset.annualPercentageRate = pool.annualPercentageRate || 0;
        card.dataset.earnings = pool.earnings / 1e8 || 0;
        card.dataset.earningsAnnualAsPercentOfDepth = pool.earningsAnnualAsPercentOfDepth || 0;
        card.dataset.liquidityUnits = pool.liquidityUnits / 1e8 || 0;
        card.dataset.synthSupply = pool.synthSupply / 1e8 || 0;
        card.dataset.synthUnits = pool.synthUnits / 1e8 || 0;
        card.dataset.saversAPR = pool.saversAPR || 0;
        card.dataset.saversDepth = pool.saversDepth / 1e8 || 0;
        card.dataset.saversUnits = pool.saversUnits / 1e8 || 0;
        card.dataset.assetPrice = pool.assetPrice / 1e8 || 0;
        card.dataset.assetPriceUSD = pool.assetPriceUSD || 0;

        const poolInfo = createPoolInfo(pool, chain);
        const poolStats = createPoolStats(pool);

        card.appendChild(poolInfo);
        card.appendChild(poolStats);
        container.appendChild(card);
    };

    const getAssetImage = (asset, chain) => {
        const images = {
            THORChain: '/images/thor.png',
            MAYAChain: '/images/maya.png'
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

    const calculateRiskScore = (synthSupply, synthUnits) => {
        if (synthUnits === 0) return 'N/A';
        const riskScore = synthSupply / synthUnits;
        return riskScore.toFixed(2);
    };

    // Set up sorting event listeners
    document.getElementById('sortField').addEventListener('change', (e) => {
        const field = e.target.value;
        const ascending = document.getElementById('sortAsc').classList.contains('active');
        if (field) {
            sortPools(field, ascending);
        }
    });

    document.getElementById('sortAsc').addEventListener('click', (e) => {
        const field = document.getElementById('sortField').value;
        if (field) {
            e.target.classList.add('active');
            document.getElementById('sortDesc').classList.remove('active');
            sortPools(field, true);
        }
    });

    document.getElementById('sortDesc').addEventListener('click', (e) => {
        const field = document.getElementById('sortField').value;
        if (field) {
            e.target.classList.add('active');
            document.getElementById('sortAsc').classList.remove('active');
            sortPools(field, false);
        }
    });

    const populateDashboard = async () => {
        const poolsContainer = document.getElementById('pools-container');
        const chains = Object.keys(APIs);

        for (const chain of chains) {
            const pools = await fetchData(APIs[chain], 'pools');
            if (pools) {
                pools.forEach(pool => createPoolCard(pool, chain, poolsContainer));
            }
        }
    };

    populateDashboard();
});