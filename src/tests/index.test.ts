import { readCSV, splitByEvent } from "..";

describe("readCSV", () => {
  it("gets the rows as expected", () => {
    const res = readCSV();
    expect([res[0], res[1]]).toMatchInlineSnapshot(`
Array [
  Object {
    "eventDescription": "User searched for products",
    "eventName": "Products Searched",
    "propertyDescription": "Query the user searched with",
    "propertyName": "query",
    "requiredOrOptional": "O",
    "specification": "eCommerce",
    "type": "String",
  },
  Object {
    "eventDescription": "User viewed a product list or category",
    "eventName": "Product List Viewed",
    "propertyDescription": "Product list being viewed",
    "propertyName": "list_id",
    "requiredOrOptional": "O",
    "specification": "eCommerce",
    "type": "String",
  },
]
`);
  });
});

describe("splitByEvent", () => {
  it("formats the rows as expected", () => {
    const data = readCSV();
    const res = splitByEvent(data);
    expect([res[0], res[1]]).toMatchInlineSnapshot(`
Array [
  Object {
    "description": "User searched for products",
    "name": "Products Searched",
    "properties": Array [
      Object {
        "description": "Query the user searched with",
        "name": "query",
        "required": false,
        "type": "STRING",
      },
    ],
    "specification": "ecommerce",
  },
  Object {
    "description": "User viewed a product list or category",
    "name": "Product List Viewed",
    "properties": Array [
      Object {
        "description": "Product list being viewed",
        "name": "list_id",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product category being viewed",
        "name": "category",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Products displayed in the product list",
        "name": "products",
        "required": true,
        "type": "ARRAY",
      },
      Object {
        "description": "Product ID displayed in the list",
        "name": "products.$.product_id",
        "required": true,
        "type": "STRING",
      },
      Object {
        "description": "Product SKU displayed in the list",
        "name": "products.$.sku",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product Category displayed in the list",
        "name": "products.$.category",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product Name displayed in the list",
        "name": "products.$.name",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product Brand displayed in the list",
        "name": "products.$.brand",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product Variant displayed in the list",
        "name": "products.$.variant",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Product Price displayed in the list",
        "name": "products.$.price",
        "required": false,
        "type": "FLOAT",
      },
      Object {
        "description": "Product quantity displayed in the list",
        "name": "products.$.quantity",
        "required": false,
        "type": "INTEGER",
      },
      Object {
        "description": "Coupon code associated with the product",
        "name": "products.$.coupon",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Position of product in the list",
        "name": "products.$.position",
        "required": false,
        "type": "FLOAT",
      },
      Object {
        "description": "URL of the product page for product in the list",
        "name": "products.$.url",
        "required": false,
        "type": "STRING",
      },
      Object {
        "description": "Image url of the product in the list",
        "name": "products.$.image_url",
        "required": false,
        "type": "STRING",
      },
    ],
    "specification": "ecommerce",
  },
]
`);
  });
});
