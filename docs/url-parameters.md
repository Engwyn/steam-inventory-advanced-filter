# URL Parameters

The userscript supports filtering your Steam inventory using URL parameters. Add these parameters to the end of your inventory URL to batch-apply filters.

## Supported Parameters

| Parameter | Description                             | Example Value           |
| --------- | --------------------------------------- | ----------------------- |
| `appids`  | Filter by game AppIDs (comma-separated) | `930910,740130`         |
| `types`   | Filter by item type (comma-separated)   | `trading-card,emoticon` |
| `rarity`  | Filter by rarity (comma-separated)      | `common,rare`           |
| `border`  | Filter by card border (comma-separated) | `normal,foil`           |
| `misc`    | Filter by marketability/tradability     | `marketable,tradable`   |

## Usage Example

```
https://steamcommunity.com/id/yourname/inventory/?appids=930910,740130&types=trading-card,emoticon&rarity=rare&border=foil&misc=marketable
```

- All parameters are optional and can be combined.
- Values are case-insensitive and comma-separated.

See [filter-reference.md](filter-reference.md) for all possible values.
