interface ImageData {
    id: string,
    bildname: string,
    position: string
}

const http = async <T>(request: RequestInfo): Promise<T> => {
    const response = await fetch(request);
    const body = await response.json();
    return body;
};


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
    private _numErrors: number;
    private _numberQueried: number;

    private _cache: HTMLImageElement[];

    private _index: number;

    constructor(urls: string[], stepSize: number)
    {
        this._allUrls = urls;
        this.StepSize = stepSize;
        this.UrlsPreloaded = [];
        this._numberFetching = 0;
        this._numErrors = 0;
        this._numberQueried = 0;
        this._cache = [];
        this._index = 0;

        this.load();
    }

    public GetNext()
    {
        if (this.shouldLoadMore())
            this.load();

        const alreadyLoaded = this.UrlsPreloaded.length;
        if (alreadyLoaded === 0)
            return null;

        this._index = (this._index + 1) % alreadyLoaded;
        this._numberQueried++;
        return this.UrlsPreloaded[this._index];
    }

    public async LoadFirst()
    {
        const firstUrl = this._allUrls[0];
        await this.preloadImage(firstUrl);
        return firstUrl;
    }

    private shouldLoadMore()
    {
        const target = this._numberQueried + this._numErrors + this.StepSize;
        return this._numberFetching < Math.min(this._allUrls.length, target);
    }

    private async load()
    {
        for (let i = 0; i < this.StepSize; ++i)
        {
            if (this._numberFetching === this._allUrls.length)
                return;

            const url = this._allUrls[this._numberFetching++];
            this.preloadImage(url).then(() => { this.UrlsPreloaded.push(url); })
                                  .catch(() => { ++this._numErrors; });
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
    private static readonly _highResIdAPI = "/randydiary/api/pictures";
    private static readonly _lowResIdAPI = "/randydiary/api/lowRes/pictures";

    //private static readonly _highResAPI = "/folio/pics"
    private static readonly _highResAPI = "https://c-hasselbusch.de/folio/pics"

    // As above but those same Ids return the same picture in a lower
    // resolution for faster loading.
    private static readonly _lowResAPI = "https://c-hasselbusch.de/folio/lowRes";

    private _highResCache: ImagePreLoader | null;
    private _lowResCache: ImagePreLoader | null;

    constructor()
    {
        this._highResCache = null;
        this._lowResCache = null;
    }

    public async LoadFirstImage()
    {
        this.getLowResImageIds().then(data => {
            const lowResUrls = data.map(imgData => DualImageLoader._lowResAPI + "/" + imgData.bildname);
            this._lowResCache = new ImagePreLoader(lowResUrls, 25);
        });

        return this.getHighResImageIds().then(data => {
            const highResUrls = data.map(imgData => DualImageLoader._highResAPI + "/" + imgData.bildname);
            this._highResCache = new ImagePreLoader(highResUrls, 10);
            return this._highResCache.LoadFirst();
        });
    }

    public GetNextHighRes()
    {
        if (this._highResCache === null)
            return null;
        return this._highResCache.GetNext();
    }

    public GetNextLowRes()
    {
        if (this._lowResCache === null)
            return null;
        return this._lowResCache.GetNext();
    }

    private getHighResImageIds()
    {
        return http<ImageData[]>(DualImageLoader._highResIdAPI);
    }

    private getLowResImageIds()
    {
        return http<ImageData[]>(DualImageLoader._lowResIdAPI);
    }
}