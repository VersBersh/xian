declare const Id: unique symbol;
type ImageId = string & {[Id]: true}

interface ImageData {
    ImageIds: ImageId[]
}

const http = async <T>(request: RequestInfo): Promise<T> => {
    const response = await fetch(request);
    const body = await response.json();
    return body;
};

enum Resolution
{
    High,
    Low,
}

function randInt(max: number) {
    return Math.floor(Math.random() * max);
}


/**
 *  Take an array of image urls and preload them into the browser in
 *  steps.
 */
class ImagePreLoader
{
    private _allUrls: string[];

    StepSize: number;
    UrlsPreloaded: string[];

    private _numberFetching: number;
    private _numberQueried: number;

    private _cache: HTMLImageElement[];

    constructor(urls: string[], stepSize: number)
    {
        this._allUrls = urls;
        this.StepSize = stepSize;
        this.UrlsPreloaded = [];
        this._numberFetching = 0;
        this._numberQueried = 0;
        this._cache = [];

        this.load();
    }

    public GetNext()
    {
        const alreadyLoaded = this.UrlsPreloaded.length;
        if (alreadyLoaded === 0)
            return null;

        if (this.shouldLoadMore())
            this.load();

        const index = randInt(alreadyLoaded);
        this._numberQueried++;
        return this.UrlsPreloaded[index];
    }

    private shouldLoadMore()
    {
        return this._numberFetching < Math.min(this._allUrls.length, this._numberQueried + this.StepSize);
    }

    private async load()
    {
        for (let i = 0; i < this.StepSize; ++i)
        {
            if (this._numberFetching === this._allUrls.length)
                return;

            const url = this._allUrls[this._numberFetching++];
            this.preloadImage(url).then(() => { this.UrlsPreloaded.push(url); });
        }
    }

    private preloadImage(url: string)
    {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
            this._cache.push(img);
        });
    }
}


/**
 *  Preload high and low resolutions images
 */
export class DualImageLoader
{
    // This Endpont should return a json object containing a property
    // "ImageId", which is an array of ids that enumerate all
    // available images
    private static readonly _idAPI = "/api/images";

    // This endpoint should return an image with the given id from the
    // previous endpoint. i.e. /api/image/highRes?id=<someId>
    private static readonly _highResAPI = "/api/image/highRes"

    // As above but those same Ids return the same picture in a lower
    // resolution for faster loading.
    private static readonly _lowResAPI = "/api/image/lowRes"

    private _allImageIds: ImageId[] | null;
    private _highResCache: ImagePreLoader | null;
    private _lowResCache: ImagePreLoader | null;

    constructor(maxImages: number)
    {
        console.log("new image loader");

        this._allImageIds = null;
        this._highResCache = null;
        this._lowResCache = null;

        this.getAllImageIds(maxImages).then(data => {
            const highResUrls = data.ImageIds.map(id => this.getUrl(id, Resolution.High));
            const lowResUrls = data.ImageIds.map(id => this.getUrl(id, Resolution.Low));

            this._highResCache = new ImagePreLoader(highResUrls, 10);
            this._lowResCache = new ImagePreLoader(lowResUrls, 25);
            this._allImageIds = data.ImageIds;
        });
    }

    public IsLoading() { return this._allImageIds === null; }

    public GetNextHighRes() {
        if (this._highResCache === null)
            return null;
        return this._highResCache.GetNext();
    }

    public GetNextLowRes() {
        if (this._lowResCache === null)
            return null;
        return this._lowResCache.GetNext();
    }

    private getAllImageIds(count: number)
    {
        const params = new URLSearchParams([["count", count.toString()]]);
        const url = DualImageLoader._idAPI + "?" + params;
        return http<ImageData>(url);
    }

    private getUrl(id: ImageId, res: Resolution)
    {
        const url = res === Resolution.High
            ? DualImageLoader._highResAPI
            : DualImageLoader._lowResAPI;
        return url + "?" + new URLSearchParams([["id", id]]);;
    }

    public debug() { return { h: this._highResCache, l: this._lowResCache} }
}