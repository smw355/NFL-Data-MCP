interface PlayerStats {
    [key: string]: any;
}
interface Player {
    name: string;
    position: string;
    stats: PlayerStats;
}
export declare class NFLDataManager {
    private readonly baseUrl;
    private cache;
    private getCacheKey;
    private fetchPositionData;
    getPlayerStats(playerName: string, position: string, year?: number): Promise<Player | null>;
    comparePlayers(players: {
        name: string;
        position: string;
    }[], year?: number, metrics?: string[]): Promise<any>;
    getPositionLeaders(position: string, metric: string, year?: number, limit?: number): Promise<any[]>;
    searchPlayers(namePattern: string, year?: number): Promise<Player[]>;
    clearCache(): void;
}
export {};
//# sourceMappingURL=nfl-data-manager.d.ts.map