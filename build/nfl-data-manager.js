import fetch from 'node-fetch';
export class NFLDataManager {
    baseUrl = 'https://raw.githubusercontent.com/hvpkod/NFL-Data/main/NFL-data-Players';
    cache = new Map();
    getCacheKey(position, year) {
        return `${position}_${year}`;
    }
    async fetchPositionData(position, year) {
        const cacheKey = this.getCacheKey(position, year);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const url = `${this.baseUrl}/${year}/${position}_season.json`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch data for ${position} ${year}: ${response.statusText}`);
            }
            const data = await response.json();
            this.cache.set(cacheKey, data);
            return data;
        }
        catch (error) {
            throw new Error(`Error fetching ${position} data for ${year}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPlayerStats(playerName, position, year = 2024) {
        try {
            const data = await this.fetchPositionData(position, year);
            const player = data.find(p => p.name?.toLowerCase().includes(playerName.toLowerCase()) ||
                p.player?.toLowerCase().includes(playerName.toLowerCase()) ||
                p.Player?.toLowerCase().includes(playerName.toLowerCase()) ||
                p.PlayerName?.toLowerCase().includes(playerName.toLowerCase()));
            if (!player) {
                return null;
            }
            return {
                name: player.name || player.player || player.Player || player.PlayerName || 'Unknown',
                position,
                stats: player
            };
        }
        catch (error) {
            throw new Error(`Failed to get player stats: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async comparePlayers(players, year = 2024, metrics) {
        try {
            const playerStats = await Promise.all(players.map(async (player) => {
                const stats = await this.getPlayerStats(player.name, player.position, year);
                return stats;
            }));
            const validPlayers = playerStats.filter(p => p !== null);
            if (validPlayers.length === 0) {
                return { error: 'No players found with the given names' };
            }
            const comparison = {
                year,
                players: validPlayers,
                comparison: {}
            };
            if (metrics && metrics.length > 0) {
                metrics.forEach(metric => {
                    comparison.comparison[metric] = validPlayers.map(player => ({
                        name: player.name,
                        position: player.position,
                        [metric]: player.stats[metric] || 'N/A'
                    }));
                });
            }
            return comparison;
        }
        catch (error) {
            throw new Error(`Failed to compare players: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getPositionLeaders(position, metric, year = 2024, limit = 10) {
        try {
            const data = await this.fetchPositionData(position, year);
            const sortedData = data
                .filter(player => player[metric] !== undefined && player[metric] !== null)
                .sort((a, b) => {
                const aValue = parseFloat(a[metric]) || 0;
                const bValue = parseFloat(b[metric]) || 0;
                return bValue - aValue; // Descending order
            })
                .slice(0, limit)
                .map((player, index) => ({
                name: player.name || player.player || player.Player || player.PlayerName || 'Unknown',
                position,
                [metric]: player[metric],
                rank: index + 1
            }));
            return sortedData;
        }
        catch (error) {
            throw new Error(`Failed to get position leaders: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async searchPlayers(namePattern, year = 2024) {
        const positions = ['QB', 'RB', 'WR', 'TE', 'DB', 'LB', 'DL', 'K'];
        const results = [];
        try {
            await Promise.all(positions.map(async (position) => {
                try {
                    const data = await this.fetchPositionData(position, year);
                    const matchingPlayers = data.filter(player => {
                        const playerName = (player.name || player.player || player.Player || player.PlayerName || '').toLowerCase();
                        return playerName.includes(namePattern.toLowerCase());
                    });
                    matchingPlayers.forEach(player => {
                        results.push({
                            name: player.name || player.player || player.Player || player.PlayerName || 'Unknown',
                            position,
                            stats: player
                        });
                    });
                }
                catch (error) {
                    // Skip positions that don't have data for this year
                    console.error(`Skipping ${position} for year ${year}: ${error}`);
                }
            }));
            return results;
        }
        catch (error) {
            throw new Error(`Failed to search players: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    clearCache() {
        this.cache.clear();
    }
}
//# sourceMappingURL=nfl-data-manager.js.map