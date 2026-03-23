# ApplicationsApi

All URIs are relative to *http://localhost:8080/log-master*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**create1**](#create1) | **POST** /api/applications | Зарегистрировать приложение|
|[**delete1**](#delete1) | **DELETE** /api/applications/{code} | Удалить приложение по коду|
|[**findAll1**](#findall1) | **GET** /api/applications | Список всех приложений|
|[**getByCode**](#getbycode) | **GET** /api/applications/{code} | Получить приложение по коду|

# **create1**
> ApplicationResponse create1(applicationRequest)


### Example

```typescript
import {
    ApplicationsApi,
    Configuration,
    ApplicationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new ApplicationsApi(configuration);

let applicationRequest: ApplicationRequest; //

const { status, data } = await apiInstance.create1(
    applicationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **applicationRequest** | **ApplicationRequest**|  | |


### Return type

**ApplicationResponse**

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

# **delete1**
> delete1()


### Example

```typescript
import {
    ApplicationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApplicationsApi(configuration);

let code: string; // (default to undefined)

const { status, data } = await apiInstance.delete1(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] |  | defaults to undefined|


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

# **findAll1**
> Array<ApplicationResponse> findAll1()


### Example

```typescript
import {
    ApplicationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApplicationsApi(configuration);

const { status, data } = await apiInstance.findAll1();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<ApplicationResponse>**

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

# **getByCode**
> ApplicationResponse getByCode()


### Example

```typescript
import {
    ApplicationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ApplicationsApi(configuration);

let code: string; // (default to undefined)

const { status, data } = await apiInstance.getByCode(
    code
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] |  | defaults to undefined|


### Return type

**ApplicationResponse**

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

