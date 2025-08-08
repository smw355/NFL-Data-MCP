#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { NFLDataManager } from './nfl-data-manager.js';
class NFLDataMCPServer {
    server;
    dataManager;
    constructor() {
        this.server = new Server({
            name: 'nfl-data-server',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.dataManager = new NFLDataManager();
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_player_stats',
                        description: 'Get season statistics for a specific player by name and position',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                player_name: {
                                    type: 'string',
                                    description: 'Player name to search for',
                                },
                                position: {
                                    type: 'string',
                                    enum: ['QB', 'RB', 'WR', 'TE', 'DB', 'LB', 'DL', 'K'],
                                    description: 'Player position (QB, RB, WR, TE, DB, LB, DL, K)',
                                },
                                year: {
                                    type: 'number',
                                    description: 'Season year (2015-2024)',
                                    minimum: 2015,
                                    maximum: 2024,
                                },
                            },
                            required: ['player_name', 'position'],
                        },
                    },
                    {
                        name: 'compare_players',
                        description: 'Compare statistics between multiple players',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                players: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            position: {
                                                type: 'string',
                                                enum: ['QB', 'RB', 'WR', 'TE', 'DB', 'LB', 'DL', 'K']
                                            },
                                        },
                                        required: ['name', 'position'],
                                    },
                                    description: 'Array of players to compare',
                                },
                                year: {
                                    type: 'number',
                                    description: 'Season year (2015-2024)',
                                    minimum: 2015,
                                    maximum: 2024,
                                },
                                metrics: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: 'Specific metrics to compare (optional)',
                                },
                            },
                            required: ['players'],
                        },
                    },
                    {
                        name: 'get_position_leaders',
                        description: 'Get top performers at a position for specific metrics',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                position: {
                                    type: 'string',
                                    enum: ['QB', 'RB', 'WR', 'TE', 'DB', 'LB', 'DL', 'K'],
                                    description: 'Player position',
                                },
                                metric: {
                                    type: 'string',
                                    description: 'Statistic to rank by (e.g., passing_yards, rushing_yards, etc.)',
                                },
                                year: {
                                    type: 'number',
                                    description: 'Season year (2015-2024)',
                                    minimum: 2015,
                                    maximum: 2024,
                                },
                                limit: {
                                    type: 'number',
                                    description: 'Number of top players to return',
                                    default: 10,
                                },
                            },
                            required: ['position', 'metric'],
                        },
                    },
                    {
                        name: 'search_players',
                        description: 'Search for players by name pattern across all positions',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                name_pattern: {
                                    type: 'string',
                                    description: 'Player name or partial name to search for',
                                },
                                year: {
                                    type: 'number',
                                    description: 'Season year (2015-2024)',
                                    minimum: 2015,
                                    maximum: 2024,
                                },
                            },
                            required: ['name_pattern'],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_player_stats':
                        return await this.handleGetPlayerStats(args);
                    case 'compare_players':
                        return await this.handleComparePlayers(args);
                    case 'get_position_leaders':
                        return await this.handleGetPositionLeaders(args);
                    case 'search_players':
                        return await this.handleSearchPlayers(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    async handleGetPlayerStats(args) {
        const { player_name, position, year = 2024 } = args;
        const stats = await this.dataManager.getPlayerStats(player_name, position, year);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(stats, null, 2),
                },
            ],
        };
    }
    async handleComparePlayers(args) {
        const { players, year = 2024, metrics } = args;
        const comparison = await this.dataManager.comparePlayers(players, year, metrics);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(comparison, null, 2),
                },
            ],
        };
    }
    async handleGetPositionLeaders(args) {
        const { position, metric, year = 2024, limit = 10 } = args;
        const leaders = await this.dataManager.getPositionLeaders(position, metric, year, limit);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(leaders, null, 2),
                },
            ],
        };
    }
    async handleSearchPlayers(args) {
        const { name_pattern, year = 2024 } = args;
        const results = await this.dataManager.searchPlayers(name_pattern, year);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(results, null, 2),
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('NFL Data MCP Server running on stdio');
    }
}
const server = new NFLDataMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map