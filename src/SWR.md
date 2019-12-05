## SWR 

> React Hooks library for remote data fetching

一个用于请求远程数据的React Hooks库

###  为什么用 Hooks 取数
因为 Hooks 可以触达 UI 生命周期，取数本质上是UI展示或交互的一个环节。 用 Hooks 取数的形式如下:
```js
import useSWR from "swr";

function Profile() {
  const { data, error } = useSWR("/api/user", fetcher);

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;
  return <div>hello {data.name}!</div>;
}
```

以同步写法描述了异步逻辑，这是因为渲染被执行了两次
useSWR 接收三个参数，第一个参数是取数 key，这个 key 会作为第二个参数 fetcher 的第一个参数传入，普通场景下为 URL，第三个参数是配置项。

Hooks的威力还不仅如此，上面短短几行代码还自带如下特性：
+ 可自动刷新。
+ 组件被销毁再渲染时优先启用本地缓存。
+ 在列表页中浏览器回退可以自动记忆滚动条位置。
+ tabs 切换时，被 focus 的 tab 会重新取数。
当然，自动刷新或重新取数也不一定是我们想要的，swr允许自定义配置

> 可以配置的有：suspense 模式、focus 重新取数、重新取数间隔/是否开启、失败是否重新取数、timeout、取数成功/失败/重试时的回调函数等等。

> 第二个参数如果是 object 类型，则效果为配置项，第二个 fetcher 只是为了方便才提供的，在 object 配置项里也可以配置 fetcher。

...

### 一些特点

#### 缓存
加载页面时暂时以上一次数据替换取数结果，即初始化数据从缓存中获取，没有缓存则会立即触发取数逻辑

```js
// useHydration表示是否为初次加载
const shouldReadCache = config.suspense || !useHydration();

// stale: get from cache
let [data, setData] = useState(
  (shouldReadCache ? cacheGet(key) : undefined) || config.initialData
);
```

#### 依赖请求
...

#### 支持suspense
... 



### 一些细节


#### 非阻塞
请求时机是在浏览器空闲时间
```js
window["requestIdleCallback"](softRevalidate);
```

并且默认将2s内参数相同的请求取消
```js
const softRevalidate = () => revalidate({ dedupe: true });
```

#### 兼容性上
为了将请求时机提前，放在了UI渲染前并且兼容了服务端渲染
```js
const useIsomorphicLayoutEffect = IS_SERVER ? useEffect : useLayoutEffect;
```

