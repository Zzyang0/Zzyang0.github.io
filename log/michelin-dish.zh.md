# MICHELIN Dish

> 美食爱好者的菜品表，每一行都有星级评分。

```sql
CREATE TABLE michelin_dish (
  id        SERIAL PRIMARY KEY,
  dish      TEXT,       -- 菜名
  where_    TEXT,       -- 在哪里吃到的
  stars     SMALLINT,   -- 1 到 3 星，像指南一样
  notes     TEXT        -- 心得
);
```

`-- 0 rows，首批记录即将更新。`

*（占位：Frank，在这里添加你的第一道菜。）*
