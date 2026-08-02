---
title: Leetcode一百题重刷——两数之和
date: '2026-03-26 07:00:00'
tags:
- leetcode
mood: ''
cover: https://img.cdn1.vip/i/6a6f1af4b6cdb_1785666292.webp
description: 一篇简单的算法记录，记录了关于leecode hot100开篇之经典！拉开了无数人算法之程的序幕！
---

## **两数之和**

**解题思路：** 核心思想依然是“边遍历，边查表”。我们维护一个哈希表，里面记录的是“已经遍历过的数字”以及“它们的下标”。对于每一个当前遍历到的数字 `nums[i]`，我们去表中寻找是否存在一个数字等于 `target - nums[i]`。如果有，直接返回两者的下标；如果没有，就把当前数字和下标登记到表中。

```
class 两数之和 {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        map<int, int> m;
        for(int i = 0;i<nums.size();i++){
            int mid = target - nums[i];
            if(m.find(mid) != m.end()) {
                return {m.find(mid)->second,i};
            }
            else {
                m[nums[i]] = i;
            }
        }
        return {};
    }
};
```

## **函数调用差异点**

1. HashMap 变成了 `unordered_map`
2. **Java**: `Map<Integer, Integer> map = new HashMap<>();（此处我倒是用map）`
3. **C++**: `unordered_map<int, int> m;`
4. `containsKey()` 变成了 `find() != end()`
5. **Java**: `if (map.containsKey(mid))`
6. **C++**: `if (m.find(mid) != m.end())` 或者 `if (m.count(mid))`
7. **⚠️ 避坑提醒**：C++ 没有直接的 `containsKey`。`find()` 返回的是一个“激光笔”（迭代器），你要判断这个激光笔是不是指到了表尾之外的虚无空间（`end()`）。
8. 获取 Value：`get()` 变成了 `it->second`
9. **Java**: `int val = map.get(key);`
10. **C++**: `int val = it->second;` (如果已经 find 到了) 或者 `m[key]`
11. **⚠️ 避坑提醒**：用 `find()` 找到目标后，一定要用 `->second` 把值取出来。C++ 的哈希表里存的是成对的数据（pair），`first` 是键，`second` 是值。
12. 返回数组：`new int[]{...}` 变成了 `{...}`
13. **Java**: `return new int[]{a, b};`
14. **C++**: `return {a, b};`
15. **⚠️ 避坑提醒**：C++11 引入了列表初始化 `{}`。不需要再像 Java 那样`new` 一个数组出来，只要外层函数规定了返回 `vector<int>`，直接 `return {变量1, 变量2}`，编译器会自动打包好。
16. 增强 for 循环的隐藏开销
17. **Java**: `for (int x : nums)`
18. **C++**: `for (const auto& x : nums)`
19. **⚠️ 避坑提醒**：Java 里基本类型传值，对象传引用，这都是底层安排好的。但 C++ 给了选择权。如果不加 `&`（写成 `auto x`），C++ 会死板地把每个东西都复制一份。为了追求极致性能，遍历时随手加上 `&` 是一定要养成的肌肉记忆。

未找到相关的 [Issues](https://github.com/heiehiehi/XHSBlogComment/issues) 进行评论

‍