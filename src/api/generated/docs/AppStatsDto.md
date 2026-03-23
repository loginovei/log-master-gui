# AppStatsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalTemplates** | **number** |  | [optional] [default to undefined]
**totalEntries** | **number** |  | [optional] [default to undefined]
**entriesPerLevel** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**entriesPerService** | **{ [key: string]: number; }** |  | [optional] [default to undefined]
**recentActivity** | [**Array&lt;DailyActivity&gt;**](DailyActivity.md) |  | [optional] [default to undefined]

## Example

```typescript
import { AppStatsDto } from './api';

const instance: AppStatsDto = {
    totalTemplates,
    totalEntries,
    entriesPerLevel,
    entriesPerService,
    recentActivity,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
