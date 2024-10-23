export enum BaseURL {
    Media = "MEDIA_URL",
}

export enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

interface FetcherRequest {
    baseUrl: BaseURL;
    path: string;
    method: Method;
    request?: BodyInit;
}

interface FetcherResponse<T> {
    response: T | null;
    error: any;
}

const fetcher = async <T>({
    baseUrl,
    path,
    method,
    request,
}: FetcherRequest): Promise<FetcherResponse<T>> => {
    const url = `${Deno.env.get(baseUrl)}${path}`;
    try {
        const response = await fetch(url, {
            method,
            ...(request && { body: request }),
        });
        const jsonData = await response.json();
        return {
            response: jsonData,
            error: null,
        };
    } catch (error) {
        return {
            response: null,
            error,
        };
    }
};

export default fetcher;
