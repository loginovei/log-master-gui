# LogsApi

All URIs are relative to *http://localhost:8080/log-master*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getStats**](#getstats) | **GET** /api/logs/stats | Статистика по логам|
|[**search1**](#search1) | **GET** /api/logs | Поиск записей логов|

# **getStats**
> AppStatsDto getStats()

Возвращает счётчики по уровням, сервисам и активность за последние дни

### Example

```typescript
import {
    LogsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogsApi(configuration);

let appCode: string; //Код приложения (если не указан — по всем) (optional) (default to undefined)

const { status, data } = await apiInstance.getStats(
    appCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **appCode** | [**string**] | Код приложения (если не указан — по всем) | (optional) defaults to undefined|


### Return type

**AppStatsDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **search1**
> PageDtoLogEntryResponse search1()

Постраничный поиск с фильтрами по приложению, коду лога, уровню и временному диапазону

### Example

```typescript
import {
    LogsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogsApi(configuration);

let appCode: string; //Код приложения (optional) (default to undefined)
let logCode: string; //Код шаблона лога (optional) (default to undefined)
let level: string; //Уровень лога (optional) (default to undefined)
let from: string; //Начало периода (ISO 8601) (optional) (default to undefined)
let to: string; //Конец периода (ISO 8601) (optional) (default to undefined)
let page: number; //Номер страницы (с 0) (optional) (default to 0)
let size: number; //Размер страницы (optional) (default to 20)

const { status, data } = await apiInstance.search1(
    appCode,
    logCode,
    level,
    from,
    to,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **appCode** | [**string**] | Код приложения | (optional) defaults to undefined|
| **logCode** | [**string**] | Код шаблона лога | (optional) defaults to undefined|
| **level** | [**string**] | Уровень лога | (optional) defaults to undefined|
| **from** | [**string**] | Начало периода (ISO 8601) | (optional) defaults to undefined|
| **to** | [**string**] | Конец периода (ISO 8601) | (optional) defaults to undefined|
| **page** | [**number**] | Номер страницы (с 0) | (optional) defaults to 0|
| **size** | [**number**] | Размер страницы | (optional) defaults to 20|


### Return type

**PageDtoLogEntryResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

