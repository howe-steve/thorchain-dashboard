document.addEventListener('DOMContentLoaded', () => {
    const APIs = {
        THORChain: 'https://midgard.thorswap.net/v2/',
        MAYAChain: 'https://midgard.mayachain.info/v2/'
    };

    let initialOrder = [];
    let currentSortField = null;
    let currentSortAscending = true;

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

    const getFavorites = () => {
        return JSON.parse(localStorage.getItem('favorites')) || [];
    };

    const toggleFavorite = (asset) => {
        const favorites = getFavorites();
        const index = favorites.indexOf(asset);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(asset);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };

    const isFavorite = (asset) => {
        return getFavorites().includes(asset);
    };

    const sortPools = (field = null, ascending = true) => {
        currentSortField = field;
        currentSortAscending = ascending;
        
        const poolsContainer = document.getElementById('pools-container');
        const cards = Array.from(poolsContainer.children);

        cards.sort((a, b) => {
            const isAFavorite = isFavorite(a.dataset.asset);
            const isBFavorite = isFavorite(b.dataset.asset);

            // Always sort by favorites first
            if (isAFavorite !== isBFavorite) {
                return isAFavorite ? -1 : 1;
            }

            // If no field specified, use initial order
            if (!field) {
                return initialOrder.indexOf(a.dataset.asset) - initialOrder.indexOf(b.dataset.asset);
            }

            // If both are favorites or both are not favorites, sort by the specified field
            let valueA, valueB;
            if (field === 'status') {
                valueA = a.dataset.status.toLowerCase();
                valueB = b.dataset.status.toLowerCase();
                const comparison = valueA.localeCompare(valueB);
                return ascending ? comparison : -comparison;
            } else {
                valueA = parseFloat(a.dataset[field]) || 0;
                valueB = parseFloat(b.dataset[field]) || 0;
                const comparison = valueA - valueB;
                
                // If values are equal, use initial order
                if (comparison === 0) {
                    return initialOrder.indexOf(a.dataset.asset) - initialOrder.indexOf(b.dataset.asset);
                }
                
                return ascending ? comparison : -comparison;
            }
        });

        poolsContainer.innerHTML = '';
        cards.forEach(card => poolsContainer.appendChild(card));
    };

    const createPoolStats = (pool, chain) => {
        const poolStats = document.createElement('div');
        poolStats.className = 'pool-stats';
        poolStats.style.position = 'relative';
    
        // Format numbers with proper scaling (1e8)
        const formatValue = (value, nativeDecimal) => {
            if (value == null) return 'N/A';

            if (nativeDecimal === 8) {
                // Assume value is already in the correct scale
                return value.toLocaleString('en-US');
            } else {
                // Ensure nativeDecimal is a valid number and not zero
                nativeDecimal = typeof nativeDecimal === 'number' && nativeDecimal !== 0 ? nativeDecimal : 1;

                // Scale the value appropriately
                const scaledValue = value / nativeDecimal;

                // Check for non-finite values
                if (!isFinite(scaledValue)) {
                    console.warn(`Non-finite value detected: ${scaledValue}`);
                    return 'N/A';
                }

                // Format the scaled value with commas
                return scaledValue.toLocaleString('en-US');
            }
        };
             
        
    
        const formatPercentage = (value) => {
            return value != null ? (value * 100).toLocaleString('en-US') + '%' : 'N/A';
        };
    
        const topStats = document.createElement('div');
        topStats.className = 'stats-top';
        const topStatsData = [
            { label: 'Asset Depth', value: (pool.assetDepth / 1e8).toLocaleString('en-US') },
            { label: 'Rune Depth', value: (pool.runeDepth / 1e8).toLocaleString('en-US') }
        ];
    
        const leftColumn = document.createElement('div');
        leftColumn.className = 'stats-column';
        const leftStats = [
            { label: 'APR', value: `${Number(pool.poolAPY).toFixed(2).toLocaleString('en-US')}%` },
            { label: 'Total Value (USD)', value: `$${(pool.assetPriceUSD * pool.assetDepth / 1e8).toLocaleString('en-US')}` },
            { label: '24-hour Volume', value: `${Number(pool.volume24h / 1e8).toLocaleString('en-US')}` },
            { label: '30-day APR', value: `${Number(pool.annualPercentageRate).toFixed(2).toLocaleString('en-US')}%` },
            { label: 'Earnings', value: `${Number(pool.earnings).toFixed(2).toLocaleString('en-US')}%` },
            { label: 'Earnings (Annual % of Depth)', value: formatPercentage(pool.earningsAnnualAsPercentOfDepth) }
        ];
    
        const rightColumn = document.createElement('div');
        rightColumn.className = 'stats-column';
        const rightStats = [
            { label: 'Liquidity Units', value: `${Number(pool.liquidityUnits).toLocaleString('en-US')}` },
            { label: 'Synth Supply', value: `${Number(pool.synthSupply / 1e8).toLocaleString('en-US')}` },
            { label: 'Synth Units', value: `${Number(pool.synthUnits / 1e8).toLocaleString('en-US')}` },
            { label: 'Savers APR', value: `${Number(pool.saversAPR).toFixed(2).toLocaleString('en-US')}%` },
            { label: 'Savers Depth', value: `${Number(pool.saversDepth / 1e8).toLocaleString('en-US')}` },
            { label: 'Savers Units', value: `${Number(pool.saversUnits / 1e8).toLocaleString('en-US')}` },

        ];
    
        const bottomStats = document.createElement('div');
        bottomStats.className = 'stats-bottom';
        const assetPriceLabel = chain === 'THORChain' ? 'Asset Price (Rune)' : 'Asset Price (Cacao)';
        const bottomStatsData = [
            { label: 'Status', value: pool.status },
            { label: 'Asset Price (Rune)', value: `${Number(pool.assetPrice).toFixed(2).toLocaleString('en-US')}` },
            { label: 'Asset Price (USD)', value: `$${Number(pool.assetPriceUSD).toFixed(2).toLocaleString('en-US')}` },
            { label: 'Synth Risk Score', value: 
                pool.synthUnits === 0 ? 'N/A' : 
                (pool.synthSupply / pool.synthUnits).toFixed(2)
            }
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
        card.dataset.asset = pool.asset;
        card.style.position = 'relative';

        const favoriteIcon = document.createElement('span');
        favoriteIcon.className = 'favorite-icon';
        favoriteIcon.textContent = isFavorite(pool.asset) ? '★' : '☆';
        favoriteIcon.style.fontSize = '2.4rem';
        favoriteIcon.style.position = 'absolute';
        favoriteIcon.style.right = '1.5rem';
        favoriteIcon.style.top = '1.5rem';
        favoriteIcon.style.cursor = 'pointer';
        favoriteIcon.style.zIndex = '1';
        
        favoriteIcon.addEventListener('click', () => {
            toggleFavorite(pool.asset);
            favoriteIcon.textContent = isFavorite(pool.asset) ? '★' : '☆';
            sortPools(currentSortField, currentSortAscending);
        });

        Object.entries({
            poolAPY: pool.poolAPY || 0,
            totalValueUSD: (pool.assetPriceUSD * pool.assetDepth) / 1e8 || 0,
            volume24h: pool.volume24h || 0,
            annualPercentageRate: pool.annualPercentageRate || 0,
            earnings: pool.earnings || 0,
            earningsAnnualAsPercentOfDepth: pool.earningsAnnualAsPercentOfDepth || 0,
            liquidityUnits: pool.liquidityUnits || 0,
            synthSupply: pool.synthSupply || 0,
            synthUnits: pool.synthUnits || 0,
            saversAPR: pool.saversAPR || 0,
            saversDepth: pool.saversDepth || 0,
            saversUnits: pool.saversUnits || 0,
            assetPrice: pool.assetPrice || 0,
            assetPriceUSD: pool.assetPriceUSD || 0,
            status: pool.status.toLowerCase()
        }).forEach(([key, value]) => {
            card.dataset[key] = value;
        });

        card.appendChild(favoriteIcon);
        card.appendChild(createPoolInfo(pool, chain));
        card.appendChild(createPoolStats(pool, chain));
        container.appendChild(card);
    };

    const getAssetImage = (asset, chain) => {
        const images = {
            THORChain: '/images/thor.png',
            MAYAChain: '/images/maya.png'
        };
        return images[chain] || 'https://via.placeholder.com/40';
    };

    // const formatNumber = (num, maximumFractionDigits = 2) => 
    //     Number(num).toLocaleString('en', { maximumFractionDigits });

    const formatPercentage = (num) => `${(num * 100).toFixed(2)}%`;

    const safeFormatPercentage = (value) => 
        value != null ? formatPercentage(value) : 'N/A';

    const calculateSynthRiskScore = (synthSupply, synthUnits) => {
        if (synthUnits === 0) return 'N/A';
        const riskScore = synthSupply / synthUnits;
        return riskScore.toFixed(2);
    };

    document.getElementById('sortField').addEventListener('change', (e) => {
        const field = e.target.value;
        const ascending = document.getElementById('sortAsc').classList.contains('active');
        sortPools(field, ascending);
    });

    document.getElementById('sortAsc').addEventListener('click', (e) => {
        const field = document.getElementById('sortField').value;
        e.target.classList.add('active');
        document.getElementById('sortDesc').classList.remove('active');
        sortPools(field, true);
    });

    document.getElementById('sortDesc').addEventListener('click', (e) => {
        const field = document.getElementById('sortField').value;
        e.target.classList.add('active');
        document.getElementById('sortAsc').classList.remove('active');
        sortPools(field, false);
    });

    const populateDashboard = async () => {
        const poolsContainer = document.getElementById('pools-container');
        const chains = Object.keys(APIs);

        for (const chain of chains) {
            const pools = await fetchData(APIs[chain], 'pools');
            if (pools) {
                pools.forEach(pool => createPoolCard(pool, chain, poolsContainer));
                initialOrder = Array.from(poolsContainer.children).map(card => card.dataset.asset);
                sortPools();
            }
        }
    };

    populateDashboard();
});