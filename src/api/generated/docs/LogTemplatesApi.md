# LogTemplatesApi

All URIs are relative to *http://localhost:8080/log-master*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**_delete**](#_delete) | **DELETE** /api/templates/{logCode} | Удалить шаблон|
|[**create**](#create) | **POST** /api/templates | Создать шаблон|
|[**findAll**](#findall) | **GET** /api/templates | Постраничный список шаблонов|
|[**search**](#search) | **GET** /api/templates/search | Полнотекстовый поиск шаблонов|
|[**update**](#update) | **PUT** /api/templates/{logCode} | Обновить шаблон|

# **_delete**
> _delete()


### Example

```typescript
import {
    LogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogTemplatesApi(configuration);

let logCode: string; //Код шаблона лога (default to undefined)

const { status, data } = await apiInstance._delete(
    logCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **logCode** | [**string**] | Код шаблона лога | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **create**
> LogTemplateResponse create(logTemplateRequest)


### Example

```typescript
import {
    LogTemplatesApi,
    Configuration,
    LogTemplateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LogTemplatesApi(configuration);

let logTemplateRequest: LogTemplateRequest; //

const { status, data } = await apiInstance.create(
    logTemplateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **logTemplateRequest** | **LogTemplateRequest**|  | |


### Return type

**LogTemplateResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findAll**
> PageDtoLogTemplateResponse findAll()

Возвращает шаблоны с опциональной фильтрацией по приложению

### Example

```typescript
import {
    LogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogTemplatesApi(configuration);

let appCode: string; //Код приложения для фильтрации (optional) (default to undefined)
let page: number; //Номер страницы (с 0) (optional) (default to 0)
let size: number; //Размер страницы (optional) (default to 20)

const { status, data } = await apiInstance.findAll(
    appCode,
    page,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **appCode** | [**string**] | Код приложения для фильтрации | (optional) defaults to undefined|
| **page** | [**number**] | Номер страницы (с 0) | (optional) defaults to 0|
| **size** | [**number**] | Размер страницы | (optional) defaults to 20|


### Return type

**PageDtoLogTemplateResponse**

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

# **search**
> Array<LogTemplateResponse> search()

Ищет по коду шаблона и текстам сообщений на всех языках

### Example

```typescript
import {
    LogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new LogTemplatesApi(configuration);

let appCode: string; //Код приложения для фильтрации (optional) (default to undefined)
let q: string; //Поисковый запрос (часть кода или текста сообщения) (optional) (default to undefined)

const { status, data } = await apiInstance.search(
    appCode,
    q
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **appCode** | [**string**] | Код приложения для фильтрации | (optional) defaults to undefined|
| **q** | [**string**] | Поисковый запрос (часть кода или текста сообщения) | (optional) defaults to undefined|


### Return type

**Array<LogTemplateResponse>**

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

# **update**
> LogTemplateResponse update(logTemplateRequest)


### Example

```typescript
import {
    LogTemplatesApi,
    Configuration,
    LogTemplateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new LogTemplatesApi(configuration);

let logCode: string; //Код шаблона лога (default to undefined)
let logTemplateRequest: LogTemplateRequest; //

const { status, data } = await apiInstance.update(
    logCode,
    logTemplateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **logTemplateRequest** | **LogTemplateRequest**|  | |
| **logCode** | [**string**] | Код шаблона лога | defaults to undefined|


### Return type

**LogTemplateResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

