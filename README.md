# [notebook](https://zxl20070701.github.io/notebook)
✔️ 文档笔记，包括编程、数学、计算机、英语、历史等各种常用的内容快速查询

## 如何开发？

由于本项目页面加载使用了xhr请求实现的，由于本项目页面加载使用了xhr请求实现的，因此开发的时候需要启动本地服务器：

```
npm run dev
```

启动成功以后，在浏览器直接访问即可： http://127.0.0.1:20000/

## 数学公式等

对于普通文字或特殊符号等，直接输入或复制即可，而对于类似下面的语句，可能就需要借助我们提供的特殊录入方式：

![特殊录入截图举例](https://zxl20070701.github.io/notebook/images/formula.jpeg)

非常简单，你只需要把本来输入内容的地方按照如下语法录入：

```html
<code>
    [公式生成方法名,公式对象或字符串1,公式对象或字符串2,...]
</code>
```

下面列举出所有『公式生成方法』：

- 拼接

从左到右，拼接起来。

```html
<code>
    ["join","p1","p2","p3",...]
</code>
```

- 根号

```html
<code>
    ["gen","p1"]
</code>
```

- 极限

p1表示趋向，p2是计算结果的表达式。

```html
<code>
    ["limt","p1","p2"]
</code>
```

- 求和

p1表示开始，p2是结束的值，p3是需要求和的表达式。

```html
<code>
    ["sum","p1","p2","p3"]
</code>
```

- 矩阵和行列式

p1是一个二维数组，p2默认false，表示矩阵，可选，如果是true，表示行列式。

```html
<code>
    ["matrix","p1","p2"]
</code>
```

- 除

```html
<code>
    ["division","p1","p2"]
</code>
```

- 括号

p2表示括号的类型，可选的有：small、middle、big，分别表示，小括号、中括号、大括号。

```html
<code>
    ["bracket","p1","p2"]
</code>
```

- 特殊位置

p2在右上角：

```html
<code>
    ["rightTop","p1","p2"]
</code>
```

p2在右下角：

```html
<code>
    ["rightBottom","p1","p2"]
</code>
```

- 方程组

```html
<code>
    ["equationSet","p1","p2","p3",...]
</code>
```

- 上下线

p1上面有线条：

```html
<code>
    ["upLine","p1"]
</code>
```

p1下面有线条：

```html
<code>
    ["downLine","p1"]
</code>
```

- 向量

```html
<code>
    ["vector","p1"]
</code>
```

- 绝对值

```html
<code>
    ["abs","p1"]
</code>
```

- 定积分和不定积分

p1是表达式，p2表示对谁积分，p3和p4可选，表示定积分积分范围（下、上）。

```html
<code>
    ["integral","p1","p2","p3","p4"]
</code>
```

- 可列交和可列并

可列交：

```html
<code>
    ["listedAnd","p1","p2"]
</code>
```

可列并：

```html
<code>
    ["listedOr","p1","p2"]
</code>
```

- 排列和组合

```html
<code>
    ["C","p1","p2"]
</code>
```

```html
<code>
    ["A","p1","p2"]
</code>
```

## 版权

MIT License

Copyright (c) [zxl20070701](https://zxl20070701.github.io/notebook/home.html) 走一步，再走一步