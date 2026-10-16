# MICHELIN Dish

> A foodie's dish table. Every row gets a star rating.

```sql
CREATE TABLE michelin_dish (
  id        SERIAL PRIMARY KEY,
  dish      TEXT,
  where_    TEXT,
  stars     SMALLINT,   -- 1 to 3, like the guide
  notes     TEXT
);
```

`-- 0 rows. First entries coming soon.`

*(Placeholder: Frank, add your first dish here.)*
