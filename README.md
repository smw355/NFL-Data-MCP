# NFL Data MCP Server

A Model Context Protocol (MCP) server that provides access to NFL player performance data from 2015-2024.

## Features

- **Player Statistics**: Get detailed season stats for any player by name and position
- **Player Comparison**: Compare statistics between multiple players
- **Position Leaders**: Find top performers at each position for specific metrics
- **Player Search**: Search for players by name pattern across all positions

## Installation

```bash
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "nfl-data": {
      "command": "node",
      "args": ["/path/to/nfl-data-mcp-server/build/index.js"]
    }
  }
}
```

### Available Tools

1. **get_player_stats**
   - Get season statistics for a specific player
   - Parameters: `player_name`, `position`, `year` (optional, defaults to 2024)

2. **compare_players**
   - Compare statistics between multiple players
   - Parameters: `players` (array), `year` (optional), `metrics` (optional)

3. **get_position_leaders**
   - Get top performers at a position for specific metrics
   - Parameters: `position`, `metric`, `year` (optional), `limit` (optional, defaults to 10)

4. **search_players**
   - Search for players by name pattern
   - Parameters: `name_pattern`, `year` (optional)

### Supported Positions

- QB (Quarterbacks)
- RB (Running Backs)
- WR (Wide Receivers)
- TE (Tight Ends)
- DB (Defensive Backs)
- LB (Linebackers)
- DL (Defensive Linemen)
- K (Kickers)

### Data Source

Data is fetched from the [NFL-Data repository](https://github.com/hvpkod/NFL-Data/tree/main/NFL-data-Players) which contains player statistics from 2015-2024.

## Development

```bash
npm run dev  # Run in development mode
npm run build  # Build for production
```